import { EventType } from "@libs/common/enums";

/**
 * Resource Category Changed Event
 * Evento emitido cuando se cambia la categoría de un recurso
 */
export class ResourceCategoryChangedEvent {
  constructor(
    public readonly eventId: string,
    public readonly eventType: EventType,
    public readonly service: string,
    public readonly timestamp: Date,
    public readonly data: {
      resourceId: string;
      previousCategoryId: string;
      newCategoryId: string;
      updatedBy: string;
      reason?: string;
    },
    public readonly metadata: {
      aggregateId: string;
      aggregateType: string;
      version: number;
    }
  ) {}

  static create(payload: {
    resourceId: string;
    previousCategoryId: string;
    newCategoryId: string;
    updatedBy: string;
    reason?: string;
  }): ResourceCategoryChangedEvent {
    return new ResourceCategoryChangedEvent(
      `resource-category-changed-${payload.resourceId}-${Date.now()}`,
      EventType.RESOURCE_CATEGORY_CHANGED,
      "resources-service",
      new Date(),
      {
        resourceId: payload.resourceId,
        previousCategoryId: payload.previousCategoryId,
        newCategoryId: payload.newCategoryId,
        updatedBy: payload.updatedBy,
        reason: payload.reason,
      },
      {
        aggregateId: payload.resourceId,
        aggregateType: "Resource",
        version: 1,
      }
    );
  }
}
