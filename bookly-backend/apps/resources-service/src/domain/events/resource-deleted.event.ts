import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Event payload when a resource is deleted
 */
export interface ResourceDeletedPayload {
  resourceId: string;
  name: string;
  reason?: string;
  deletedBy: string;
  softDelete: boolean;
}

/**
 * Event Factory for Resource Deleted
 */
export class ResourceDeletedEvent {
  static create(
    payload: ResourceDeletedPayload
  ): EventPayload<ResourceDeletedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.RESOURCE_DELETED,
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
