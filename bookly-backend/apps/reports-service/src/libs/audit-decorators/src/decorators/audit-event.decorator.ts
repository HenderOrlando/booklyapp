import { SetMetadata } from "@nestjs/common";
import { AuditEventConfig } from "../interfaces";

/**
 * Clave para metadatos de auditoría de eventos de dominio
 */
export const AUDIT_EVENT_METADATA_KEY = "audit:event:config";

/**
 * Decorador para marcar event handlers de dominio/aplicación que deben ser auditados
 *
 * Usa el AuditEventInterceptor para capturar datos del evento y emitir eventos de auditoría
 *
 * @example
 * ```typescript
 * @AuditEvent({
 *   entityType: 'RESERVATION',
 *   action: AuditAction.APPROVED,
 *   extractEntityId: (event) => event.reservationId,
 *   includeFullEvent: true
 * })
 * @EventsHandler(ReservationApprovedEvent)
 * export class ReservationApprovedHandler implements IEventHandler<ReservationApprovedEvent> {
 *   async handle(event: ReservationApprovedEvent) {
 *     // Lógica del handler
 *     // La auditoría se registra automáticamente
 *   }
 * }
 * ```
 */
export function AuditEvent(config: AuditEventConfig): ClassDecorator {
  return SetMetadata(AUDIT_EVENT_METADATA_KEY, config);
}
