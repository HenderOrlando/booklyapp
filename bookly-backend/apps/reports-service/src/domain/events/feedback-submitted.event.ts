import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

export interface FeedbackSubmittedPayload {
  feedbackId: string;
  userId: string;
  resourceId?: string;
  reservationId?: string;
  rating: number;
  comment?: string;
  category: 'resource' | 'service' | 'platform' | 'other';
}

export class FeedbackSubmittedEvent {
  static create(
    payload: FeedbackSubmittedPayload
  ): EventPayload<FeedbackSubmittedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.FEEDBACK_SUBMITTED,
      service: 'reports-service',
      data: payload,
      timestamp: new Date(),
      metadata: {
        version: '1.0',
        aggregateType: 'Feedback',
        aggregateId: payload.feedbackId,
      },
    };
  }
}
