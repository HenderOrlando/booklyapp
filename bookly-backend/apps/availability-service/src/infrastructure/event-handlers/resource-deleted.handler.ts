import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '@libs/event-bus';
import { EventType, ReservationStatus } from '@libs/common/enums';
import { EventPayload } from '@libs/common';
import { IReservationRepository } from '@availability/domain/repositories/reservation.repository.interface';
import { AvailabilityCacheService } from '../cache';

/**
 * Handler para evento RESOURCE_DELETED
 * 
 * Propósito: Cancelar todas las reservas futuras del recurso eliminado
 */
@Injectable()
export class ResourceDeletedHandler implements OnModuleInit {
  private readonly logger = new Logger(ResourceDeletedHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly cacheService: AvailabilityCacheService,
    @Inject('IReservationRepository')
    private readonly reservationRepository: IReservationRepository,
  ) {}

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
      const activeReservations = await this.reservationRepository.findActiveByResource(resourceId);

      let cancelledCount = 0;
      for (const reservation of activeReservations) {
        try {
          await this.reservationRepository.updateStatus(
            reservation.id,
            ReservationStatus.CANCELLED,
          );
          cancelledCount++;

          await this.eventBus.publish(EventType.RESERVATION_CANCELLED, {
            eventId: `cancel-${reservation.id}-${Date.now()}`,
            eventType: EventType.RESERVATION_CANCELLED,
            service: 'availability-service',
            timestamp: new Date(),
            data: {
              reservationId: reservation.id,
              resourceId,
              userId: reservation.userId,
              reason: `Resource "${name}" has been deleted: ${reason || 'No reason specified'}`,
              cancelledBy: 'system',
            },
            metadata: {
              correlationId: event.metadata?.correlationId,
            },
          });
        } catch (err) {
          this.logger.error(
            `Failed to cancel reservation ${reservation.id}: ${err.message}`,
          );
        }
      }

      await this.cacheService.invalidateAllResourceCache(resourceId);

      this.logger.log(
        `Resource ${resourceId} deleted (softDelete: ${softDelete}). Cancelled ${cancelledCount} active reservations. Cache invalidated.`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling RESOURCE_DELETED: ${error.message}`,
        error.stack,
      );
    }
  }
}
