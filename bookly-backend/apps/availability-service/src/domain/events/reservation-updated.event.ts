import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

export interface ReservationUpdatedPayload {
  reservationId: string;
  changes: Record<string, any>;
  previousValues?: Record<string, any>;
  updatedBy: string;
}

export class ReservationUpdatedEvent {
  static create(
    payload: ReservationUpdatedPayload
  ): EventPayload<ReservationUpdatedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.RESERVATION_UPDATED,
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
