import { AuditStatus, EventType } from "@libs/common/enums";
import { EventPayload } from "@libs/common";
import { createLogger } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { AuditAlertService } from '@reports/application/services/audit-alert.service";
import { AuditAnalyticsService } from '@reports/application/services/audit-analytics.service";

/**
 * Consumer de eventos de auditoría desde Kafka
 */
@Injectable()
export class AuditEventsConsumer implements OnModuleInit {
  private readonly logger = createLogger("AuditEventsConsumer");

  constructor(
    private readonly eventBusService: EventBusService,
    private readonly auditAnalyticsService: AuditAnalyticsService,
    private readonly auditAlertService: AuditAlertService
  ) {}

  async onModuleInit() {
    await this.subscribeToAuditEvents();
  }

  /**
   * Suscribirse a eventos de auditoría
   */
  private async subscribeToAuditEvents(): Promise<void> {
    try {
      // Suscribirse a eventos de log de auditoría creados usando EventBusService
      await this.eventBusService.subscribe(
        EventType.AUDIT_LOG_CREATED,
        EventType.AUDIT_GROUP,
        async (event) => {
          await this.handleAuditLogCreated(event);
        }
      );

      // Suscribirse a intentos no autorizados
      await this.eventBusService.subscribe(
        EventType.AUDIT_UNAUTHORIZED_ATTEMPT,
        EventType.AUDIT_GROUP,
        async (event) => {
          await this.handleUnauthorizedAttempt(event);
        }
      );

      this.logger.info("Subscribed to audit events", {
        topics: [
          EventType.AUDIT_LOG_CREATED,
          EventType.AUDIT_UNAUTHORIZED_ATTEMPT,
        ],
      });
    } catch (error: any) {
      this.logger.error("Failed to subscribe to audit events", error);
      throw error;
    }
  }

  /**
   * Procesar evento de log de auditoría creado
   */
  private async handleAuditLogCreated(event: EventPayload<any>): Promise<void> {
    try {
      this.logger.debug("Processing audit log created event", {
        eventId: event.eventId,
      });

      const { auditLogId, userId, action, resource, status, timestamp } =
        event.data;

      // Almacenar evento para análisis
      await this.auditAnalyticsService.storeAuditEvent({
        eventId: event.eventId,
        auditLogId,
        userId,
        action,
        resource,
        status,
        timestamp: new Date(timestamp),
      });

      this.logger.info("Audit event processed successfully", {
        eventId: event.eventId,
        userId,
        action,
        status,
      });
    } catch (error: any) {
      this.logger.error("Failed to handle audit log created", error, {
        eventId: event.eventId,
      });
    }
  }

  /**
   * Procesar intento de acceso no autorizado
   */
  private async handleUnauthorizedAttempt(
    event: EventPayload<any>
  ): Promise<void> {
    try {
      this.logger.warn("Processing unauthorized attempt event", {
        eventId: event.eventId,
      });

      const { auditLogId, userId, action, resource, timestamp, ip, error } =
        event.data;

      // Almacenar evento
      await this.auditAnalyticsService.storeAuditEvent({
        eventId: event.eventId,
        auditLogId,
        userId,
        action,
        resource,
        status: AuditStatus.FAILED,
        timestamp: new Date(timestamp),
        ip,
        error,
      });

      // Generar alerta automática
      await this.auditAlertService.processUnauthorizedAttempt({
        eventId: event.eventId,
        userId,
        action,
        resource,
        ip,
        error,
      });

      this.logger.warn("Unauthorized attempt processed and alerted", {
        eventId: event.eventId,
        userId,
        resource,
      });
    } catch (error: any) {
      this.logger.error("Failed to handle unauthorized attempt", error, {
        eventId: event.eventId,
      });
    }
  }
}
