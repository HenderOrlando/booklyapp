import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

export interface ReservationCancelledPayload {
  reservationId: string;
  resourceId: string;
  userId: string;
  reason?: string;
  cancelledBy: string;
}

export class ReservationCancelledEvent {
  static create(
    payload: ReservationCancelledPayload
  ): EventPayload<ReservationCancelledPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.RESERVATION_CANCELLED,
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
