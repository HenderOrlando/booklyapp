import { SetMetadata } from "@nestjs/common";
import { AuditWebSocketConfig } from "../interfaces";

/**
 * Clave para metadatos de auditoría WebSocket
 */
export const AUDIT_WEBSOCKET_METADATA_KEY = "audit:websocket:config";

/**
 * Decorador para marcar handlers WebSocket que deben ser auditados automáticamente
 *
 * Usa el AuditWebSocketInterceptor para capturar contexto del socket y emitir eventos
 *
 * @example
 * ```typescript
 * @AuditWebSocket({
 *   entityType: 'NOTIFICATION',
 *   action: AuditAction.SENT,
 *   extractEntityId: (payload) => payload?.reservationId
 * })
 * @SubscribeMessage('reservation.notify')
 * async handleReservationNotification(
 *   @ConnectedSocket() client: Socket,
 *   @MessageBody() payload: NotifyReservationDto
 * ) {
 *   // Lógica del handler
 * }
 * ```
 */
export function AuditWebSocket(config: AuditWebSocketConfig): MethodDecorator {
  return SetMetadata(AUDIT_WEBSOCKET_METADATA_KEY, config);
}
