import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Event payload when resource availability changes
 */
export interface ResourceAvailabilityChangedPayload {
  resourceId: string;
  previousAvailability: boolean;
  newAvailability: boolean;
  reason?: string;
  affectedTimeSlots?: Array<{
    startTime: Date;
    endTime: Date;
  }>;
  updatedBy: string;
}

/**
 * Event Factory for Resource Availability Changed
 */
export class ResourceAvailabilityChangedEvent {
  static create(
    payload: ResourceAvailabilityChangedPayload
  ): EventPayload<ResourceAvailabilityChangedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.RESOURCE_AVAILABILITY_CHANGED,
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
