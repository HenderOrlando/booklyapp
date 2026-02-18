import { EventPayload, createLogger } from "@libs/common";
import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { KafkaAdapter, RabbitMQAdapter } from "./adapters";
import { EventStoreService } from "./event-store";
import {
  EventBusOptions,
  IEventBus,
  IEventStore,
  KafkaConfig,
  RabbitMQConfig,
} from "./interfaces";

const logger = createLogger("EventBusService");

/**
 * Event Bus Service
 * Facade unificado para Kafka/RabbitMQ + Event Store
 *
 * Proporciona:
 * - Abstracción de broker (Kafka o RabbitMQ)
 * - Event Sourcing automático
 * - Prefix management para topics
 * - Health checks
 */
@Injectable()
export class EventBusService
  implements IEventBus, OnModuleInit, OnModuleDestroy
{
  private adapter: IEventBus;
  private eventStore?: IEventStore;
  private topicPrefix: string;

  constructor(
    private readonly options: EventBusOptions,
    private readonly eventStoreService?: EventStoreService,
  ) {
    this.topicPrefix = options.topicPrefix || "";

    // Create adapter based on broker type
    if (options.brokerType === "kafka") {
      this.adapter = new KafkaAdapter(options.config as KafkaConfig);
    } else if (options.brokerType === "rabbitmq") {
      this.adapter = new RabbitMQAdapter(options.config as RabbitMQConfig);
    } else {
      throw new Error(`Unsupported broker type: ${options.brokerType}`);
    }

    // Setup event store if enabled
    if (options.enableEventStore && eventStoreService) {
      this.eventStore = eventStoreService;
    }

    logger.info("EventBusService initialized", {
      brokerType: options.brokerType,
      eventStoreEnabled: !!this.eventStore,
      topicPrefix: this.topicPrefix,
    });
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  async connect(): Promise<void> {
    await this.adapter.connect();
  }

  async disconnect(): Promise<void> {
    await this.adapter.disconnect();
  }

  async publish<T = any>(topic: string, event: EventPayload<T>): Promise<void> {
    const fullTopic = this.topicPrefix ? `${this.topicPrefix}.${topic}` : topic;

    // Save to event store first (if enabled)
    if (this.eventStore && event.data) {
      await this.saveToEventStore(event);
    }

    // Publish to broker
    await this.adapter.publish(fullTopic, event);

    logger.debug("Event published", {
      topic: fullTopic,
      eventType: event.eventType,
      eventId: event.eventId,
    });
  }

  async publishBatch<T = any>(
    events: Array<{ topic: string; event: EventPayload<T> }>,
  ): Promise<void> {
    // Save to event store
    if (this.eventStore) {
      const storedEvents = events.map(({ event }) => this.toStoredEvent(event));
      await this.eventStore.saveEvents(storedEvents);
    }

    // Add prefix to topics
    const prefixedEvents = events.map(({ topic, event }) => ({
      topic: this.topicPrefix ? `${this.topicPrefix}.${topic}` : topic,
      event,
    }));

    await this.adapter.publishBatch(prefixedEvents);

    logger.debug(`Batch of ${events.length} events published`);
  }

  async subscribe<T = any>(
    topic: string,
    groupId: string,
    handler: (event: EventPayload<T>) => Promise<void>,
  ): Promise<void> {
    const fullTopic = this.topicPrefix ? `${this.topicPrefix}.${topic}` : topic;
    await this.adapter.subscribe(fullTopic, groupId, handler);

    logger.info("Subscribed to topic", { topic: fullTopic, groupId });
  }

  async unsubscribe(topic: string): Promise<void> {
    const fullTopic = this.topicPrefix ? `${this.topicPrefix}.${topic}` : topic;
    await this.adapter.unsubscribe(fullTopic);

    logger.info("Unsubscribed from topic", { topic: fullTopic });
  }

  async isHealthy(): Promise<boolean> {
    return this.adapter.isHealthy();
  }

  getBrokerType(): string {
    return this.adapter.getBrokerType();
  }

  /**
   * Get Event Store instance
   */
  getEventStore(): IEventStore | undefined {
    return this.eventStore;
  }

  /**
   * Convert EventPayload to StoredEvent
   */
  private toStoredEvent<T>(event: EventPayload<T>): any {
    // Extract aggregate info from event data or metadata
    const metadata = (event as any).metadata || {};

    const aggregateId =
      (event as any).aggregateId ||
      metadata.aggregateId ||
      (event.data as any)?.id ||
      (event.data as any)?.userId ||
      (event.data as any)?.resourceId ||
      "unknown";

    const aggregateType =
      (event as any).aggregateType ||
      metadata.aggregateType ||
      this.inferAggregateType(event.eventType);

    return {
      eventId: event.eventId || `${Date.now()}-${Math.random()}`,
      eventType: event.eventType,
      aggregateId,
      aggregateType,
      version: (event as any).version || metadata.version || 1,
      data: event,
      correlationId: metadata.correlationId || (event as any).correlationId,
      causationId: metadata.causationId || (event as any).causationId,
      idempotencyKey: metadata.idempotencyKey || (event as any).idempotencyKey,
      metadata,
      timestamp: event.timestamp || new Date(),
      service: event.service || "unknown",
    };
  }

  /**
   * Save event to Event Store
   */
  private async saveToEventStore<T>(event: EventPayload<T>): Promise<void> {
    if (!this.eventStore) return;

    try {
      const storedEvent = this.toStoredEvent(event);
      await this.eventStore.saveEvent(storedEvent);

      logger.debug("Event saved to event store", {
        eventId: storedEvent.eventId,
        aggregateId: storedEvent.aggregateId,
      });
    } catch (error) {
      // Log error but don't fail the publish
      logger.error("Failed to save event to event store", error as Error, {
        eventId: event.eventId,
        eventType: event.eventType,
      });
    }
  }

  /**
   * Infer aggregate type from event type
   * Examples:
   * - user.created -> User
   * - resource.updated -> Resource
   * - reservation.cancelled -> Reservation
   */
  private inferAggregateType(eventType: string): string {
    const parts = eventType.split(".");
    if (parts.length > 0) {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
    return "Unknown";
  }
}
