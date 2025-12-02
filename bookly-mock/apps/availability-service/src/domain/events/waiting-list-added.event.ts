import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

export interface WaitingListAddedPayload {
  waitingListId: string;
  resourceId: string;
  userId: string;
  requestedStartTime: Date;
  requestedEndTime: Date;
  priority: number;
}

export class WaitingListAddedEvent {
  static create(
    payload: WaitingListAddedPayload
  ): EventPayload<WaitingListAddedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.WAITING_LIST_ADDED,
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
