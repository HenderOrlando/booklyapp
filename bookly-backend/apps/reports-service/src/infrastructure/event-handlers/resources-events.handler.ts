import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '@libs/event-bus';
import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Handler para eventos de Resources Service
 * 
 * Propósito: Tracking de inventario y mantenimiento para reportes
 */
@Injectable()
export class ResourcesEventsHandler implements OnModuleInit {
  private readonly logger = new Logger(ResourcesEventsHandler.name);

  constructor(private readonly eventBus: EventBusService) {}

  async onModuleInit() {
    const resourceEvents = [
      EventType.RESOURCE_CREATED,
      EventType.RESOURCE_UPDATED,
      EventType.RESOURCE_DELETED,
      EventType.RESOURCE_AVAILABILITY_CHANGED,
      EventType.MAINTENANCE_SCHEDULED,
      EventType.MAINTENANCE_COMPLETED,
      EventType.CATEGORY_CREATED,
      EventType.CATEGORY_UPDATED,
    ];

    for (const eventType of resourceEvents) {
      await this.eventBus.subscribe(
        eventType,
        'reports-service-resources-group',
        this.handle.bind(this),
      );
    }

    this.logger.log(`Subscribed to ${resourceEvents.length} resource events`);
  }

  /**
   * Manejar eventos de recursos
   * Registra cambios en inventario y mantenimiento
   */
  async handle(event: EventPayload<any>): Promise<void> {
    const { eventType, data, timestamp } = event;

    this.logger.debug(`Handling resource event: ${eventType}`);

    try {
      // TODO: Implementar lógica de negocio
      // 1. Actualizar métricas de inventario
      // 2. Registrar historial de cambios
      // 3. Actualizar reportes de mantenimiento
      // 4. Calcular disponibilidad promedio

      switch (eventType) {
        case EventType.RESOURCE_CREATED:
          this.logger.log(`New resource created: ${data.name} (${data.type})`);
          // TODO: Incrementar contador de recursos por tipo
          break;

        case EventType.RESOURCE_DELETED:
          this.logger.log(`Resource deleted: ${data.name}. Reason: ${data.reason}`);
          // TODO: Actualizar inventario activo
          break;

        case EventType.MAINTENANCE_SCHEDULED:
          this.logger.log(
            `Maintenance scheduled for resource ${data.resourceId}, priority: ${data.priority}`,
          );
          // TODO: Actualizar reporte de mantenimientos pendientes
          break;

        case EventType.MAINTENANCE_COMPLETED:
          this.logger.log(
            `Maintenance completed for resource ${data.resourceId}, success: ${data.wasSuccessful}`,
          );
          // TODO: Actualizar estadísticas de mantenimiento
          break;

        default:
          this.logger.debug(`Resource event ${eventType} recorded`);
      }
    } catch (error) {
      this.logger.error(
        `Error handling resource event ${eventType}: ${error.message}`,
        error.stack,
      );
    }
  }
}
