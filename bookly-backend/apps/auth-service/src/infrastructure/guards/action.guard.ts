import { AuditAction } from "@libs/common/enums";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { REQUIRE_ACTION_KEY } from "../decorators/require-action.decorator";

/**
 * Guard para validar que la acción especificada esté presente
 * Trabaja en conjunto con el AuditInterceptor para registrar acciones
 */
@Injectable()
export class ActionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredAction = this.reflector.getAllAndOverride<AuditAction>(
      REQUIRE_ACTION_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredAction) {
      // Si no hay acción requerida, permitir acceso
      return true;
    }

    // Adjuntar la acción al request para que el AuditInterceptor la use
    const request = context.switchToHttp().getRequest();
    request.auditAction = requiredAction;

    return true;
  }
}
