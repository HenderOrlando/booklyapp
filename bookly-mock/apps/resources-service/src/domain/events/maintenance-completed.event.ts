import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Event payload when maintenance is completed
 */
export interface MaintenanceCompletedPayload {
  maintenanceId: string;
  resourceId: string;
  resourceName: string;
  completedAt: Date;
  notes?: string;
  wasSuccessful: boolean;
  completedBy: string;
}

/**
 * Event Factory for Maintenance Completed
 */
export class MaintenanceCompletedEvent {
  static create(
    payload: MaintenanceCompletedPayload
  ): EventPayload<MaintenanceCompletedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.MAINTENANCE_COMPLETED,
      service: 'resources-service',
      data: payload,
      timestamp: new Date(),
      metadata: {
        version: '1.0',
        aggregateType: 'Maintenance',
        aggregateId: payload.maintenanceId,
      },
    };
  }
}
