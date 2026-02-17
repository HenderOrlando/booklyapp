import { SetMetadata } from "@nestjs/common";

/**
 * Roles Decorator
 * Use with RolesGuard to restrict access by role.
 * Accepts plain strings — roles are loaded from the database.
 *
 * @example
 * @Roles('GENERAL_ADMIN', 'PROGRAM_ADMIN')
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * async getAdminData() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata("roles", roles);
