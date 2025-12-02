import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '@libs/event-bus';
import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Handler para evento CHECK_OUT_COMPLETED
 * 
 * Propósito: Registrar condición del recurso después del uso
 */
@Injectable()
export class CheckOutCompletedHandler implements OnModuleInit {
  private readonly logger = new Logger(CheckOutCompletedHandler.name);

  constructor(private readonly eventBus: EventBusService) {}

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

      if (resourceCondition === 'damaged' || resourceCondition === 'needs_maintenance') {
        this.logger.warn(
          `Resource ${resourceId} needs attention. Condition: ${resourceCondition}. Notes: ${notes}`,
        );
        // TODO: Publicar evento MAINTENANCE_SCHEDULED automáticamente
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
