import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

export interface ApprovalRejectedPayload {
  approvalId: string;
  reservationId: string;
  resourceId: string;
  userId: string;
  rejectedBy: string;
  reason: string;
}

export class ApprovalRejectedEvent {
  static create(
    payload: ApprovalRejectedPayload
  ): EventPayload<ApprovalRejectedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.APPROVAL_REJECTED,
      service: 'stockpile-service',
      data: payload,
      timestamp: new Date(),
      metadata: {
        version: '1.0',
        aggregateType: 'Approval',
        aggregateId: payload.approvalId,
      },
    };
  }
}
