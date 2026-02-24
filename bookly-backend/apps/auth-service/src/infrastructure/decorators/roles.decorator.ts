import { SetMetadata } from "@nestjs/common";

/**
 * Metadata key para almacenar los roles requeridos
 */
export const ROLES_KEY = "roles";

/**
 * Decorator para especificar qué roles tienen permiso para acceder a un endpoint
 *
 * @param roles - Array de nombres de roles que pueden acceder
 *
 * @example
 * ```typescript
 * @Roles('ADMINISTRADOR_GENERAL', 'ADMINISTRADOR_PROGRAMA')
 * @Put('/resources/:id')
 * updateResource() {
 *   // Solo administradores generales y de programa pueden acceder
 * }
 * ```
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
