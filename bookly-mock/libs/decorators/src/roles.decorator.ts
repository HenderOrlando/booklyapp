import { UserRole } from "@libs/common/enums";
import { SetMetadata } from "@nestjs/common";

/**
 * Roles Decorator
 * Use with RolesGuard to restrict access by role
 *
 * @example
 * @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * async getAdminData() { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata("roles", roles);
