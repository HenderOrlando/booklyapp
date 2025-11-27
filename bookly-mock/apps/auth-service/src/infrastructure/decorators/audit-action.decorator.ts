import { SetMetadata } from "@nestjs/common";

/**
 * Metadata key para almacenar información de auditoría
 */
export const AUDIT_ACTION_KEY = "audit_action";

/**
 * Interface para metadata de auditoría
 */
export interface AuditMetadata {
  action: string;
  resource: string;
}

/**
 * Decorator para marcar endpoints que deben ser auditados
 *
 * @param action - Acción realizada (CREATE, UPDATE, DELETE, VIEW, ACCESS)
 * @param resource - Recurso afectado (role, permission, user, etc.)
 *
 * @example
 * ```typescript
 * @AuditAction('UPDATE', 'role')
 * @Put('/roles/:id')
 * updateRole() {
 *   // Esta acción será registrada en el log de auditoría
 * }
 * ```
 */
export const AuditAction = (action: string, resource: string) =>
  SetMetadata(AUDIT_ACTION_KEY, { action, resource } as AuditMetadata);
