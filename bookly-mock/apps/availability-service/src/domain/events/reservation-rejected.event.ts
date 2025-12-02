import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

export interface ReservationRejectedPayload {
  reservationId: string;
  resourceId: string;
  userId: string;
  reason: string;
  rejectedBy: string;
}

export class ReservationRejectedEvent {
  static create(
    payload: ReservationRejectedPayload
  ): EventPayload<ReservationRejectedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.RESERVATION_REJECTED,
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
