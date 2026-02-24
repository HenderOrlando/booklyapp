import {
  RecurringInstanceCancelledEvent,
  RecurringInstanceModifiedEvent,
  RecurringSeriesCancelledEvent,
  RecurringSeriesCreatedEvent,
  RecurringSeriesUpdatedEvent,
} from "@availability/domain/events/recurring-series.events";
import { EventType } from "@libs/common/enums";
import { EventPayload } from "@libs/common";
import { createLogger } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";

const logger = createLogger("RecurringReservationEventPublisher");

/**
 * Event Publisher para Series Recurrentes
 * Publica eventos de dominio a Kafka
 */
@Injectable()
export class RecurringReservationEventPublisherService {
  constructor(private readonly eventBusService: EventBusService) {}

  /**
   * Publica evento de serie recurrente creada
   */
  async publishSeriesCreated(
    event: RecurringSeriesCreatedEvent
  ): Promise<void> {
    try {
      const payload: EventPayload<RecurringSeriesCreatedEvent> = {
        eventId: uuidv4(),
        eventType: EventType.RECURRING_SERIES_CREATED,
        service: "availability-service",
        timestamp: new Date(),
        data: event,
      };

      await this.eventBusService.publish(EventType.RECURRING_SERIES_CREATED, {
        ...payload,
        metadata: {
          aggregateId: event.seriesId,
          aggregateType: "RecurringSeries",
          version: 1,
        },
      });

      logger.info("Event published: RecurringSeriesCreated", {
        seriesId: event.seriesId,
        userId: event.userId,
        totalInstances: event.totalInstances,
      });
    } catch (error) {
      logger.error(
        "Failed to publish RecurringSeriesCreated event",
        error as Error,
        { seriesId: event.seriesId }
      );
      // No lanzamos el error para no afectar el flujo principal
    }
  }

  /**
   * Publica evento de serie recurrente cancelada
   */
  async publishSeriesCancelled(
    event: RecurringSeriesCancelledEvent
  ): Promise<void> {
    try {
      const payload: EventPayload<RecurringSeriesCancelledEvent> = {
        eventId: uuidv4(),
        eventType: EventType.RECURRING_SERIES_CANCELLED,
        service: "availability-service",
        timestamp: new Date(),
        data: event,
      };

      await this.eventBusService.publish(EventType.RECURRING_SERIES_CANCELLED, {
        ...payload,
        metadata: {
          aggregateId: event.seriesId,
          aggregateType: "RecurringSeries",
          version: 1,
        },
      });

      logger.info("Event published: RecurringSeriesCancelled", {
        seriesId: event.seriesId,
        cancelledInstances: event.cancelledInstances,
        reason: event.reason,
      });
    } catch (error) {
      logger.error(
        "Failed to publish RecurringSeriesCancelled event",
        error as Error,
        { seriesId: event.seriesId }
      );
    }
  }

  /**
   * Publica evento de instancia recurrente modificada
   */
  async publishInstanceModified(
    event: RecurringInstanceModifiedEvent
  ): Promise<void> {
    try {
      const payload: EventPayload<RecurringInstanceModifiedEvent> = {
        eventId: uuidv4(),
        eventType: EventType.RECURRING_INSTANCE_MODIFIED,
        service: "availability-service",
        timestamp: new Date(),
        data: event,
      };

      await this.eventBusService.publish(
        EventType.RECURRING_INSTANCE_MODIFIED,
        {
          ...payload,
          metadata: {
            aggregateId: event.instanceId,
            aggregateType: "RecurringInstance",
            version: 1,
          },
        }
      );

      logger.info("Event published: RecurringInstanceModified", {
        instanceId: event.instanceId,
        seriesId: event.seriesId,
        changes: event.changes,
      });
    } catch (error) {
      logger.error(
        "Failed to publish RecurringInstanceModified event",
        error as Error,
        { instanceId: event.instanceId }
      );
    }
  }

  /**
   * Publica evento de serie recurrente actualizada
   */
  async publishSeriesUpdated(
    event: RecurringSeriesUpdatedEvent
  ): Promise<void> {
    try {
      const payload: EventPayload<RecurringSeriesUpdatedEvent> = {
        eventId: uuidv4(),
        eventType: EventType.RECURRING_SERIES_UPDATED,
        service: "availability-service",
        timestamp: new Date(),
        data: event,
      };

      await this.eventBusService.publish(EventType.RECURRING_SERIES_UPDATED, {
        ...payload,
        metadata: {
          aggregateId: event.seriesId,
          aggregateType: "RecurringSeries",
          version: 1,
        },
      });

      logger.info("Event published: RecurringSeriesUpdated", {
        seriesId: event.seriesId,
        affectedInstances: event.affectedInstances,
      });
    } catch (error) {
      logger.error(
        "Failed to publish RecurringSeriesUpdated event",
        error as Error,
        { seriesId: event.seriesId }
      );
    }
  }

  /**
   * Publica evento de instancia recurrente cancelada
   */
  async publishInstanceCancelled(
    event: RecurringInstanceCancelledEvent
  ): Promise<void> {
    try {
      const payload: EventPayload<RecurringInstanceCancelledEvent> = {
        eventId: uuidv4(),
        eventType: EventType.RECURRING_INSTANCE_CANCELLED,
        service: "availability-service",
        timestamp: new Date(),
        data: event,
      };

      await this.eventBusService.publish(
        EventType.RECURRING_INSTANCE_CANCELLED,
        {
          ...payload,
          metadata: {
            aggregateId: event.instanceId,
            aggregateType: "RecurringInstance",
            version: 1,
          },
        }
      );

      logger.info("Event published: RecurringInstanceCancelled", {
        instanceId: event.instanceId,
        seriesId: event.seriesId,
        reason: event.reason,
      });
    } catch (error) {
      logger.error(
        "Failed to publish RecurringInstanceCancelled event",
        error as Error,
        { instanceId: event.instanceId }
      );
    }
  }

  /**
   * Topics se inicializan automáticamente en EventBusService
   * Este método se mantiene para compatibilidad pero no hace nada
   */
  async initializeTopics(): Promise<void> {
    logger.info("Topics are automatically initialized by EventBusService");
  }
}
