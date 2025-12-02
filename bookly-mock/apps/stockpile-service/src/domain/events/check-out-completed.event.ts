import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

export interface CheckOutCompletedPayload {
  checkOutId: string;
  reservationId: string;
  resourceId: string;
  userId: string;
  checkOutTime: Date;
  resourceCondition?: 'good' | 'damaged' | 'needs_maintenance';
  notes?: string;
  verifiedBy?: string;
}

export class CheckOutCompletedEvent {
  static create(
    payload: CheckOutCompletedPayload
  ): EventPayload<CheckOutCompletedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.CHECK_OUT_COMPLETED,
      service: 'stockpile-service',
      data: payload,
      timestamp: new Date(),
      metadata: {
        version: '1.0',
        aggregateType: 'CheckOut',
        aggregateId: payload.checkOutId,
      },
    };
  }
}
