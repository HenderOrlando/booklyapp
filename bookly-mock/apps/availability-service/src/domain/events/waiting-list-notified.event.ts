import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

export interface WaitingListNotifiedPayload {
  waitingListId: string;
  resourceId: string;
  userId: string;
  availableSlot: {
    startTime: Date;
    endTime: Date;
  };
  notifiedAt: Date;
}

export class WaitingListNotifiedEvent {
  static create(
    payload: WaitingListNotifiedPayload
  ): EventPayload<WaitingListNotifiedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.WAITING_LIST_NOTIFIED,
      service: 'availability-service',
      data: payload,
      timestamp: new Date(),
      metadata: {
        version: '1.0',
        aggregateType: 'WaitingList',
        aggregateId: payload.waitingListId,
      },
    };
  }
}
