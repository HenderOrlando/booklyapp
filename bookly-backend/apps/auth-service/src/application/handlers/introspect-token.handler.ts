import { IntrospectTokenQuery } from "@auth/application/queries/introspect-token.query";
import { PermissionService } from "@auth/application/services/permission.service";
import { UserService } from "@auth/application/services/user.service";
import { createLogger } from "@libs/common";
import { JWT_SECRET } from "@libs/common/constants";
import { RedisService } from "@libs/redis";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";

const logger = createLogger("IntrospectTokenHandler");

/**
 * Introspect Token Response
 * Authoritative user identity resolved from DB, not just JWT claims.
 */
export interface IntrospectTokenResponse {
  active: boolean;
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  is2FAEnabled: boolean;
  lastLogin?: Date;
}

/**
 * Handler for IntrospectTokenQuery.
 * Validates JWT, then resolves the full user identity from the database.
 * Results are cached in Redis for performance (TTL: 60s).
 */
@QueryHandler(IntrospectTokenQuery)
export class IntrospectTokenHandler
  implements IQueryHandler<IntrospectTokenQuery, IntrospectTokenResponse>
{
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly permissionService: PermissionService,
    private readonly redis: RedisService,
  ) {}

  async execute(query: IntrospectTokenQuery): Promise<IntrospectTokenResponse> {
    const { token } = query;

    // 1. Verify JWT signature and expiration
    let payload: any;
    try {
      payload = this.jwtService.verify(token, { secret: JWT_SECRET });
    } catch (error) {
      logger.debug("Token introspection failed: invalid/expired token");
      return { active: false } as IntrospectTokenResponse;
    }

    const userId = payload.sub;
    if (!userId) {
      return { active: false } as IntrospectTokenResponse;
    }

    // 2. Check cache first
    const cacheKey = `auth:introspect:${userId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      logger.debug("Introspect cache hit", { userId });
      return cached as IntrospectTokenResponse;
    }

    // 3. Resolve from DB
    try {
      const user = await this.userService.getUserById(userId);
      const permissions =
        await this.permissionService.getUserPermissions(userId);

      const response: IntrospectTokenResponse = {
        active: user.isActive,
        sub: userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles || [],
        permissions,
        isActive: user.isActive,
        is2FAEnabled: !!(user as any).twoFactorEnabled,
        lastLogin: (user as any).lastLogin,
      };

      // 4. Cache for 60 seconds
      await this.redis.set(cacheKey, response, { key: cacheKey, ttl: 60 });

      logger.debug("Token introspected from DB", {
        userId,
        roles: response.roles.length,
      });

      return response;
    } catch (error) {
      logger.warn("Token introspection failed: user not found", { userId });
      return { active: false } as IntrospectTokenResponse;
    }
  }
}
