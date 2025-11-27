import { DatabaseModule } from "@libs/database";
import { EventBusModule } from "@libs/event-bus";
import { RedisModule } from "@libs/redis";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { ScheduleModule } from "@nestjs/schedule";
import { AuditDecoratorsModule } from "@reports/audit-decorators";

// Schemas
import {
  Availability,
  AvailabilityException,
  AvailabilityExceptionSchema,
  AvailabilitySchema,
  MaintenanceBlock,
  MaintenanceBlockSchema,
  ReassignmentHistory,
  ReassignmentHistorySchema,
  Reservation,
  ReservationHistory,
  ReservationHistorySchema,
  ReservationSchema,
  ResourceMetadata,
  ResourceMetadataSchema,
  WaitingList,
  WaitingListSchema,
} from "./infrastructure/schemas";

// Repositories
import { AvailabilityExceptionRepository } from "./infrastructure/repositories/availability-exception.repository";
import { AvailabilityRepository } from "./infrastructure/repositories/availability.repository";
import { MaintenanceBlockRepository } from "./infrastructure/repositories/maintenance-block.repository";
import { ReassignmentHistoryRepository } from "./infrastructure/repositories/reassignment-history.repository";
import { ReservationHistoryRepository } from "./infrastructure/repositories/reservation-history.repository";
import { ReservationRepository } from "./infrastructure/repositories/reservation.repository";
import { ResourceMetadataRepository } from "./infrastructure/repositories/resource-metadata.repository";
import { WaitingListRepository } from "./infrastructure/repositories/waiting-list.repository";

// Services
import {
  AvailabilityService,
  RecurringReservationCacheService,
  RecurringReservationEventPublisherService,
  RecurringReservationService,
  ReservationService,
  WaitingListService,
} from "./application/services";
import { AvailabilityRulesService } from "./application/services/availability-rules.service";
import { CalendarExportService } from "./application/services/calendar-export.service";
import { CalendarViewService } from "./application/services/calendar-view.service";
import { MaintenanceNotificationService } from "./application/services/maintenance-notification.service";
import { ReassignmentService } from "./application/services/reassignment.service";
import { ResourceSimilarityService } from "./application/services/resource-similarity.service";
import { ResourcesEventService } from "./application/services/resources-event.service";
import { SlotColorService } from "./application/services/slot-color.service";

// Handlers
import { AllHandlers } from "./application/handlers";
import { AvailabilityRulesUpdatedHandler } from "./application/handlers/availability-rules-updated.handler";
import { ResourceStatusChangedHandler } from "./application/handlers/resource-status-changed.handler";
import { ResourceSyncHandler } from "./application/handlers/resource-sync.handler";

// Controllers
import {
  AvailabilitiesController,
  HealthController,
  ReservationsController,
  WaitingListsController,
} from "./infrastructure/controllers";
import { AvailabilityExceptionsController } from "./infrastructure/controllers/availability-exceptions.controller";
import { CalendarViewController } from "./infrastructure/controllers/calendar-view.controller";
import { HistoryController } from "./infrastructure/controllers/history.controller";
import { MaintenanceBlocksController } from "./infrastructure/controllers/maintenance-blocks.controller";
import { MetricsController } from "./infrastructure/controllers/metrics.controller";
import { ReassignmentController } from "./infrastructure/controllers/reassignment.controller";

// CronJobs
import { ExceptionsCleanupCron } from "./infrastructure/cron/exceptions-cleanup.cron";
import { MaintenanceStatusCron } from "./infrastructure/cron/maintenance-status.cron";

// Strategy
import { JwtStrategy } from "./infrastructure/strategies/jwt.strategy";

/**
 * Availability Module
 * Módulo principal del servicio de disponibilidad y reservas
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "apps/availability-service/.env"],
    }),
    // DatabaseModule reemplaza MongooseModule.forRoot
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Reservation.name, schema: ReservationSchema },
      { name: Availability.name, schema: AvailabilitySchema },
      { name: WaitingList.name, schema: WaitingListSchema },
      { name: ResourceMetadata.name, schema: ResourceMetadataSchema },
      { name: ReservationHistory.name, schema: ReservationHistorySchema },
      { name: AvailabilityException.name, schema: AvailabilityExceptionSchema },
      { name: MaintenanceBlock.name, schema: MaintenanceBlockSchema },
      { name: ReassignmentHistory.name, schema: ReassignmentHistorySchema },
    ]),
    CqrsModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || "bookly-secret-key",
      signOptions: {
        expiresIn: process.env.JWT_EXPIRATION || "24h",
      },
    }),
    // Event-Driven Architecture
    EventBusModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        brokerType:
          configService.get("EVENT_BUS_TYPE") === "kafka"
            ? "kafka"
            : "rabbitmq",
        config:
          configService.get("EVENT_BUS_TYPE") === "kafka"
            ? {
                clientId: "availability-service",
                brokers: (
                  configService.get("KAFKA_BROKERS") || "localhost:9092"
                ).split(","),
                groupId: "availability-group",
              }
            : {
                url:
                  configService.get("RABBITMQ_URL") ||
                  "amqp://bookly:bookly123@localhost:5672/bookly",
                exchange: "bookly-events",
                exchangeType: "topic",
                durable: true,
                prefetchCount: 1,
              },
        enableEventStore: configService.get("ENABLE_EVENT_STORE") === "true",
        topicPrefix: "bookly",
      }),
      inject: [ConfigService],
    }),
    // Redis Cache with Metrics
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        host: configService.get("REDIS_HOST", "localhost"),
        port: configService.get("REDIS_PORT", 6379),
        password: configService.get("REDIS_PASSWORD"),
        db: configService.get("REDIS_DB", 0),
      }),
      inject: [ConfigService],
      serviceName: "availability-service",
    }),
    // Audit Decorators Module (event-driven audit)
    // Los registros de auditoría se emiten como eventos y son persistidos por reports-service
    AuditDecoratorsModule,
    // Schedule Module for CronJobs
    ScheduleModule.forRoot(),
  ],
  controllers: [
    ReservationsController,
    AvailabilitiesController,
    WaitingListsController,
    HistoryController,
    CalendarViewController,
    AvailabilityExceptionsController,
    MaintenanceBlocksController,
    ReassignmentController,
    HealthController,
    MetricsController,
  ],
  providers: [
    // Strategies
    JwtStrategy,

    // Services
    ReservationService,
    AvailabilityService,
    WaitingListService,
    AvailabilityRulesService,
    RecurringReservationService,
    RecurringReservationCacheService,
    RecurringReservationEventPublisherService,
    CalendarViewService,
    SlotColorService,
    ReassignmentService,
    ResourceSimilarityService,
    MaintenanceNotificationService,
    ResourcesEventService,
    CalendarExportService,

    // Repositories
    {
      provide: "IReservationRepository",
      useClass: ReservationRepository,
    },
    {
      provide: "IAvailabilityRepository",
      useClass: AvailabilityRepository,
    },
    {
      provide: "IWaitingListRepository",
      useClass: WaitingListRepository,
    },
    {
      provide: "IResourceMetadataRepository",
      useClass: ResourceMetadataRepository,
    },
    ReservationHistoryRepository,
    AvailabilityExceptionRepository,
    MaintenanceBlockRepository,
    ReassignmentHistoryRepository,

    // CronJobs
    MaintenanceStatusCron,
    ExceptionsCleanupCron,

    // Handlers (CQRS)
    ...AllHandlers,

    // Event Handlers (EDA)
    AvailabilityRulesUpdatedHandler,
    ResourceStatusChangedHandler,
    ResourceSyncHandler,
  ],
})
export class AvailabilityModule {}
