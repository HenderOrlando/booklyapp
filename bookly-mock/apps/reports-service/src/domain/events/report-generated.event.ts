import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

export interface ReportGeneratedPayload {
  reportId: string;
  reportType: 'usage' | 'user_activity' | 'demand' | 'feedback' | 'custom';
  title: string;
  generatedBy: string;
  fileUrl?: string;
  filters?: Record<string, any>;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

export class ReportGeneratedEvent {
  static create(
    payload: ReportGeneratedPayload
  ): EventPayload<ReportGeneratedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.REPORT_GENERATED,
      service: 'reports-service',
      data: payload,
      timestamp: new Date(),
      metadata: {
        version: '1.0',
        aggregateType: 'Report',
        aggregateId: payload.reportId,
      },
    };
  }
}
