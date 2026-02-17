import { UserService } from "@auth/application/services/user.service";
import { AuthCacheService } from "@auth/infrastructure/cache";
import { JwtPayload } from "@libs/common";
import { JWT_SECRET } from "@libs/common/constants";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

/**
 * JWT Strategy
 * Estrategia de Passport para validar tokens JWT.
 * Checks: signature → expiration → blacklist → user exists → user active.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly cacheService: AuthCacheService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
      passReqToCallback: true,
    });
  }

  /**
   * Valida el payload del token JWT
   * Este método es llamado automáticamente por Passport después de validar el token
   */
  async validate(req: Request, payload: JwtPayload): Promise<JwtPayload> {
    // Check token blacklist (revocation)
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (token) {
      const isBlacklisted = await this.cacheService.isTokenBlacklisted(token);
      if (isBlacklisted) {
        throw new UnauthorizedException("Token has been revoked");
      }
    }

    // Verificar que el usuario existe y está activo
    const user = await this.userService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException("Usuario no encontrado");
    }

    if (!user.isActive) {
      throw new UnauthorizedException("Usuario inactivo");
    }

    // Retornar el payload que será adjuntado a request.user
    return {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions,
    };
  }
}
