import { JWT_SECRET } from "@libs/common/constants";
import { JwtPayload } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

/**
 * JWT Strategy
 * Estrategia de Passport para validar tokens JWT en Resources Service
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  /**
   * Valida el payload del token JWT
   * Este método es llamado automáticamente por Passport después de validar el token
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // Retornar el payload que será adjuntado a request.user
    // La validación completa del usuario se hace en auth-service
    return {
      sub: payload.sub,
      email: payload.email,
      roles: payload.roles,
      permissions: payload.permissions,
    };
  }
}
