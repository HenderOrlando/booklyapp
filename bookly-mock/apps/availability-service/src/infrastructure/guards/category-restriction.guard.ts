import { createLogger } from "@libs/common";
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";

const logger = createLogger("CategoryRestrictionGuard");

/**
 * Category Restriction Guard (RF-16)
 * Valida que el usuario tiene permiso para reservar recursos de la categoría solicitada
 * Se aplica sobre el handler de create-reservation
 */
@Injectable()
export class CategoryRestrictionGuard implements CanActivate {
  /**
   * Restricciones por categoría → roles permitidos
   */
  private readonly categoryRestrictions: Record<string, string[]> = {
    laboratory: ["professor", "lab_coordinator", "admin", "general_admin"],
    auditorium: ["professor", "admin", "general_admin", "event_coordinator"],
    sports_facility: ["sports_coordinator", "admin", "general_admin"],
    conference_room: ["professor", "admin", "general_admin", "coordinator"],
    classroom: [
      "student",
      "professor",
      "admin",
      "general_admin",
      "coordinator",
    ],
  };

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const body = request.body;

    if (!user || !body?.categoryType) {
      return true; // Sin categoría, permitir paso (otras validaciones se encargán)
    }

    const categoryType = body.categoryType?.toLowerCase();
    const allowedRoles = this.categoryRestrictions[categoryType];

    if (!allowedRoles) {
      return true; // Categoría sin restricciones específicas
    }

    const userRoles: string[] = user.roles || [];
    const hasPermission = userRoles.some((role: string) =>
      allowedRoles.includes(role.toLowerCase())
    );

    if (!hasPermission) {
      logger.warn("Category restriction denied", {
        userId: user.id || user.sub,
        categoryType,
        userRoles,
        allowedRoles,
      });

      throw new ForbiddenException(
        `User does not have permission to reserve resources of category '${categoryType}'. Required roles: ${allowedRoles.join(", ")}`
      );
    }

    logger.debug("Category restriction passed", {
      userId: user.id || user.sub,
      categoryType,
    });

    return true;
  }
}
