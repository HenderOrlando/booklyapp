import { JWT_SECRET } from "@libs/common/constants";
import { JwtPayload } from "@libs/common";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "../../application/services/user.service";

/**
 * JWT Strategy
 * Estrategia de Passport para validar tokens JWT
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
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
