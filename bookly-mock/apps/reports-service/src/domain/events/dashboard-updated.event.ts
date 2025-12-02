import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

export interface DashboardUpdatedPayload {
  dashboardId: string;
  dashboardType: 'admin' | 'user' | 'resource' | 'analytics';
  metrics: Record<string, any>;
  updatedBy: string;
  lastRefresh: Date;
}

export class DashboardUpdatedEvent {
  static create(
    payload: DashboardUpdatedPayload
  ): EventPayload<DashboardUpdatedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.DASHBOARD_UPDATED,
      service: 'reports-service',
      data: payload,
      timestamp: new Date(),
      metadata: {
        version: '1.0',
        aggregateType: 'Dashboard',
        aggregateId: payload.dashboardId,
      },
    };
  }
}
