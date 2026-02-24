import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Event payload when a category is updated
 */
export interface CategoryUpdatedPayload {
  categoryId: string;
  changes: Record<string, any>;
  previousValues?: Record<string, any>;
  updatedBy: string;
}

/**
 * Event Factory for Category Updated
 */
export class CategoryUpdatedEvent {
  static create(
    payload: CategoryUpdatedPayload
  ): EventPayload<CategoryUpdatedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.CATEGORY_UPDATED,
      service: 'resources-service',
      data: payload,
      timestamp: new Date(),
      metadata: {
        version: '1.0',
        aggregateType: 'Category',
        aggregateId: payload.categoryId,
      },
    };
  }
}
