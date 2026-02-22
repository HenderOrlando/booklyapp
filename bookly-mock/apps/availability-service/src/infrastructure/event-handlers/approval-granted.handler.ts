import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { EventBusService } from '@libs/event-bus';
import { EventType, ReservationStatus } from '@libs/common/enums';
import { EventPayload } from '@libs/common';
import { IReservationRepository } from '@availability/domain/repositories/reservation.repository.interface';
import { AvailabilityCacheService } from '../cache';

/**
 * Handler para evento APPROVAL_GRANTED
 * 
 * Propósito: Confirmar la reserva cuando se aprueba la solicitud
 */
@Injectable()
export class ApprovalGrantedHandler implements OnModuleInit {
  private readonly logger = new Logger(ApprovalGrantedHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly cacheService: AvailabilityCacheService,
    @Inject('IReservationRepository')
    private readonly reservationRepository: IReservationRepository,
  ) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      EventType.APPROVAL_GRANTED,
      'availability-service-approvals-group',
      this.handle.bind(this),
    );

    this.logger.log(`Subscribed to ${EventType.APPROVAL_GRANTED}`);
  }

  /**
   * Manejar evento de aprobación concedida
   * Confirma la reserva y actualiza su estado
   */
  async handle(event: EventPayload<any>): Promise<void> {
    const { approvalId, reservationId, resourceId, approvedBy, comments } = event.data;

    this.logger.debug(
      `Handling APPROVAL_GRANTED for reservation ${reservationId}`,
    );

    try {
      const reservation = await this.reservationRepository.findById(reservationId);

      if (!reservation) {
        this.logger.warn(`Reservation ${reservationId} not found, skipping approval confirmation`);
        return;
      }

      if (reservation.status !== ReservationStatus.PENDING) {
        this.logger.warn(
          `Reservation ${reservationId} is not pending (status: ${reservation.status}), skipping`,
        );
        return;
      }

      await this.reservationRepository.updateStatus(reservationId, ReservationStatus.CONFIRMED);

      await this.cacheService.invalidateReservation(reservationId);

      this.logger.log(
        `Reservation ${reservationId} confirmed after approval by ${approvedBy}. Comments: ${comments || 'None'}`,
      );

      await this.eventBus.publish(EventType.RESERVATION_CONFIRMED, {
        eventId: `confirm-${reservationId}-${Date.now()}`,
        eventType: EventType.RESERVATION_CONFIRMED,
        service: 'availability-service',
        timestamp: new Date(),
        data: {
          reservationId,
          resourceId,
          approvalId,
          approvedBy,
          comments,
          userId: reservation.userId,
        },
        metadata: {
          correlationId: event.metadata?.correlationId,
        },
      });
    } catch (error) {
      this.logger.error(
        `Error handling APPROVAL_GRANTED: ${error.message}`,
        error.stack,
      );
    }
  }
}
