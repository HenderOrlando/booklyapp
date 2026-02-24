import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

/**
 * Event payload when maintenance is scheduled for a resource
 */
export interface MaintenanceScheduledPayload {
  maintenanceId: string;
  resourceId: string;
  resourceName: string;
  scheduledStartDate: Date;
  scheduledEndDate: Date;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  scheduledBy: string;
}

/**
 * Event Factory for Maintenance Scheduled
 */
export class MaintenanceScheduledEvent {
  static create(
    payload: MaintenanceScheduledPayload
  ): EventPayload<MaintenanceScheduledPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.MAINTENANCE_SCHEDULED,
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
