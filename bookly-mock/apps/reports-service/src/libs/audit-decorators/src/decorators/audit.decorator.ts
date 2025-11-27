import { SetMetadata } from "@nestjs/common";
import { AuditConfig } from "../interfaces";

/**
 * Clave para metadatos de auditoría HTTP
 */
export const AUDIT_METADATA_KEY = "audit:config";

/**
 * Decorador para marcar métodos HTTP que deben ser auditados automáticamente
 *
 * Usa el AuditHttpInterceptor para capturar contexto HTTP y emitir eventos
 *
 * @example
 * ```typescript
 * @Audit({
 *   entityType: 'RESERVATION',
 *   action: AuditAction.CREATED,
 *   captureBeforeData: false
 * })
 * @Post()
 * async createReservation(@Body() dto: CreateReservationDto) {
 *   return this.commandBus.execute(new CreateReservationCommand(dto));
 * }
 * ```
 */
export function Audit(config: AuditConfig): MethodDecorator {
  return SetMetadata(AUDIT_METADATA_KEY, config);
}
