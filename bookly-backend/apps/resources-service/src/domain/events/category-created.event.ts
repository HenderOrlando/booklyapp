import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Event payload when a new category is created
 */
export interface CategoryCreatedPayload {
  categoryId: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
  createdBy: string;
}

/**
 * Event Factory for Category Created
 */
export class CategoryCreatedEvent {
  static create(
    payload: CategoryCreatedPayload
  ): EventPayload<CategoryCreatedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.CATEGORY_CREATED,
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
