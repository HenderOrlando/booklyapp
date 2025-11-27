import { DatabaseModule } from "@libs/database";
import { EventBusModule } from "@libs/event-bus";
import { NotificationsModule } from "@libs/notifications";
import { RedisModule } from "@libs/redis";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { AuditDecoratorsModule } from "@reports/audit-decorators";

// Schemas
import {
  ApprovalAuditLog,
  ApprovalAuditLogSchema,
  ApprovalFlow,
  ApprovalFlowSchema,
  ApprovalRequest,
  ApprovalRequestSchema,
  CheckInOut,
  CheckInOutSchema,
  DocumentTemplate,
  DocumentTemplateSchema,
  Notification,
  NotificationSchema,
  ReminderConfiguration,
  ReminderConfigurationSchema,
} from "./infrastructure/schemas";

// Repositories
import {
  ApprovalAuditLogRepository,
  ApprovalFlowRepository,
  ApprovalRequestRepository,
} from "./infrastructure/repositories";

// Services
import {
  ApprovalAuditService,
  ApprovalFlowService,
  ApprovalRequestService,
  CheckInOutService,
  DataEnrichmentService,
  DigitalSignatureService,
  GeolocationService,
  QRCodeService,
  ReminderService,
} from "./application/services";
import {
  NotificationProviderService,
  StockpileWebSocketService,
} from "./infrastructure/services";

// Clients
import { AuthServiceClient } from "./infrastructure/clients/auth-service.client";
import { AvailabilityServiceClient } from "./infrastructure/clients/availability-service.client";

// Handlers
import { AllHandlers } from "./application/handlers";

// Controllers
import {
  ApprovalFlowsController,
  ApprovalRequestsController,
  CheckInOutController,
  HealthController,
} from "./infrastructure/controllers";
import { MetricsController } from "./infrastructure/controllers/metrics.controller";

// Strategy
import { JwtStrategy } from "./infrastructure/strategies/jwt.strategy";

// Interceptors & Cache
import { CacheActiveApprovalsInterceptor } from "./infrastructure/interceptors/cache-active-approvals.interceptor";
import { CacheInvalidationService } from "./infrastructure/services/cache-invalidation.service";

// Event Handlers
import { AllEventHandlers } from "./infrastructure/event-handlers";
import { NotificationEventHandler } from "./infrastructure/handlers/notification-event.handler";

/**
 * Stockpile Module
 * Módulo principal del servicio de aprobaciones y flujos de trabajo
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "apps/stockpile-service/.env"],
    }),
    // DatabaseModule reemplaza MongooseModule.forRoot
    DatabaseModule,
    MongooseModule.forFeature([
      { name: ApprovalRequest.name, schema: ApprovalRequestSchema },
      { name: ApprovalFlow.name, schema: ApprovalFlowSchema },
      { name: DocumentTemplate.name, schema: DocumentTemplateSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: ApprovalAuditLog.name, schema: ApprovalAuditLogSchema },
      { name: CheckInOut.name, schema: CheckInOutSchema },
      { name: ReminderConfiguration.name, schema: ReminderConfigurationSchema },
    ]),
    CqrsModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || "bookly-secret-key",
      signOptions: {
        expiresIn: process.env.JWT_EXPIRATION || "24h",
      },
    }),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        host: configService.get("REDIS_HOST", "localhost"),
        port: configService.get("REDIS_PORT", 6379),
        password: configService.get("REDIS_PASSWORD"),
        db: configService.get("REDIS_DB", 0),
      }),
      inject: [ConfigService],
      serviceName: "stockpile-service",
    }),
    NotificationsModule.forRoot({
      brokerType: "rabbitmq",
      eventBus: {
        url:
          process.env.RABBITMQ_URL ||
          "amqp://bookly:bookly123@localhost:5672/bookly",
        exchange: "bookly-events",
        queue: "notifications_queue",
      },
      metricsEnabled: true,
      enableEventStore: false,
    }),
    EventBusModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        brokerType:
          configService.get("EVENT_BUS_TYPE") === "kafka"
            ? "kafka"
            : "rabbitmq",
        config:
          configService.get("EVENT_BUS_TYPE") === "kafka"
            ? {
                clientId: "stockpile-service",
                brokers: (
                  configService.get("KAFKA_BROKERS") || "localhost:9092"
                ).split(","),
                groupId: "stockpile-group",
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

    // Audit Decorators (event-driven audit)
    AuditDecoratorsModule,
  ],
  controllers: [
    ApprovalRequestsController,
    ApprovalFlowsController,
    CheckInOutController,
    HealthController,
    MetricsController,
  ],
  providers: [
    // Strategies
    JwtStrategy,

    // Services
    ApprovalRequestService,
    ApprovalFlowService,
    ApprovalAuditService,
    CheckInOutService,
    ReminderService,
    CacheInvalidationService,
    DataEnrichmentService,
    DigitalSignatureService,
    QRCodeService,
    GeolocationService,

    // Clients
    AuthServiceClient,
    AvailabilityServiceClient,

    // Notification Providers (legacy - a migrar completamente a @libs/notifications)
    NotificationProviderService,

    // WebSocket
    StockpileWebSocketService,

    // Interceptors
    CacheActiveApprovalsInterceptor,

    // Event Handlers
    ...AllEventHandlers,
    NotificationEventHandler,

    // Repositories
    {
      provide: "IApprovalRequestRepository",
      useClass: ApprovalRequestRepository,
    },
    {
      provide: "IApprovalFlowRepository",
      useClass: ApprovalFlowRepository,
    },
    {
      provide: "IApprovalAuditLogRepository",
      useClass: ApprovalAuditLogRepository,
    },

    // Handlers (CQRS)
    ...AllHandlers,
  ],
})
export class StockpileModule {}
