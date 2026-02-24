import { EventType, ResourceStatus } from "@libs/common/enums";
import { EventPayload } from "@libs/common";
import { createLogger } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { AvailabilityRulesService } from "../services/availability-rules.service";

/**
 * Payload del evento de cambio de estado de recurso
 */
export interface ResourceStatusChangedPayload {
  resourceId: string;
  previousStatus: ResourceStatus;
  newStatus: ResourceStatus;
  reason?: string;
  updatedBy: string;
}

/**
 * Handler for ResourceStatusChanged events from resources-service
 * Listens to status changes and invalidates cache when resource is blocked, deleted or in maintenance
 */
@Injectable()
export class ResourceStatusChangedHandler implements OnModuleInit {
  private readonly logger = createLogger("ResourceStatusChangedHandler");
  private readonly TOPIC_STATUS = EventType.RESOURCE_STATUS_CHANGED;
  private readonly TOPIC_DELETED = EventType.RESOURCE_DELETED;
  private readonly GROUP_ID =
    EventType.AVAILABILITY_SERVICE_RESOURCE_STATUS_GROUP;

  constructor(
    private readonly eventBusService: EventBusService,
    private readonly availabilityRulesService: AvailabilityRulesService
  ) {}

  async onModuleInit() {
    try {
      // Subscribe to resource status changed events
      await this.eventBusService.subscribe(
        this.TOPIC_STATUS,
        this.GROUP_ID,
        this.handleEvent.bind(this)
      );

      this.logger.info(
        `Subscribed to topic: ${this.TOPIC_STATUS} with group: ${this.GROUP_ID}`
      );

      // Subscribe to resource deleted events
      await this.eventBusService.subscribe(
        this.TOPIC_DELETED,
        this.GROUP_ID,
        this.handleEvent.bind(this)
      );

      this.logger.info(
        `Subscribed to topic: ${this.TOPIC_DELETED} with group: ${this.GROUP_ID}`
      );
    } catch (error) {
      this.logger.error(
        "Error subscribing to resource status events",
        error as Error
      );
    }
  }

  /**
   * Handle resource status changed or deleted event
   */
  private async handleEvent(
    event: EventPayload<ResourceStatusChangedPayload>
  ): Promise<void> {
    try {
      this.logger.info("Resource status event received", {
        eventId: event.eventId,
        eventType: event.eventType,
        resourceId: event.data.resourceId,
      });

      // Validate event type
      if (
        event.eventType !== EventType.RESOURCE_STATUS_CHANGED &&
        event.eventType !== EventType.RESOURCE_DELETED
      ) {
        this.logger.warn("Unexpected event type received", {
          expected: [
            EventType.RESOURCE_STATUS_CHANGED,
            EventType.RESOURCE_DELETED,
          ],
          received: event.eventType,
        });
        return;
      }

      const { resourceId, newStatus, previousStatus, reason } = event.data;

      // Determine if cache should be invalidated
      const shouldInvalidate = this.shouldInvalidateCache(
        newStatus,
        event.eventType
      );

      if (shouldInvalidate) {
        // Invalidate cache for this resource
        await this.availabilityRulesService.invalidateCachedRules(resourceId);

        this.logger.info("Resource cache invalidated due to status change", {
          resourceId,
          previousStatus,
          newStatus,
          reason,
          eventType: event.eventType,
        });
      } else {
        this.logger.debug("Cache invalidation not required", {
          resourceId,
          newStatus,
        });
      }
    } catch (error) {
      this.logger.error(
        "Error handling resource status event",
        error as Error,
        {
          eventId: event.eventId,
          resourceId: event.data.resourceId,
        }
      );
      // No lanzar error para no detener el consumer de Kafka
    }
  }

  /**
   * Determine if cache should be invalidated based on new status
   */
  private shouldInvalidateCache(
    newStatus: ResourceStatus,
    eventType: string
  ): boolean {
    // Always invalidate on deletion
    if (eventType === EventType.RESOURCE_DELETED) {
      return true;
    }

    // Invalidate if resource is going to unavailable or maintenance state
    const invalidatingStatuses = [
      ResourceStatus.UNAVAILABLE,
      ResourceStatus.MAINTENANCE,
    ];

    return invalidatingStatuses.includes(newStatus);
  }
}
