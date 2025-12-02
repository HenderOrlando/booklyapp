import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Event payload when a resource is updated
 */
export interface ResourceUpdatedPayload {
  resourceId: string;
  changes: Record<string, any>;
  previousValues?: Record<string, any>;
  updatedBy: string;
}

/**
 * Event Factory for Resource Updated
 */
export class ResourceUpdatedEvent {
  static create(
    payload: ResourceUpdatedPayload
  ): EventPayload<ResourceUpdatedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.RESOURCE_UPDATED,
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
