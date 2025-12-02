import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

export interface DocumentGeneratedPayload {
  documentId: string;
  documentType: 'approval_letter' | 'rejection_letter' | 'confirmation' | 'report';
  relatedEntityId: string;
  relatedEntityType: 'approval' | 'reservation' | 'user';
  fileUrl: string;
  generatedBy: string;
}

export class DocumentGeneratedEvent {
  static create(
    payload: DocumentGeneratedPayload
  ): EventPayload<DocumentGeneratedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.DOCUMENT_GENERATED,
      service: 'stockpile-service',
      data: payload,
      timestamp: new Date(),
      metadata: {
        version: '1.0',
        aggregateType: 'Document',
        aggregateId: payload.documentId,
      },
    };
  }
}
