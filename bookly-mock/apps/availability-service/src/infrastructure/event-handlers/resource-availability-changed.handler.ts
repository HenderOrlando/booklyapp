import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '@libs/event-bus';
import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';
import { IReservationRepository } from '@availability/domain/repositories/reservation.repository.interface';
import { AvailabilityCacheService } from '../cache';

/**
 * Handler para evento RESOURCE_AVAILABILITY_CHANGED
 * 
 * Propósito: Actualizar disponibilidad del recurso en el calendario
 */
@Injectable()
export class ResourceAvailabilityChangedHandler implements OnModuleInit {
  private readonly logger = new Logger(ResourceAvailabilityChangedHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly cacheService: AvailabilityCacheService,
    @Inject('IReservationRepository')
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      EventType.RESOURCE_AVAILABILITY_CHANGED,
      'availability-service-resources-group',
      this.handle.bind(this),
    );

    this.logger.log(`Subscribed to ${EventType.RESOURCE_AVAILABILITY_CHANGED}`);
  }

  /**
   * Manejar evento de cambio de disponibilidad
   * Actualiza el calendario y verifica conflictos
   */
  async handle(event: EventPayload<any>): Promise<void> {
    const { resourceId, previousAvailability, newAvailability, affectedTimeSlots } = event.data;

    this.logger.debug(
      `Handling RESOURCE_AVAILABILITY_CHANGED for resource ${resourceId}`,
    );

    try {
      if (!newAvailability && affectedTimeSlots?.length > 0) {
        this.logger.warn(
          `Resource ${resourceId} became unavailable. Checking ${affectedTimeSlots.length} affected time slots`,
        );

        for (const slot of affectedTimeSlots) {
          const conflicts = await this.reservationRepository.findConflicts(
            resourceId,
            new Date(slot.startDate),
            new Date(slot.endDate),
          );

          if (conflicts.length > 0) {
            this.logger.warn(
              `Found ${conflicts.length} conflicting reservations for resource ${resourceId} in slot ${slot.startDate} - ${slot.endDate}`,
            );

            await this.eventBus.publish(EventType.SCHEDULE_CONFLICT_DETECTED, {
              eventId: `conflict-${resourceId}-${Date.now()}`,
              eventType: EventType.SCHEDULE_CONFLICT_DETECTED,
              service: 'availability-service',
              timestamp: new Date(),
              data: {
                resourceId,
                affectedReservations: conflicts.map((r) => ({
                  reservationId: r.id,
                  userId: r.userId,
                  startDate: r.startDate,
                  endDate: r.endDate,
                })),
                reason: 'resource_availability_changed',
                slotStart: slot.startDate,
                slotEnd: slot.endDate,
              },
              metadata: {
                correlationId: event.metadata?.correlationId,
              },
            });
          }
        }
      }

      await this.cacheService.invalidateResourceAvailability(resourceId);
      await this.cacheService.invalidateAllResourceCache(resourceId);

      this.logger.log(
        `Resource ${resourceId} availability updated: ${previousAvailability} -> ${newAvailability}. Cache invalidated.`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling RESOURCE_AVAILABILITY_CHANGED: ${error.message}`,
        error.stack,
      );
    }
  }
}
