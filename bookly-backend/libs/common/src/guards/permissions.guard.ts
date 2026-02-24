import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "../decorators/require-permissions.decorator";

/**
 * Permissions Guard
 * Guard para validar que el usuario tenga los permisos requeridos
 *
 * TODO: Implementar lógica de validación contra base de datos de permisos
 * TODO: Integrar con auth-service para obtener roles y permisos
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No se requieren permisos específicos
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false; // No hay usuario autenticado
    }

    // TODO: Implementar validación real de permisos
    // Por ahora, permite acceso si el usuario está autenticado
    // En producción, validar user.permissions contra requiredPermissions

    /**
     * Implementación futura:
     *
     * const userPermissions = user.permissions || [];
     * const hasPermission = requiredPermissions.every(permission =>
     *   userPermissions.includes(permission)
     * );
     *
     * return hasPermission;
     */

    return true; // Placeholder: siempre permite acceso si está autenticado
  }
}
