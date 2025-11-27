import { EventType, ResourceStatus } from "@libs/common/enums";
import { EventPayload } from "@libs/common";

/**
 * Event payload when resource status changes
 */
export interface ResourceStatusChangedPayload {
  resourceId: string;
  previousStatus: ResourceStatus;
  newStatus: ResourceStatus;
  reason?: string;
  updatedBy: string;
}

/**
 * Event Factory for Resource Status Changed
 */
export class ResourceStatusChangedEvent {
  static create(
    payload: ResourceStatusChangedPayload
  ): EventPayload<ResourceStatusChangedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.RESOURCE_STATUS_CHANGED,
      service: "resources-service",
      data: payload,
      timestamp: new Date(),
      metadata: {
        version: "1.0",
      },
    };
  }
}
