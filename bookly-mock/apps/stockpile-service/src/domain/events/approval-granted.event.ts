import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

export interface ApprovalGrantedPayload {
  approvalId: string;
  reservationId: string;
  resourceId: string;
  userId: string;
  approvedBy: string;
  comments?: string;
}

export class ApprovalGrantedEvent {
  static create(
    payload: ApprovalGrantedPayload
  ): EventPayload<ApprovalGrantedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.APPROVAL_GRANTED,
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
