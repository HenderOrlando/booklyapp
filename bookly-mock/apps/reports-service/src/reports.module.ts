import { DatabaseModule } from "@libs/database";
import { EventBusModule } from "@libs/event-bus";
import { NotificationsModule } from "@libs/notifications";
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
    // MongoDB - Conexión global con librería estandarizada
    DatabaseModule,
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
      secret: process.env.JWT_SECRET || "bookly-secret-key",
      signOptions: {
        expiresIn: process.env.JWT_EXPIRATION || "24h",
      },
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
    EvaluationController,
    ExportController,
    FeedbackController,
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
