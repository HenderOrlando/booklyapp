import { EventType } from "@libs/common/enums";
import { EventPayload } from "@libs/common";

/**
 * Event payload when availability rules are updated
 */
export interface AvailabilityRulesUpdatedPayload {
  resourceId: string;
  rules: {
    requiresApproval: boolean;
    maxAdvanceBookingDays: number;
    minBookingDurationMinutes: number;
    maxBookingDurationMinutes: number;
    allowRecurring: boolean;
    customRules?: {
      businessHoursOnly?: boolean;
      weekdaysOnly?: boolean;
      maxConcurrentBookings?: number;
      requiresConfirmation?: boolean;
      cancellationDeadlineHours?: number;
    };
  };
  updatedBy: string;
  reason?: string;
}

/**
 * Event Factory
 */
export class AvailabilityRulesUpdatedEvent {
  static create(
    payload: AvailabilityRulesUpdatedPayload
  ): EventPayload<AvailabilityRulesUpdatedPayload> {
    return {
      eventId: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      eventType: EventType.AVAILABILITY_RULES_UPDATED,
      service: "resources-service",
      data: payload,
      timestamp: new Date(),
      metadata: {
        version: "1.0",
      },
    };
  }
}
