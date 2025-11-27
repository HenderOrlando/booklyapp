import { AuditAction } from "@libs/common/enums";
import { SetMetadata } from "@nestjs/common";

export const REQUIRE_ACTION_KEY = "requireAction";

/**
 * Decorator para especificar la acción de auditoría requerida
 * Usado por el ActionGuard y AuditInterceptor para registrar la acción
 * @param action - Acción de auditoría a registrar
 */
export const RequireAction = (action: AuditAction) =>
  SetMetadata(REQUIRE_ACTION_KEY, action);
