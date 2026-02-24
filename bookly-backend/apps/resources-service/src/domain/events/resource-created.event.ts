import { EventType, ResourceType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Event payload when a new resource is created
 */
export interface ResourceCreatedPayload {
  resourceId: string;
  name: string;
  type: ResourceType;
  categoryId: string;
  programId?: string;
  capacity?: number;
  location?: string;
  createdBy: string;
}

/**
 * Event Factory for Resource Created
 */
export class ResourceCreatedEvent {
  static create(
    payload: ResourceCreatedPayload
  ): EventPayload<ResourceCreatedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.RESOURCE_CREATED,
      service: 'resources-service',
      data: payload,
      timestamp: new Date(),
      metadata: {
        version: '1.0',
        aggregateType: 'Resource',
        aggregateId: payload.resourceId,
      },
    };
  }
}
