import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '@libs/event-bus';
import { EventType, ReservationStatus } from '@libs/common/enums';
import { EventPayload } from '@libs/common';
import { IReservationRepository } from '@availability/domain/repositories/reservation.repository.interface';
import { AvailabilityCacheService } from '../cache';

/**
 * Handler para evento APPROVAL_REJECTED
 * 
 * Propósito: Rechazar la reserva cuando se rechaza la solicitud
 */
@Injectable()
export class ApprovalRejectedHandler implements OnModuleInit {
  private readonly logger = new Logger(ApprovalRejectedHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly cacheService: AvailabilityCacheService,
    @Inject('IReservationRepository')
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      EventType.APPROVAL_REJECTED,
      'availability-service-approvals-group',
      this.handle.bind(this),
    );

    this.logger.log(`Subscribed to ${EventType.APPROVAL_REJECTED}`);
  }

  /**
   * Manejar evento de aprobación rechazada
   * Rechaza la reserva y libera el recurso
   */
  async handle(event: EventPayload<any>): Promise<void> {
    const { approvalId, reservationId, resourceId, rejectedBy, reason } = event.data;

    this.logger.debug(
      `Handling APPROVAL_REJECTED for reservation ${reservationId}`,
    );

    try {
      const reservation = await this.reservationRepository.findById(reservationId);

      if (!reservation) {
        this.logger.warn(`Reservation ${reservationId} not found, skipping rejection`);
        return;
      }

      if (reservation.status !== ReservationStatus.PENDING) {
        this.logger.warn(
          `Reservation ${reservationId} is not pending (status: ${reservation.status}), skipping`,
        );
        return;
      }

      await this.reservationRepository.updateStatus(reservationId, ReservationStatus.REJECTED);

      await this.cacheService.invalidateReservation(reservationId);
      await this.cacheService.invalidateResourceAvailability(resourceId);
      await this.cacheService.invalidateWaitingList(resourceId);

      this.logger.log(
        `Reservation ${reservationId} rejected by ${rejectedBy}. Reason: ${reason}. Slot freed for resource ${resourceId}.`,
      );

      await this.eventBus.publish(EventType.RESERVATION_REJECTED, {
        eventId: `reject-${reservationId}-${Date.now()}`,
        eventType: EventType.RESERVATION_REJECTED,
        service: 'availability-service',
        timestamp: new Date(),
        data: {
          reservationId,
          resourceId,
          approvalId,
          rejectedBy,
          reason,
          userId: reservation.userId,
          startDate: reservation.startDate,
          endDate: reservation.endDate,
        },
        metadata: {
          correlationId: event.metadata?.correlationId,
        },
      });

      await this.eventBus.publish(EventType.WAITING_LIST_NOTIFIED, {
        eventId: `waitlist-${resourceId}-${Date.now()}`,
        eventType: EventType.WAITING_LIST_NOTIFIED,
        service: 'availability-service',
        timestamp: new Date(),
        data: {
          resourceId,
          startDate: reservation.startDate,
          endDate: reservation.endDate,
          reason: 'slot_freed_after_rejection',
        },
        metadata: {
          correlationId: event.metadata?.correlationId,
        },
      });
    } catch (error) {
      this.logger.error(
        `Error handling APPROVAL_REJECTED: ${error.message}`,
        error.stack,
      );
    }
  }
}
