import { JWT_SECRET } from "@libs/common/constants";
import { DatabaseModule, ReferenceDataModule } from "@libs/database";
import { EventBusModule } from "@libs/event-bus";
import { IdempotencyModule } from "@libs/idempotency";
import { NotificationsModule } from "@libs/notifications";
import { RedisModule } from "@libs/redis";
import { AuthClientModule } from "@libs/security";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";

// Módulos internos
import { AuditModule } from "./modules/audit/audit.module";

// Schemas
import {
  ConflictReport,
  ConflictReportSchema,
  DashboardMetric,
  DashboardMetricSchema,
  DemandReport,
  DemandReportSchema,
  UnsatisfiedDemand,
  UnsatisfiedDemandSchema,
  UsageReport,
  UsageReportSchema,
  UsageStatistic,
  UsageStatisticSchema,
  UserEvaluation,
  UserEvaluationSchema,
  UserFeedback,
  UserFeedbackSchema,
  UserReport,
  UserReportSchema,
} from "./infrastructure/schemas";
import {
  AuditEvent,
  AuditEventSchema,
} from "./infrastructure/schemas/audit-event.schema";
import {
  ComplianceReport,
  ComplianceReportSchema,
} from "./infrastructure/schemas/compliance-report.schema";
import { Export, ExportSchema } from "./infrastructure/schemas/export.schema";
import {
  ResourceCache,
  ResourceCacheSchema,
} from "./infrastructure/schemas/resource-cache.schema";

// Services
import {
  AuditAlertService,
  AuditAnalyticsService,
  ConflictReportService,
  CsvGeneratorService,
  DashboardService,
  DemandReportService,
  ExcelGeneratorService,
  ExportProcessorService,
  ExportService,
  FeedbackService,
  MetricsAggregationService,
  PdfGeneratorService,
  TrendAnalysisService,
  UsageReportService,
  UserEvaluationService,
  UserReportService,
} from "./application/services";
import { ComplianceReportService } from "./application/services/compliance-report.service";

// Repositories
import {
  ComplianceReportRepository,
  ConflictReportRepository,
  DashboardMetricRepository,
  DemandReportRepository,
  ExportRepository,
  FeedbackRepository,
  UsageReportRepository,
  UserEvaluationRepository,
  UserReportRepository,
} from "./infrastructure/repositories";

// Handlers
import { AllHandlers } from "./application/handlers";

// Controllers
import {
  DemandReportsController,
  HealthController,
  UsageReportsController,
  UserReportsController,
} from "./infrastructure/controllers";
import { AuditDashboardController } from "./infrastructure/controllers/audit-dashboard.controller";
import { AuditRecordsController } from "./infrastructure/controllers/audit-records.controller";
import { DashboardController } from "./infrastructure/controllers/dashboard.controller";
import { EvaluationController } from "./infrastructure/controllers/evaluation.controller";
import { ExportController } from "./infrastructure/controllers/export.controller";
import { FeedbackController } from "./infrastructure/controllers/feedback.controller";
import { ReferenceDataController } from "./infrastructure/controllers/reference-data.controller";
import { ReportsDashboardController } from "./infrastructure/controllers/reports-dashboard.controller";

// Consumers
import { AuditEventsConsumer } from "./infrastructure/consumers/audit-events.consumer";
import { ExportEventsConsumer } from "./infrastructure/consumers/export-events.consumer";
import { ReservationEventsConsumer } from "./infrastructure/consumers/reservation-events.consumer";
import { ResourceEventsConsumer } from "./infrastructure/consumers/resource-events.consumer";

// Strategy
import { JwtStrategy } from "./infrastructure/strategies/jwt.strategy";

/**
 * Reports Module
 * Módulo principal del servicio de reportes y análisis
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "apps/reports-service/.env"],
    }),
    I18nModule,
    EventBusModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        brokerType:
          configService.get("EVENT_BUS_TYPE") === "kafka"
            ? "kafka"
            : "rabbitmq",
        config:
          configService.get("EVENT_BUS_TYPE") === "kafka"
            ? {
                clientId: "reports-service",
                brokers: (
                  configService.get("KAFKA_BROKERS") || "localhost:9092"
                ).split(","),
                groupId: "reports-group",
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
    // Redis (required by IdempotencyModule)
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        host: configService.get("REDIS_HOST", "localhost"),
        port: configService.get("REDIS_PORT", 6379),
        password: configService.get("REDIS_PASSWORD"),
        db: configService.get("REDIS_DB", 0),
      }),
      inject: [ConfigService],
      serviceName: "reports-service",
    }),
    // MongoDB - Conexión global con librería estandarizada
    DatabaseModule,
    // Reference Data (tipos, estados dinámicos del dominio reports)
    ReferenceDataModule,
    MongooseModule.forFeature([
      { name: ComplianceReport.name, schema: ComplianceReportSchema },
      { name: ConflictReport.name, schema: ConflictReportSchema },
      { name: UsageReport.name, schema: UsageReportSchema },
      { name: DemandReport.name, schema: DemandReportSchema },
      { name: UserReport.name, schema: UserReportSchema },
      { name: UserFeedback.name, schema: UserFeedbackSchema },
      { name: UserEvaluation.name, schema: UserEvaluationSchema },
      { name: UsageStatistic.name, schema: UsageStatisticSchema },
      { name: UnsatisfiedDemand.name, schema: UnsatisfiedDemandSchema },
      { name: AuditEvent.name, schema: AuditEventSchema },
      { name: ResourceCache.name, schema: ResourceCacheSchema },
      { name: Export.name, schema: ExportSchema },
      { name: DashboardMetric.name, schema: DashboardMetricSchema },
    ]),
    CqrsModule,
    PassportModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRATION || "24h",
      },
    }),
    AuthClientModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        authServiceUrl:
          configService.get("AUTH_SERVICE_URL") || "http://localhost:3001",
      }),
      inject: [ConfigService],
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

    // Idempotency + Correlation
    IdempotencyModule.forRoot({ keyPrefix: "reports" }),

    // Módulo de auditoría (escucha eventos de todos los microservicios)
    AuditModule,
  ],
  controllers: [
    UsageReportsController,
    DemandReportsController,
    UserReportsController,
    AuditDashboardController,
    AuditRecordsController,
    DashboardController,
    ReportsDashboardController,
    EvaluationController,
    ExportController,
    FeedbackController,
    ReferenceDataController,
    HealthController,
  ],
  providers: [
    // Strategies
    JwtStrategy,

    // Services
    UsageReportService,
    DemandReportService,
    UserReportService,
    UserEvaluationService,
    ComplianceReportService,
    ConflictReportService, // Temporarily commented to test ComplianceReportService
    AuditAnalyticsService,
    AuditAlertService,
    DashboardService,
    ExportService,
    ExportProcessorService,
    FeedbackService,
    CsvGeneratorService,
    PdfGeneratorService,
    ExcelGeneratorService,
    MetricsAggregationService,
    TrendAnalysisService,

    // Consumers
    AuditEventsConsumer,
    ExportEventsConsumer,
    ReservationEventsConsumer,
    ResourceEventsConsumer,

    // Repositories
    {
      provide: "IUsageReportRepository",
      useClass: UsageReportRepository,
    },
    {
      provide: "IDemandReportRepository",
      useClass: DemandReportRepository,
    },
    {
      provide: "IUserReportRepository",
      useClass: UserReportRepository,
    },
    {
      provide: "IComplianceReportRepository",
      useClass: ComplianceReportRepository,
    },
    {
      provide: "IConflictReportRepository",
      useClass: ConflictReportRepository,
    },
    {
      provide: "IDashboardMetricRepository",
      useClass: DashboardMetricRepository,
    },
    {
      provide: "IExportRepository",
      useClass: ExportRepository,
    },
    {
      provide: "IFeedbackRepository",
      useClass: FeedbackRepository,
    },
    {
      provide: "IUserEvaluationRepository",
      useClass: UserEvaluationRepository,
    },

    // Handlers (CQRS)
    ...AllHandlers,
  ],
})
export class ReportsModule {}
