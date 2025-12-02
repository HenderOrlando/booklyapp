import { EventType } from '@libs/common/enums';
import { EventPayload } from '@libs/common';

export interface ScheduleConflictDetectedPayload {
  resourceId: string;
  conflictingReservations: string[];
  timeSlot: {
    startTime: Date;
    endTime: Date;
  };
  detectedAt: Date;
}

export class ScheduleConflictDetectedEvent {
  static create(
    payload: ScheduleConflictDetectedPayload
  ): EventPayload<ScheduleConflictDetectedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.SCHEDULE_CONFLICT_DETECTED,
      service: 'availability-service',
      data: payload,
      timestamp: new Date(),
      metadata: {
        version: '1.0',
        aggregateType: 'ScheduleConflict',
      },
    };
  }
}
