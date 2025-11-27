import { SetMetadata } from "@nestjs/common";

/**
 * Metadata key para almacenar los permisos requeridos
 */
export const PERMISSIONS_KEY = "permissions";

/**
 * Decorator para especificar qué permisos son necesarios para acceder a un endpoint
 *
 * @param permissions - Array de permisos en formato "resource:action"
 *
 * @example
 * ```typescript
 * @RequirePermissions('resources:update', 'resources:manage')
 * @Put('/resources/:id')
 * updateResource() {
 *   // Solo usuarios con ambos permisos pueden acceder
 * }
 * ```
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
