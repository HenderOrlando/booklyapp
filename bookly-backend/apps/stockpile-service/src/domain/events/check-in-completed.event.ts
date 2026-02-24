import { EventType } from "@libs/common/enums";
import { EventPayload } from "@libs/common";

export interface CheckInCompletedPayload {
  checkInId: string;
  reservationId: string;
  resourceId: string;
  userId: string;
  checkInTime: Date;
  location?: string;
  verifiedBy?: string;
}

export class CheckInCompletedEvent {
  static create(
    payload: CheckInCompletedPayload
  ): EventPayload<CheckInCompletedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.CHECK_IN_COMPLETED,
      service: 'stockpile-service',
      data: payload,
      timestamp: new Date(),
      metadata: {
        version: '1.0',
        aggregateType: 'CheckIn',
        aggregateId: payload.checkInId,
      },
    };
  }
}
