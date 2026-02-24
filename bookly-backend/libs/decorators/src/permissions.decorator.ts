import { SetMetadata } from "@nestjs/common";

/**
 * Permissions Decorator
 * Use with PermissionsGuard to restrict access by permission
 *
 * @example
 * @Permissions('resource:create', 'resource:update')
 * @UseGuards(JwtAuthGuard, PermissionsGuard)
 * async createResource() { ... }
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata("permissions", permissions);
