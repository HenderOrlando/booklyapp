import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Event payload when a new reservation is created
 */
export interface ReservationCreatedPayload {
  reservationId: string;
  resourceId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  purpose?: string;
  createdBy: string;
}

/**
 * Event Factory for Reservation Created
 */
export class ReservationCreatedEvent {
  static create(
    payload: ReservationCreatedPayload
  ): EventPayload<ReservationCreatedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.RESERVATION_CREATED,
      service: 'availability-service',
      data: payload,
      timestamp: new Date(),
      metadata: {
        version: '1.0',
        aggregateType: 'Reservation',
        aggregateId: payload.reservationId,
      },
    };
  }
}
