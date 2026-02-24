import { SetMetadata } from "@nestjs/common";

/**
 * Permissions Decorator
 * Decorador para especificar permisos requeridos en endpoints
 *
 * Uso:
 * @RequirePermissions('resources:create', 'resources:update')
 * async createResource() { ... }
 */
export const PERMISSIONS_KEY = "permissions";
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
