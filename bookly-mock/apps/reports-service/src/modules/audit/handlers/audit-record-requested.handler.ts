import { Logger } from "@nestjs/common";
import { EventsHandler, IEventHandler } from "@nestjs/cqrs";
import { AuditRecordRequestedEvent } from "@reports/audit-decorators";
import { AuditService } from "../services/audit.service";

/**
 * Handler que escucha eventos AuditRecordRequestedEvent
 * emitidos por los decoradores @Audit(), @AuditWebSocket() y @AuditEvent()
 *
 * Este handler persiste los registros de auditoría en MongoDB
 */
@EventsHandler(AuditRecordRequestedEvent)
export class AuditRecordRequestedHandler
  implements IEventHandler<AuditRecordRequestedEvent>
{
  private readonly logger = new Logger(AuditRecordRequestedHandler.name);

  constructor(private readonly auditService: AuditService) {}

  async handle(event: AuditRecordRequestedEvent): Promise<void> {
    try {
      this.logger.log(
        `Processing audit: ${event.entityType}.${event.action} from ${event.serviceName}`
      );

      // Construir registro de auditoría compatible con IAuditRecord
      const auditRecord = {
        entityId: event.entityId,
        entityType: event.entityType,
        action: event.action,
        userId: event.userId,
        serviceName: event.serviceName,
        metadata: event.metadata,
        timestamp: event.timestamp,
        beforeData: event.beforeData,
        afterData: event.afterData,
        ip: event.ip,
        userAgent: event.userAgent,
        location: event.location,
      };

      // Persistir en MongoDB
      await this.auditService.saveRecord(auditRecord);

      this.logger.log(`Audit record saved successfully: ${event.entityId}`);
    } catch (error) {
      // Log error pero no interrumpir el flujo
      this.logger.error(
        "Error saving audit record",
        error.stack,
        "AuditRecordRequestedHandler"
      );
      // En producción, podrías enviar a un sistema de alertas
    }
  }
}
