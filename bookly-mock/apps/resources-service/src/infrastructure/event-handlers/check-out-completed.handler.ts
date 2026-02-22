import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '@libs/event-bus';
import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';
import { ResourcesCacheService } from '../cache';

/**
 * Handler para evento CHECK_OUT_COMPLETED
 * 
 * Propósito: Registrar condición del recurso después del uso
 */
@Injectable()
export class CheckOutCompletedHandler implements OnModuleInit {
  private readonly logger = new Logger(CheckOutCompletedHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly cacheService: ResourcesCacheService,
  ) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      EventType.CHECK_OUT_COMPLETED,
      'resources-service-checkout-group',
      this.handle.bind(this),
    );

    this.logger.log(`Subscribed to ${EventType.CHECK_OUT_COMPLETED}`);
  }

  /**
   * Manejar evento de check-out completado
   * Actualiza el estado y condición del recurso
   */
  async handle(event: EventPayload<any>): Promise<void> {
    const { checkOutId, resourceId, resourceCondition, notes } = event.data;

    this.logger.debug(
      `Handling CHECK_OUT_COMPLETED for resource ${resourceId}, condition: ${resourceCondition}`,
    );

    try {
      // TODO: Implementar lógica de negocio
      // 1. Actualizar estado del recurso
      // 2. Si resourceCondition es 'damaged' o 'needs_maintenance', programar mantenimiento
      // 3. Registrar notas de condición
      // 4. Actualizar historial de uso

      await this.cacheService.invalidateResource(resourceId);
      await this.cacheService.invalidateResourceStatus(resourceId);

      if (resourceCondition === 'damaged' || resourceCondition === 'needs_maintenance') {
        this.logger.warn(
          `Resource ${resourceId} needs attention. Condition: ${resourceCondition}. Notes: ${notes}`,
        );

        const maintenancePriority = resourceCondition === 'damaged' ? 'high' : 'normal';
        const scheduledStartDate = new Date();
        const scheduledEndDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await this.eventBus.publish(EventType.MAINTENANCE_SCHEDULED, {
          eventId: `maint-auto-${resourceId}-${Date.now()}`,
          eventType: EventType.MAINTENANCE_SCHEDULED,
          service: 'resources-service',
          timestamp: new Date(),
          data: {
            resourceId,
            checkOutId,
            priority: maintenancePriority,
            scheduledStartDate: scheduledStartDate.toISOString(),
            scheduledEndDate: scheduledEndDate.toISOString(),
            reason: `Auto-scheduled after check-out. Condition: ${resourceCondition}. Notes: ${notes || 'None'}`,
          },
          metadata: {
            correlationId: event.metadata?.correlationId,
          },
        });

        this.logger.log(
          `Maintenance scheduled for resource ${resourceId} due to condition: ${resourceCondition}`,
        );
      } else {
        this.logger.log(`Resource ${resourceId} checked out in good condition`);
      }
    } catch (error) {
      this.logger.error(
        `Error handling CHECK_OUT_COMPLETED: ${error.message}`,
        error.stack,
      );
    }
  }
}
