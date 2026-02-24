import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

export interface ReservationConfirmedPayload {
  reservationId: string;
  resourceId: string;
  userId: string;
  confirmedBy: string;
  confirmedAt: Date;
}

export class ReservationConfirmedEvent {
  static create(
    payload: ReservationConfirmedPayload
  ): EventPayload<ReservationConfirmedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.RESERVATION_CONFIRMED,
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
