import { EventType } from "@libs/common/enums";
import { EventPayload } from "@libs/common";
import { AvailabilityRulesDto } from '@availability/infrastructure/dtos/availability-rules.dto";

/**
 * Event payload when availability rules are updated in resources-service
 */
export interface AvailabilityRulesUpdatedPayload {
  resourceId: string;
  rules: AvailabilityRulesDto;
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
