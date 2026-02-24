#!/usr/bin/env ts-node

/**
 * Script para popular Event Store con eventos de prueba
 * Para testing de Event Replay
 */

import { Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { MongooseModule } from "@nestjs/mongoose";
import { v4 as uuidv4 } from "uuid";
import { createLogger } from "../libs/common/src/utils/logger.util";
import { EventBusModule } from "../libs/event-bus/src/event-bus.module";
import { EventStoreService } from "../libs/event-bus/src/event-store/event-store.service";

const logger = createLogger("SeedEventsScript");

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_GATEWAY_URI ||
        "mongodb://bookly:bookly123@localhost:27022/bookly-gateway"
    ),
    EventBusModule.forRoot({
      brokerType: "rabbitmq",
      config: {
        url:
          process.env.RABBITMQ_URL || "amqp://bookly:bookly123@localhost:5672",
        exchange: "bookly-events",
        exchangeType: "topic",
        durable: true,
      },
      enableEventStore: true,
      topicPrefix: "bookly",
    }),
  ],
})
class SeedModule {}

const EVENT_TYPES = [
  "RESOURCE_CREATED",
  "RESOURCE_UPDATED",
  "RESOURCE_DELETED",
  "RESERVATION_CREATED",
  "RESERVATION_UPDATED",
  "RESERVATION_CANCELLED",
  "USER_CREATED",
  "USER_UPDATED",
  "APPROVAL_REQUESTED",
  "APPROVAL_GRANTED",
];

const SERVICES = [
  "resources-service",
  "availability-service",
  "auth-service",
  "stockpile-service",
  "reports-service",
];

const AGGREGATE_TYPES = ["Resource", "Reservation", "User", "Approval"];

async function seedEvents() {
  logger.info("🌱 Starting Event Store seeding...");

  const app = await NestFactory.createApplicationContext(SeedModule);
  const eventStoreService = app.get(EventStoreService);

  const eventsToSeed = 1000;
  const batchSize = 100;
  const startDate = new Date("2024-01-01");
  const endDate = new Date();

  let totalSeeded = 0;

  for (let i = 0; i < eventsToSeed; i += batchSize) {
    const batch: any[] = [];
    const currentBatchSize = Math.min(batchSize, eventsToSeed - i);

    for (let j = 0; j < currentBatchSize; j++) {
      const eventIndex = i + j;
      const eventType = EVENT_TYPES[eventIndex % EVENT_TYPES.length];
      const service = SERVICES[eventIndex % SERVICES.length];
      const aggregateType =
        AGGREGATE_TYPES[eventIndex % AGGREGATE_TYPES.length];
      const aggregateId = `aggregate-${Math.floor(eventIndex / 10)}`;

      // Random timestamp between startDate and endDate
      const timestamp = new Date(
        startDate.getTime() +
          Math.random() * (endDate.getTime() - startDate.getTime())
      );

      const event = {
        eventId: uuidv4(),
        eventType,
        aggregateId,
        aggregateType,
        version: Math.floor(eventIndex / 10) + 1,
        data: {
          eventId: uuidv4(),
          eventType,
          service,
          timestamp,
          data: {
            id: aggregateId,
            action: eventType.toLowerCase(),
            metadata: {
              userId: `user-${eventIndex % 100}`,
              program: `program-${eventIndex % 10}`,
            },
          },
        },
        metadata: {
          correlationId: uuidv4(),
          causationId: eventIndex > 0 ? uuidv4() : undefined,
          userId: `user-${eventIndex % 100}`,
        },
        timestamp,
        service,
      };

      batch.push(event);
    }

    await eventStoreService.saveEvents(batch);
    totalSeeded += batch.length;

    const progress = Math.floor((totalSeeded / eventsToSeed) * 100);
    logger.info(
      `📊 Progress: ${progress}% (${totalSeeded}/${eventsToSeed} events)`
    );
  }

  // Create some snapshots for testing
  logger.info("📸 Creating snapshots...");

  for (let i = 0; i < 10; i++) {
    const aggregateId = `aggregate-${i}`;
    const aggregateType = AGGREGATE_TYPES[i % AGGREGATE_TYPES.length];

    await eventStoreService.saveSnapshot({
      aggregateId,
      aggregateType,
      version: 10,
      state: {
        id: aggregateId,
        lastUpdated: new Date(),
        eventCount: 10,
      },
      timestamp: new Date(),
    });
  }

  logger.info("✅ Created 10 snapshots");

  // Show statistics
  const stats = await getStats(eventStoreService);
  logger.info("📊 Event Store Statistics:", {
    totalEvents: stats.totalEvents,
    eventTypes: stats.eventTypes.length,
    services: stats.services.length,
    aggregateTypes: stats.aggregateTypes.length,
    snapshots: stats.snapshots,
  });

  await app.close();
  logger.info("✅ Seeding completed successfully!");
}

async function getStats(eventStoreService: EventStoreService) {
  const now = new Date();
  const startDate = new Date("2020-01-01");

  const allEvents = await eventStoreService.getEventsByDateRange(
    startDate,
    now
  );

  const eventTypes = new Set(allEvents.map((e) => e.eventType));
  const services = new Set(allEvents.map((e) => e.service));
  const aggregateTypes = new Set(allEvents.map((e) => e.aggregateType));

  return {
    totalEvents: allEvents.length,
    eventTypes: Array.from(eventTypes),
    services: Array.from(services),
    aggregateTypes: Array.from(aggregateTypes),
    snapshots: 10, // We created 10
  };
}

// Run seeding
seedEvents().catch((error) => {
  logger.error("❌ Error seeding events", error);
  process.exit(1);
});
