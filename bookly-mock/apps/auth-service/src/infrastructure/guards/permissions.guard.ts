import { PermissionService } from "@auth/application/services/permission.service";
import { PERMISSIONS_KEY } from "@auth/infrastructure/decorators/require-permissions.decorator";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

/**
 * Guard para verificar que el usuario tenga todos los permisos requeridos
 *
 * @example
 * ```typescript
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * @RequirePermissions('resources:update', 'resources:manage')
 * @Put('/resources/:id')
 * updateResource() {}
 * ```
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Obtener permisos requeridos del decorator @RequirePermissions()
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no hay permisos requeridos, permitir acceso
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    // Obtener usuario del request (ya autenticado por JwtAuthGuard)
    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.id) {
      return false;
    }

    // GENERAL_ADMIN tiene acceso total — bypass de permisos
    if (user.roles?.includes("GENERAL_ADMIN")) {
      return true;
    }

    // Obtener permisos del usuario desde sus roles
    const userPermissions = await this.permissionService.getUserPermissions(
      user.id,
    );

    // Verificar que el usuario tenga TODOS los permisos requeridos
    return requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );
  }
}
