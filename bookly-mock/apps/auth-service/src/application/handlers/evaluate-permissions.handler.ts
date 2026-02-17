import { EvaluatePermissionsQuery } from "@auth/application/queries/evaluate-permissions.query";
import { PermissionService } from "@auth/application/services/permission.service";
import { UserService } from "@auth/application/services/user.service";
import { createLogger } from "@libs/common";
import { RedisService } from "@libs/redis";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";

const logger = createLogger("EvaluatePermissionsHandler");

const POLICY_VERSION = "1.0.0";

/**
 * Response for permission evaluation.
 */
export interface EvaluatePermissionsResponse {
  allowed: boolean;
  userId: string;
  resource: string;
  action: string;
  matchedRoles: string[];
  matchedPermissions: string[];
  policyVersion: string;
}

/**
 * Handler for EvaluatePermissionsQuery.
 * Resolves user roles + permissions from DB and evaluates if the requested
 * resource:action is allowed. Supports wildcard permissions (*:*).
 * Results cached in Redis for 30s.
 */
@QueryHandler(EvaluatePermissionsQuery)
export class EvaluatePermissionsHandler
  implements
    IQueryHandler<EvaluatePermissionsQuery, EvaluatePermissionsResponse>
{
  constructor(
    private readonly userService: UserService,
    private readonly permissionService: PermissionService,
    private readonly redis: RedisService,
  ) {}

  async execute(
    query: EvaluatePermissionsQuery,
  ): Promise<EvaluatePermissionsResponse> {
    const { userId, resource, action, context } = query;
    const permissionCode = `${resource}:${action}`;

    // 1. Check cache
    const cacheKey = `auth:authz:${userId}:${permissionCode}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      logger.debug("Permission evaluation cache hit", {
        userId,
        permissionCode,
      });
      return cached as EvaluatePermissionsResponse;
    }

    // 2. Resolve user from DB
    let user: any;
    try {
      user = await this.userService.getUserById(userId);
    } catch {
      logger.warn("Permission evaluation: user not found", { userId });
      return this.buildResponse(userId, resource, action, false, [], []);
    }

    if (!user.isActive) {
      logger.warn("Permission evaluation: user inactive", { userId });
      return this.buildResponse(userId, resource, action, false, [], []);
    }

    // 3. Get all permissions for the user (direct + role-based)
    const userPermissions =
      await this.permissionService.getUserPermissions(userId);
    const userRoles: string[] = user.roles || [];

    // 4. Evaluate permission
    const matchedPermissions: string[] = [];

    for (const perm of userPermissions) {
      // Exact match
      if (perm === permissionCode) {
        matchedPermissions.push(perm);
        continue;
      }
      // Wildcard: *:* (superadmin)
      if (perm === "*:*") {
        matchedPermissions.push(perm);
        continue;
      }
      // Resource wildcard: resource:*
      if (perm === `${resource}:*`) {
        matchedPermissions.push(perm);
        continue;
      }
      // Action wildcard: *:action
      if (perm === `*:${action}`) {
        matchedPermissions.push(perm);
        continue;
      }
    }

    const allowed = matchedPermissions.length > 0;

    const response = this.buildResponse(
      userId,
      resource,
      action,
      allowed,
      userRoles,
      matchedPermissions,
    );

    // 5. Cache for 30 seconds
    await this.redis.set(cacheKey, response, { key: cacheKey, ttl: 30 });

    logger.debug("Permission evaluated", {
      userId,
      permissionCode,
      allowed,
      matchedCount: matchedPermissions.length,
    });

    return response;
  }

  private buildResponse(
    userId: string,
    resource: string,
    action: string,
    allowed: boolean,
    matchedRoles: string[],
    matchedPermissions: string[],
  ): EvaluatePermissionsResponse {
    return {
      allowed,
      userId,
      resource,
      action,
      matchedRoles,
      matchedPermissions,
      policyVersion: POLICY_VERSION,
    };
  }
}
