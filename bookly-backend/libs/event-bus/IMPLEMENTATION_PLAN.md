# Event Bus Unificado - Plan de Implementación

## ✅ COMPLETADO

### 1. Interfaces (100%)

- ✅ `interfaces/event-bus.interface.ts` - Abstracción del Event Bus
- ✅ `interfaces/event-store.interface.ts` - Abstracción del Event Store
- ✅ `interfaces/index.ts` - Barrel exports

### 2. Adapters (100%)

- ✅ `adapters/kafka.adapter.ts` - Implementación para Kafka
- ✅ `adapters/rabbitmq.adapter.ts` - Implementación para RabbitMQ
- ✅ `adapters/index.ts` - Barrel exports

### 3. Event Store Schemas (100%)

- ✅ `event-store/event-store.schema.ts` - Schemas de Mongoose
  - EventStore collection (eventos inmutables)
  - AggregateSnapshot collection (snapshots)

### 4. Package Configuration (100%)

- ✅ `package.json` - Dependencias incluyendo kafkajs, amqplib

---

## 🚧 PENDIENTE

### 5. Event Store Service

**Archivo:** `event-store/event-store.service.ts`

```typescript
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  IEventStore,
  StoredEvent,
  AggregateSnapshot,
  EventReplayFilter,
} from "../interfaces";
import {
  EventStore,
  AggregateSnapshot as SnapshotDocument,
} from "./event-store.schema";
import { createLogger } from "@libs/common/src/utils/logger.util";

const logger = createLogger("EventStoreService");

@Injectable()
export class EventStoreService implements IEventStore {
  constructor(
    @InjectModel(EventStore.name) private eventModel: Model<EventStore>,
    @InjectModel(AggregateSnapshot.name)
    private snapshotModel: Model<SnapshotDocument>
  ) {}

  async saveEvent<T = any>(event: StoredEvent<T>): Promise<void> {
    await this.eventModel.create(event);
    logger.debug("Event saved", {
      eventId: event.eventId,
      aggregateId: event.aggregateId,
    });
  }

  async saveEvents<T = any>(events: StoredEvent<T>[]): Promise<void> {
    await this.eventModel.insertMany(events);
    logger.debug(`${events.length} events saved`);
  }

  async getEventsByAggregate(
    aggregateId: string,
    aggregateType: string
  ): Promise<StoredEvent[]> {
    return this.eventModel
      .find({ aggregateId, aggregateType })
      .sort({ version: 1 })
      .lean()
      .exec();
  }

  async getEventsByAggregateFromVersion(
    aggregateId: string,
    aggregateType: string,
    fromVersion: number
  ): Promise<StoredEvent[]> {
    return this.eventModel
      .find({ aggregateId, aggregateType, version: { $gte: fromVersion } })
      .sort({ version: 1 })
      .lean()
      .exec();
  }

  async getEventsByType(
    eventType: string,
    limit?: number
  ): Promise<StoredEvent[]> {
    const query = this.eventModel.find({ eventType }).sort({ timestamp: -1 });
    if (limit) {
      query.limit(limit);
    }
    return query.lean().exec();
  }

  async getEventsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<StoredEvent[]> {
    return this.eventModel
      .find({ timestamp: { $gte: startDate, $lte: endDate } })
      .sort({ timestamp: 1 })
      .lean()
      .exec();
  }

  async saveSnapshot(snapshot: AggregateSnapshot): Promise<void> {
    await this.snapshotModel.findOneAndUpdate(
      {
        aggregateId: snapshot.aggregateId,
        aggregateType: snapshot.aggregateType,
      },
      snapshot,
      { upsert: true, new: true }
    );
    logger.debug("Snapshot saved", {
      aggregateId: snapshot.aggregateId,
      version: snapshot.version,
    });
  }

  async getLatestSnapshot(
    aggregateId: string,
    aggregateType: string
  ): Promise<AggregateSnapshot | null> {
    return this.snapshotModel
      .findOne({ aggregateId, aggregateType })
      .sort({ version: -1 })
      .lean()
      .exec();
  }

  async replayEvents(
    handler: (event: StoredEvent) => Promise<void>,
    filter?: EventReplayFilter
  ): Promise<void> {
    const query: any = {};

    if (filter?.startDate || filter?.endDate) {
      query.timestamp = {};
      if (filter.startDate) query.timestamp.$gte = filter.startDate;
      if (filter.endDate) query.timestamp.$lte = filter.endDate;
    }

    if (filter?.eventTypes?.length) {
      query.eventType = { $in: filter.eventTypes };
    }

    if (filter?.aggregateTypes?.length) {
      query.aggregateType = { $in: filter.aggregateTypes };
    }

    if (filter?.aggregateIds?.length) {
      query.aggregateId = { $in: filter.aggregateIds };
    }

    if (filter?.services?.length) {
      query.service = { $in: filter.services };
    }

    const cursor = this.eventModel.find(query).sort({ timestamp: 1 }).cursor();

    for await (const event of cursor) {
      await handler(event.toObject());
    }

    logger.info("Event replay completed", { filter });
  }
}
```

### 6. Event Bus Service (Facade)

**Archivo:** `event-bus.service.ts`

```typescript
import { Injectable, OnModuleInit } from "@nestjs/common";
import { EventPayload } from "@libs/common/src/interfaces";
import { IEventBus, IEventStore, EventBusOptions } from "./interfaces";
import { KafkaAdapter, RabbitMQAdapter } from "./adapters";
import { EventStoreService } from "./event-store";
import { createLogger } from "@libs/common/src/utils/logger.util";

const logger = createLogger("EventBusService");

/**
 * Event Bus Service
 * Facade que unifica Kafka/RabbitMQ + Event Store
 */
@Injectable()
export class EventBusService implements IEventBus, OnModuleInit {
  private adapter: IEventBus;
  private eventStore?: IEventStore;
  private topicPrefix: string;

  constructor(
    private readonly options: EventBusOptions,
    private readonly eventStoreService?: EventStoreService
  ) {
    this.topicPrefix = options.topicPrefix || "";

    // Create adapter based on broker type
    if (options.brokerType === "kafka") {
      this.adapter = new KafkaAdapter(options.config as any);
    } else if (options.brokerType === "rabbitmq") {
      this.adapter = new RabbitMQAdapter(options.config as any);
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
    });
  }

  async onModuleInit() {
    await this.connect();
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
  }

  async publishBatch<T = any>(
    events: Array<{ topic: string; event: EventPayload<T> }>
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
  }

  async subscribe<T = any>(
    topic: string,
    groupId: string,
    handler: (event: EventPayload<T>) => Promise<void>
  ): Promise<void> {
    const fullTopic = this.topicPrefix ? `${this.topicPrefix}.${topic}` : topic;
    await this.adapter.subscribe(fullTopic, groupId, handler);
  }

  async unsubscribe(topic: string): Promise<void> {
    const fullTopic = this.topicPrefix ? `${this.topicPrefix}.${topic}` : topic;
    await this.adapter.unsubscribe(fullTopic);
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
    const aggregateId =
      (event as any).aggregateId || (event.data as any)?.id || "unknown";
    const aggregateType =
      (event as any).aggregateType || this.inferAggregateType(event.eventType);

    return {
      eventId: event.eventId || `${Date.now()}-${Math.random()}`,
      eventType: event.eventType,
      aggregateId,
      aggregateType,
      version: (event as any).version || 1,
      data: event,
      metadata: (event as any).metadata,
      timestamp: event.timestamp || new Date(),
      service: event.service || "unknown",
    };
  }

  /**
   * Save event to Event Store
   */
  private async saveToEventStore<T>(event: EventPayload<T>): Promise<void> {
    if (!this.eventStore) return;

    const storedEvent = this.toStoredEvent(event);
    await this.eventStore.saveEvent(storedEvent);
  }

  /**
   * Infer aggregate type from event type
   */
  private inferAggregateType(eventType: string): string {
    // user.created -> User
    // resource.updated -> Resource
    // reservation.cancelled -> Reservation
    const parts = eventType.split(".");
    if (parts.length > 0) {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
    return "Unknown";
  }
}
```

### 7. Event Bus Module

**Archivo:** `event-bus.module.ts`

```typescript
import { DynamicModule, Module, Provider } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { EventBusService } from "./event-bus.service";
import { EventStoreService } from "./event-store/event-store.service";
import {
  EventStore,
  EventStoreSchema,
  AggregateSnapshot,
  AggregateSnapshotSchema,
} from "./event-store/event-store.schema";
import { EventBusOptions } from "./interfaces";

@Module({})
export class EventBusModule {
  /**
   * Register Event Bus with configuration
   */
  static forRoot(options: EventBusOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: "EVENT_BUS_OPTIONS",
        useValue: options,
      },
      EventBusService,
    ];

    const imports: any[] = [ConfigModule];

    // Add Event Store if enabled
    if (options.enableEventStore) {
      imports.push(
        MongooseModule.forFeature([
          { name: EventStore.name, schema: EventStoreSchema },
          { name: AggregateSnapshot.name, schema: AggregateSnapshotSchema },
        ])
      );
      providers.push(EventStoreService);
    }

    return {
      module: EventBusModule,
      imports,
      providers,
      exports: [
        EventBusService,
        ...(options.enableEventStore ? [EventStoreService] : []),
      ],
      global: true,
    };
  }

  /**
   * Register Event Bus with async configuration
   */
  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<EventBusOptions> | EventBusOptions;
    inject?: any[];
  }): DynamicModule {
    const providers: Provider[] = [
      {
        provide: "EVENT_BUS_OPTIONS",
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
      {
        provide: EventBusService,
        useFactory: (
          eventBusOptions: EventBusOptions,
          eventStoreService?: EventStoreService
        ) => {
          return new EventBusService(eventBusOptions, eventStoreService);
        },
        inject: ["EVENT_BUS_OPTIONS", ...(options.inject || [])],
      },
    ];

    const imports: any[] = [ConfigModule];

    return {
      module: EventBusModule,
      imports,
      providers,
      exports: [EventBusService],
      global: true,
    };
  }
}
```

### 8. Main Index

**Archivo:** `src/index.ts`

```typescript
export * from "./interfaces";
export * from "./adapters";
export * from "./event-store/event-store.schema";
export * from "./event-store/event-store.service";
export * from "./event-bus.service";
export * from "./event-bus.module";
```

---

## 🔧 USO EN SERVICIOS

### Configuración en `stockpile.module.ts`

```typescript
import { Module } from "@nestjs/common";
import { EventBusModule } from "@libs/event-bus";

@Module({
  imports: [
    // Opción 1: Kafka
    EventBusModule.forRoot({
      brokerType: "kafka",
      config: {
        clientId: "stockpile-service",
        brokers: ["localhost:9092"],
        groupId: "stockpile-group",
      },
      enableEventStore: true,
      topicPrefix: "bookly",
    }),

    // Opción 2: RabbitMQ
    EventBusModule.forRoot({
      brokerType: "rabbitmq",
      config: {
        url: "amqp://bookly:bookly123@localhost:5672",
        exchange: "bookly-events",
        exchangeType: "topic",
        durable: true,
      },
      enableEventStore: true,
      topicPrefix: "bookly",
    }),

    // Opción 3: Configuración desde environment
    EventBusModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        brokerType:
          configService.get("EVENT_BUS_TYPE") === "kafka"
            ? "kafka"
            : "rabbitmq",
        config:
          configService.get("EVENT_BUS_TYPE") === "kafka"
            ? {
                clientId: configService.get("KAFKA_CLIENT_ID"),
                brokers: configService.get("KAFKA_BROKERS").split(","),
              }
            : {
                url: configService.get("RABBITMQ_URL"),
                exchange: configService.get("RABBITMQ_EXCHANGE"),
              },
        enableEventStore: configService.get("ENABLE_EVENT_STORE") === "true",
        topicPrefix: "bookly",
      }),
      inject: [ConfigService],
    }),
  ],
})
export class StockpileModule {}
```

### Variables de Entorno

```env
# Event Bus Configuration
EVENT_BUS_TYPE=kafka              # kafka | rabbitmq
ENABLE_EVENT_STORE=true

# Kafka Configuration
KAFKA_CLIENT_ID=stockpile-service
KAFKA_BROKERS=localhost:9092

# RabbitMQ Configuration
RABBITMQ_URL=amqp://bookly:bookly123@localhost:5672
RABBITMQ_EXCHANGE=bookly-events
```

### Uso en Servicios

```typescript
import { Injectable } from "@nestjs/common";
import { EventBusService } from "@libs/event-bus";
import { EventType } from "@libs/common/src/enums";

@Injectable()
export class UserService {
  constructor(private readonly eventBus: EventBusService) {}

  async createUser(dto: CreateUserDto) {
    const user = await this.repository.create(dto);

    // Publicar evento
    await this.eventBus.publish(EventType.USER_CREATED, {
      eventId: uuidv4(),
      eventType: EventType.USER_CREATED,
      service: "availability-service",
      timestamp: new Date(),
      data: {
        userId: user.id,
        name: user.name,
        email: user.email,
        program: user.program,
      },
      // Event Sourcing metadata
      aggregateId: user.id,
      aggregateType: "User",
      version: 1,
    });

    return user;
  }
}
```

---

## 📦 Instalación de Dependencias

```bash
cd /Users/henderorlando/Documents/GitHub/bookly-monorepo/bookly-mock
npm install kafkajs amqplib uuid
npm install --save-dev @types/amqplib
```

---

## ✅ Checklist Final

- [x] Crear interfaces
- [x] Crear Kafka adapter
- [x] Crear RabbitMQ adapter
- [x] Crear Event Store schemas
- [x] Crear package.json
- [ ] Crear Event Store service
- [ ] Crear Event Bus service (facade)
- [ ] Crear Event Bus module
- [ ] Crear index.ts principal
- [ ] Instalar dependencias
- [ ] Testing de integración
- [ ] Actualizar servicios para usar Event Bus unificado
- [ ] Documentar migración

---

## 🎯 Beneficios

1. **Transparencia**: Cambiar entre Kafka y RabbitMQ solo modificando configuración
2. **Event Sourcing**: Almacenamiento inmutable de eventos + snapshots
3. **Trazabilidad**: Correlation IDs, causation IDs
4. **Replay**: Reproducir eventos para reconstruir estado
5. **Escalabilidad**: Kafka para alto throughput, RabbitMQ para routing complejo
6. **DRY**: Código reutilizable en todos los servicios
