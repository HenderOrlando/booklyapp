import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '@libs/event-bus';
import { EventType, ReservationStatus } from '@libs/common/enums';
import { EventPayload } from '@libs/common';
import { IReservationRepository } from '@availability/domain/repositories/reservation.repository.interface';
import { AvailabilityCacheService } from '../cache';

/**
 * Handler para evento MAINTENANCE_SCHEDULED
 * 
 * Propósito: Bloquear el recurso durante el período de mantenimiento
 */
@Injectable()
export class MaintenanceScheduledHandler implements OnModuleInit {
  private readonly logger = new Logger(MaintenanceScheduledHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly cacheService: AvailabilityCacheService,
    @Inject('IReservationRepository')
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      EventType.MAINTENANCE_SCHEDULED,
      'availability-service-maintenance-group',
      this.handle.bind(this),
    );

    this.logger.log(`Subscribed to ${EventType.MAINTENANCE_SCHEDULED}`);
  }

  /**
   * Manejar evento de mantenimiento programado
   * Bloquea el recurso y verifica conflictos con reservas existentes
   */
  async handle(event: EventPayload<any>): Promise<void> {
    const { maintenanceId, resourceId, scheduledStartDate, scheduledEndDate, priority } = event.data;

    this.logger.debug(
      `Handling MAINTENANCE_SCHEDULED for resource ${resourceId}, maintenance ${maintenanceId}`,
    );

    try {
      const conflicts = await this.reservationRepository.findConflicts(
        resourceId,
        new Date(scheduledStartDate),
        new Date(scheduledEndDate),
      );

      if (conflicts.length > 0) {
        this.logger.warn(
          `Found ${conflicts.length} conflicting reservations for maintenance on resource ${resourceId}`,
        );

        if (priority === 'critical' || priority === 'high') {
          for (const reservation of conflicts) {
            await this.reservationRepository.updateStatus(
              reservation.id,
              ReservationStatus.CANCELLED,
            );

            await this.eventBus.publish(EventType.RESERVATION_CANCELLED, {
              eventId: `maint-cancel-${reservation.id}-${Date.now()}`,
              eventType: EventType.RESERVATION_CANCELLED,
              service: 'availability-service',
              timestamp: new Date(),
              data: {
                reservationId: reservation.id,
                resourceId,
                userId: reservation.userId,
                reason: `${priority} maintenance scheduled from ${scheduledStartDate} to ${scheduledEndDate}`,
                cancelledBy: 'system',
                maintenanceId,
              },
              metadata: {
                correlationId: event.metadata?.correlationId,
              },
            });
          }

          this.logger.log(
            `Cancelled ${conflicts.length} reservations due to ${priority} maintenance on resource ${resourceId}`,
          );
        } else {
          await this.eventBus.publish(EventType.SCHEDULE_CONFLICT_DETECTED, {
            eventId: `maint-conflict-${resourceId}-${Date.now()}`,
            eventType: EventType.SCHEDULE_CONFLICT_DETECTED,
            service: 'availability-service',
            timestamp: new Date(),
            data: {
              resourceId,
              maintenanceId,
              affectedReservations: conflicts.map((r) => ({
                reservationId: r.id,
                userId: r.userId,
                startDate: r.startDate,
                endDate: r.endDate,
              })),
              reason: 'maintenance_scheduled',
              scheduledStartDate,
              scheduledEndDate,
            },
            metadata: {
              correlationId: event.metadata?.correlationId,
            },
          });
        }
      }

      await this.cacheService.invalidateResourceAvailability(resourceId);
      await this.cacheService.invalidateAllResourceCache(resourceId);

      this.logger.log(
        `Resource ${resourceId} blocked for maintenance (${priority}) from ${scheduledStartDate} to ${scheduledEndDate}. Cache invalidated.`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling MAINTENANCE_SCHEDULED: ${error.message}`,
        error.stack,
      );
    }
  }
}
