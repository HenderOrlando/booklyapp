import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '@libs/event-bus';
import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Handler para evento RESOURCE_DELETED
 * 
 * Propósito: Cancelar todas las reservas futuras del recurso eliminado
 */
@Injectable()
export class ResourceDeletedHandler implements OnModuleInit {
  private readonly logger = new Logger(ResourceDeletedHandler.name);

  constructor(private readonly eventBus: EventBusService) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      EventType.RESOURCE_DELETED,
      'availability-service-resources-group',
      this.handle.bind(this),
    );

    this.logger.log(`Subscribed to ${EventType.RESOURCE_DELETED}`);
  }

  /**
   * Manejar evento de recurso eliminado
   * Cancela todas las reservas futuras asociadas al recurso
   */
  async handle(event: EventPayload<any>): Promise<void> {
    const { resourceId, name, reason, softDelete } = event.data;

    this.logger.debug(
      `Handling RESOURCE_DELETED for resource ${resourceId} (${name})`,
    );

    try {
      // TODO: Implementar lógica de negocio
      // 1. Buscar todas las reservas futuras del recurso
      // 2. Cancelar cada reserva
      // 3. Notificar a los usuarios afectados
      // 4. Publicar eventos RESERVATION_CANCELLED para cada reserva

      this.logger.warn(
        `Resource ${resourceId} deleted. Reason: ${reason || 'Not specified'}. SoftDelete: ${softDelete}`,
      );

      // TODO: Publicar eventos de cancelación masiva
    } catch (error) {
      this.logger.error(
        `Error handling RESOURCE_DELETED: ${error.message}`,
        error.stack,
      );
    }
  }
}
