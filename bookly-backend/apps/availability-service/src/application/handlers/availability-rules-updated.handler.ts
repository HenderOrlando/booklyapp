import { EventType } from "@libs/common/enums";
import { EventPayload } from "@libs/common";
import { createLogger } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { AvailabilityRulesUpdatedPayload } from "../events/availability-rules-updated.event";
import { AvailabilityRulesService } from "../services/availability-rules.service";

/**
 * Handler for AvailabilityRulesUpdated events from resources-service
 * Listens to Kafka topic and updates cache when rules change
 */
@Injectable()
export class AvailabilityRulesUpdatedHandler implements OnModuleInit {
  private readonly logger = createLogger("AvailabilityRulesUpdatedHandler");
  private readonly TOPIC = EventType.AVAILABILITY_SERVICE_RULES;
  private readonly GROUP_ID = EventType.AVAILABILITY_SERVICE_RULES_GROUP;

  constructor(
    private readonly eventBusService: EventBusService,
    private readonly rulesService: AvailabilityRulesService
  ) {}

  async onModuleInit() {
    try {
      // Subscribe to events using EventBusService
      await this.eventBusService.subscribe(
        this.TOPIC,
        this.GROUP_ID,
        this.handleEvent.bind(this)
      );

      this.logger.info("Subscribed to availability rules events", {
        topic: this.TOPIC,
        groupId: this.GROUP_ID,
      });
    } catch (error) {
      this.logger.error(
        "Error subscribing to availability rules events",
        error as Error
      );
    }
  }

  /**
   * Handle availability rules updated event
   */
  private async handleEvent(
    event: EventPayload<AvailabilityRulesUpdatedPayload>
  ): Promise<void> {
    try {
      this.logger.info("Availability rules updated event received", {
        eventId: event.eventId,
        resourceId: event.data.resourceId,
        eventType: event.eventType,
      });

      // Validate event type
      if (event.eventType !== EventType.AVAILABILITY_RULES_UPDATED) {
        this.logger.warn("Unexpected event type received", {
          expected: EventType.AVAILABILITY_RULES_UPDATED,
          received: event.eventType,
        });
        return;
      }

      const { resourceId, rules, updatedBy, reason } = event.data;

      // Update cached rules
      await this.rulesService.updateCachedRules(resourceId, rules);

      this.logger.info("Availability rules cache updated successfully", {
        eventId: event.eventId,
        resourceId,
        updatedBy,
        reason,
      });
    } catch (error) {
      this.logger.error(
        "Error handling availability rules updated event",
        error as Error,
        {
          eventId: event.eventId,
          resourceId: event.data?.resourceId,
        }
      );

      // No lanzar error para evitar que el consumer se detenga
      // Los errores se registran y el evento se marca como procesado
    }
  }
}
