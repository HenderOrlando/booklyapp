import { createLogger } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import { EventStoreService } from "@libs/event-bus";
import { EventReplayFilter, StoredEvent } from "@libs/event-bus/interfaces";
import { Injectable, NotFoundException } from "@nestjs/common";
import {
  EventDashboardDataDto,
  EventMetricsResponseDto,
} from "../dto/events.dto";

const logger = createLogger("EventsService");

/**
 * Events Service for API Gateway
 * Provides metrics, dashboard data, and event replay capabilities
 */
@Injectable()
export class EventsService {
  private metrics = {
    startTime: Date.now(),
    totalEvents: 0,
    failedEvents: 0,
    retryCount: 0,
    latencies: [] as number[],
  };

  constructor(
    private readonly eventBusService: EventBusService,
    private readonly eventStoreService: EventStoreService
  ) {}

  /**
   * Get current event bus metrics
   */
  async getMetrics(): Promise<EventMetricsResponseDto> {
    const brokerType = this.eventBusService.getBrokerType();
    const isHealthy = await this.eventBusService.isHealthy();

    // Calculate average latency from recent latencies
    const recentLatencies = this.metrics.latencies.slice(-10);
    const avgLatency =
      recentLatencies.length > 0
        ? recentLatencies.reduce((a, b) => a + b, 0) / recentLatencies.length
        : 0;

    // Calculate throughput (events per second)
    const uptimeSeconds = (Date.now() - this.metrics.startTime) / 1000;
    const throughput =
      uptimeSeconds > 0 ? this.metrics.totalEvents / uptimeSeconds : 0;

    return {
      brokerType,
      avgLatency: parseFloat(avgLatency.toFixed(2)),
      throughput: parseFloat(throughput.toFixed(2)),
      totalEvents: this.metrics.totalEvents,
      failedEvents: this.metrics.failedEvents,
      retryCount: this.metrics.retryCount,
      eventStoreEnabled: !!this.eventBusService.getEventStore(),
      uptime: Date.now() - this.metrics.startTime,
      recentLatencies,
    };
  }

  /**
   * Get dashboard data
   */
  async getDashboardData(): Promise<EventDashboardDataDto> {
    const eventStore = this.eventBusService.getEventStore();

    if (!eventStore) {
      throw new NotFoundException("Event Store is not enabled");
    }

    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfHour = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours()
    );

    // Get recent events (last 20)
    const recentEvents = await this.getRecentEvents(20);

    // Calculate totals using event queries
    const eventsToday = await this.countEventsByDateRange(startOfDay, now);
    const eventsThisHour = await this.countEventsByDateRange(startOfHour, now);

    // Get top event types
    const topEventTypes = await this.getTopEventTypes(10);

    // Get events by service
    const eventsByService = await this.getEventsByService();

    return {
      totalEvents: this.metrics.totalEvents || recentEvents.length,
      eventsToday,
      eventsThisHour,
      topEventTypes,
      eventsByService,
      recentEvents: recentEvents.map((e) => ({
        eventId: e.eventId,
        eventType: e.eventType,
        service: e.service,
        aggregateType: e.aggregateType,
        aggregateId: e.aggregateId,
        timestamp: e.timestamp,
      })),
    };
  }

  /**
   * Replay events with filter
   */
  async replayEvents(filter: EventReplayFilter): Promise<StoredEvent[]> {
    const eventStore = this.eventBusService.getEventStore();

    if (!eventStore) {
      throw new NotFoundException("Event Store is not enabled");
    }

    const events: StoredEvent[] = [];

    await eventStore.replayEvents(async (event) => {
      events.push(event);
    }, filter);

    logger.info(`Replayed ${events.length} events`, { filter });

    return events;
  }

  /**
   * Get events by aggregate
   */
  async getEventsByAggregate(
    aggregateType: string,
    aggregateId: string
  ): Promise<StoredEvent[]> {
    const eventStore = this.eventBusService.getEventStore();

    if (!eventStore) {
      throw new NotFoundException("Event Store is not enabled");
    }

    return eventStore.getEventsByAggregate(aggregateId, aggregateType);
  }

  /**
   * Get events by type
   */
  async getEventsByType(
    eventType: string,
    limit?: number
  ): Promise<StoredEvent[]> {
    const eventStore = this.eventBusService.getEventStore();

    if (!eventStore) {
      throw new NotFoundException("Event Store is not enabled");
    }

    return eventStore.getEventsByType(eventType, limit);
  }

  /**
   * Get events by date range
   */
  async getEventsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<StoredEvent[]> {
    const eventStore = this.eventBusService.getEventStore();

    if (!eventStore) {
      throw new NotFoundException("Event Store is not enabled");
    }

    return eventStore.getEventsByDateRange(startDate, endDate);
  }

  /**
   * Record event metric (called when events are published)
   */
  recordEventMetric(latency: number, failed: boolean = false): void {
    this.metrics.totalEvents++;

    if (failed) {
      this.metrics.failedEvents++;
    }

    // Keep last 100 latencies
    this.metrics.latencies.push(latency);
    if (this.metrics.latencies.length > 100) {
      this.metrics.latencies.shift();
    }
  }

  /**
   * Record retry
   */
  recordRetry(): void {
    this.metrics.retryCount++;
  }

  // Private helper methods

  private async getRecentEvents(limit: number): Promise<StoredEvent[]> {
    const eventStore = this.eventBusService.getEventStore();
    if (!eventStore) return [];

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const events = await eventStore.getEventsByDateRange(oneDayAgo, now);
    return events.slice(-limit);
  }

  private async countEventsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const eventStore = this.eventBusService.getEventStore();
    if (!eventStore) return 0;

    const events = await eventStore.getEventsByDateRange(startDate, endDate);
    return events.length;
  }

  private async getTopEventTypes(
    limit: number
  ): Promise<Array<{ eventType: string; count: number }>> {
    const eventStore = this.eventBusService.getEventStore();
    if (!eventStore) return [];

    const events = await this.getRecentEvents(1000);

    // Count by event type
    const counts = events.reduce(
      (acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Sort by count and get top N
    return Object.entries(counts)
      .map(([eventType, count]) => ({ eventType, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  private async getEventsByService(): Promise<
    Array<{ service: string; count: number }>
  > {
    const eventStore = this.eventBusService.getEventStore();
    if (!eventStore) return [];

    const events = await this.getRecentEvents(1000);

    // Count by service
    const counts = events.reduce(
      (acc, event) => {
        const service = event.service || "unknown";
        acc[service] = (acc[service] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(counts)
      .map(([service, count]) => ({ service, count }))
      .sort((a, b) => b.count - a.count);
  }
}
