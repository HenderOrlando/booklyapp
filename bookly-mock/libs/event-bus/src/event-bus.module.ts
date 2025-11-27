import { DynamicModule, Module, Provider } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import {
  DeadLetterQueue,
  DeadLetterQueueSchema,
  DeadLetterQueueService,
} from "./dlq";
import { EventBusService } from "./event-bus.service";
import {
  AggregateSnapshot,
  AggregateSnapshotSchema,
  EventStore,
  EventStoreSchema,
  EventStoreService,
} from "./event-store";
import { EventBusOptions } from "./interfaces";
import { RequestReplyService } from "./patterns";

/**
 * Event Bus Module
 * Módulo unificado para eventos con soporte Kafka/RabbitMQ + Event Sourcing
 *
 * Uso:
 * ```typescript
 * EventBusModule.forRoot({
 *   brokerType: 'kafka',
 *   config: { clientId: 'my-service', brokers: ['localhost:9092'] },
 *   enableEventStore: true,
 *   topicPrefix: 'bookly'
 * })
 * ```
 */
@Module({})
export class EventBusModule {
  /**
   * Register Event Bus with static configuration
   */
  static forRoot(options: EventBusOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: "EVENT_BUS_OPTIONS",
        useValue: options,
      },
    ];

    const imports: any[] = [ConfigModule];

    // Add Event Store if enabled
    if (options.enableEventStore) {
      imports.push(
        MongooseModule.forFeature([
          { name: EventStore.name, schema: EventStoreSchema },
          {
            name: AggregateSnapshot.name,
            schema: AggregateSnapshotSchema,
          },
        ])
      );
      providers.push(EventStoreService);
    }

    // Add EventBusService
    providers.push({
      provide: EventBusService,
      useFactory: (
        eventBusOptions: EventBusOptions,
        eventStoreService?: EventStoreService
      ) => {
        return new EventBusService(eventBusOptions, eventStoreService);
      },
      inject: [
        "EVENT_BUS_OPTIONS",
        ...(options.enableEventStore ? [EventStoreService] : []),
      ],
    });

    // Add RequestReplyService
    providers.push(RequestReplyService);

    return {
      module: EventBusModule,
      imports,
      providers,
      exports: [
        EventBusService,
        RequestReplyService,
        ...(options.enableEventStore ? [EventStoreService] : []),
      ],
      global: true,
    };
  }

  /**
   * Register Event Bus with async configuration (from ConfigService)
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
      // Always provide EventStoreService when MongoDB is available
      EventStoreService,
      {
        provide: EventBusService,
        useFactory: async (
          eventBusOptions: EventBusOptions,
          eventStoreService?: EventStoreService
        ) => {
          return new EventBusService(eventBusOptions, eventStoreService);
        },
        inject: [
          "EVENT_BUS_OPTIONS",
          {
            token: EventStoreService,
            optional: true,
          },
        ],
      },
    ];

    const imports: any[] = [
      ConfigModule,
      // Always import MongoDB schemas for Event Store and DLQ
      MongooseModule.forFeature([
        { name: EventStore.name, schema: EventStoreSchema },
        {
          name: AggregateSnapshot.name,
          schema: AggregateSnapshotSchema,
        },
        {
          name: DeadLetterQueue.name,
          schema: DeadLetterQueueSchema,
        },
      ]),
    ];

    // Add DLQService
    providers.push(DeadLetterQueueService);

    // Add RequestReplyService
    providers.push(RequestReplyService);

    return {
      module: EventBusModule,
      imports,
      providers,
      exports: [
        EventBusService,
        EventStoreService,
        DeadLetterQueueService,
        RequestReplyService,
      ],
      global: true,
    };
  }
}
