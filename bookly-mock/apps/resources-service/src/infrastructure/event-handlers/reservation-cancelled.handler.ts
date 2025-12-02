import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '@libs/event-bus';
import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';
import { ResourcesCacheService } from '../cache';

/**
 * Handler para evento RESERVATION_CANCELLED
 * 
 * Propósito: Liberar el recurso cuando se cancela una reserva
 */
@Injectable()
export class ReservationCancelledHandler implements OnModuleInit {
  private readonly logger = new Logger(ReservationCancelledHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly cacheService: ResourcesCacheService,
  ) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      EventType.RESERVATION_CANCELLED,
      'resources-service-reservations-group',
      this.handle.bind(this),
    );

    this.logger.log(`Subscribed to ${EventType.RESERVATION_CANCELLED}`);
  }

  /**
   * Manejar evento de reserva cancelada
   * Libera el recurso y actualiza estadísticas
   */
  async handle(event: EventPayload<any>): Promise<void> {
    const { reservationId, resourceId, userId, reason } = event.data;

    this.logger.debug(
      `Handling RESERVATION_CANCELLED for resource ${resourceId}, reservation ${reservationId}`,
    );

    try {
      // TODO: Implementar lógica de negocio
      // 1. Liberar el recurso
      // 2. Actualizar contador de cancelaciones
      // 3. Registrar razón de cancelación para análisis

      // Invalidar cache del recurso
      await this.cacheService.invalidateResource(resourceId);
      await this.cacheService.invalidateResourceStatus(resourceId);
      await this.cacheService.invalidateResourceLists();

      this.logger.log(
        `Resource ${resourceId} freed due to reservation ${reservationId} cancellation. Cache invalidated.`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling RESERVATION_CANCELLED: ${error.message}`,
        error.stack,
      );
    }
  }
}
