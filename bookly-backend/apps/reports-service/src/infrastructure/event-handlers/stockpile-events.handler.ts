import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '@libs/event-bus';
import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Handler para eventos de Stockpile Service
 * 
 * Propósito: Métricas de aprobación y condición de recursos
 */
@Injectable()
export class StockpileEventsHandler implements OnModuleInit {
  private readonly logger = new Logger(StockpileEventsHandler.name);

  constructor(private readonly eventBus: EventBusService) {}

  async onModuleInit() {
    const stockpileEvents = [
      EventType.APPROVAL_REQUESTED,
      EventType.APPROVAL_GRANTED,
      EventType.APPROVAL_REJECTED,
      EventType.DOCUMENT_GENERATED,
      EventType.CHECK_IN_COMPLETED,
      EventType.CHECK_OUT_COMPLETED,
    ];

    for (const eventType of stockpileEvents) {
      await this.eventBus.subscribe(
        eventType,
        'reports-service-stockpile-group',
        this.handle.bind(this),
      );
    }

    this.logger.log(`Subscribed to ${stockpileEvents.length} stockpile events`);
  }

  /**
   * Manejar eventos de aprobaciones y check-in/out
   * Analiza eficiencia de aprobaciones y condición de recursos
   */
  async handle(event: EventPayload<any>): Promise<void> {
    const { eventType, data, timestamp } = event;

    this.logger.debug(`Handling stockpile event: ${eventType}`);

    try {
      // TODO: Implementar lógica de negocio
      // 1. Calcular tiempo promedio de aprobación
      // 2. Analizar tasa de aprobación/rechazo
      // 3. Registrar condición de recursos post-uso
      // 4. Identificar recursos que requieren mantenimiento frecuente

      switch (eventType) {
        case EventType.APPROVAL_REQUESTED:
          this.logger.log(
            `Approval requested for reservation ${data.reservationId}, priority: ${data.priority}`,
          );
          // TODO: Registrar timestamp de solicitud
          break;

        case EventType.APPROVAL_GRANTED:
          this.logger.log(
            `Approval granted for reservation ${data.reservationId} by ${data.approvedBy}`,
          );
          // TODO: Calcular tiempo de aprobación
          // TODO: Incrementar tasa de aprobación
          break;

        case EventType.APPROVAL_REJECTED:
          this.logger.log(
            `Approval rejected for reservation ${data.reservationId}. Reason: ${data.reason}`,
          );
          // TODO: Incrementar tasa de rechazo
          // TODO: Analizar razones de rechazo
          break;

        case EventType.CHECK_OUT_COMPLETED:
          const condition = data.resourceCondition;
          this.logger.log(
            `Check-out completed for resource ${data.resourceId}, condition: ${condition}`,
          );
          
          if (condition === 'damaged' || condition === 'needs_maintenance') {
            this.logger.warn(
              `Resource ${data.resourceId} needs attention after use`,
            );
            // TODO: Registrar recurso que requiere mantenimiento
          }
          // TODO: Actualizar estadísticas de condición de recursos
          break;

        default:
          this.logger.debug(`Stockpile event ${eventType} recorded`);
      }
    } catch (error) {
      this.logger.error(
        `Error handling stockpile event ${eventType}: ${error.message}`,
        error.stack,
      );
    }
  }
}
