import { JWT_SECRET } from "@libs/common/constants";
import { DatabaseModule } from "@libs/database";
import { EventBusModule } from "@libs/event-bus";
import {
  ChannelWebhookService,
  FirebaseWebhookHandler,
  MetaWhatsAppWebhookHandler,
  NotificationMetricsService,
  SendGridWebhookHandler,
  TwilioWebhookHandler,
} from "@libs/notifications";
import { RedisModule } from "@libs/redis";
import { AuthClientModule } from "@libs/security";
import { StorageModule } from "@libs/storage";
import { HttpModule } from "@nestjs/axios";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { AuditDecoratorsModule } from "@reports/audit-decorators";
import { CacheMetricsAggregatorService } from "./application/services/cache-metrics-aggregator.service";
import { CircuitBreakerRedisService } from "./application/services/circuit-breaker-redis.service";
import { EventsService } from "./application/services/events.service";
import { LogStreamingService } from "./application/services/log-streaming.service";
import { NotificationService } from "./application/services/notification.service";
import { ProxyService } from "./application/services/proxy.service";
import { RateLimiterRedisService } from "./application/services/rate-limiter-redis.service";
import { RequestReplyService } from "./application/services/request-reply.service";
import { SagaService } from "./application/services/saga.service";
import { CacheMetricsController } from "./infrastructure/controllers/cache-metrics.controller";
import { DLQController } from "./infrastructure/controllers/dlq.controller";
import { EventsController } from "./infrastructure/controllers/events.controller";
import { FileManagerController } from "./infrastructure/controllers/file-manager.controller";
import { HealthController } from "./infrastructure/controllers/health.controller";
import { NotificationsController } from "./infrastructure/controllers/notifications.controller";
import { ProxyController } from "./infrastructure/controllers/proxy.controller";
import { JwtExtractorMiddleware } from "./infrastructure/middleware/jwt-extractor.middleware";
import { JwtStrategy } from "./infrastructure/strategies/jwt.strategy";
import { BooklyWebSocketGateway } from "./infrastructure/websocket/websocket.gateway";
import { WebhookDashboardController } from "./webhooks/controllers/webhook-dashboard.controller";
import {
  WebhookLog,
  WebhookLogSchema,
} from "./webhooks/schemas/webhook-log.schema";
import { Webhook, WebhookSchema } from "./webhooks/schemas/webhook.schema";

/**
 * API Gateway Module
 * Módulo principal del API Gateway que unifica todos los microservicios
 * Implementa patrón híbrido:
 * - Queries (GET) → HTTP directo
 * - Commands (POST/PUT/DELETE) → Kafka eventos
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "apps/api-gateway/.env"],
    }),
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    // Base de datos MongoDB usando librería estandarizada
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Webhook.name, schema: WebhookSchema },
      { name: WebhookLog.name, schema: WebhookLogSchema },
    ]),
    PassportModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: "24h" },
    }),
    StorageModule.forRoot({ provider: "local" }),
    AuthClientModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        authServiceUrl:
          configService.get("AUTH_SERVICE_URL") || "http://localhost:3001",
        timeout: 5000,
        maxRetries: 2,
      }),
      inject: [ConfigService],
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
                clientId: "api-gateway",
                brokers: (
                  configService.get("KAFKA_BROKERS") || "localhost:9092"
                ).split(","),
                groupId: "gateway-group",
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
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        host: configService.get("REDIS_HOST", "localhost"),
        port: configService.get("REDIS_PORT", 6379),
        password: configService.get("REDIS_PASSWORD"),
        db: configService.get("REDIS_DB", 0),
      }),
      inject: [ConfigService],
      serviceName: "api-gateway",
    }),

    // Audit Decorators (event-driven audit) // TEMPORARILY DISABLED - ES module resolution issue
    AuditDecoratorsModule,
  ],
  controllers: [
    HealthController,
    ProxyController,
    EventsController,
    DLQController,
    NotificationsController,
    CacheMetricsController,
    FileManagerController,
    WebhookDashboardController,
  ],
  providers: [
    ProxyService,
    EventsService,
    CircuitBreakerRedisService,
    RateLimiterRedisService,
    RequestReplyService,
    SagaService,
    NotificationService,
    LogStreamingService,
    CacheMetricsAggregatorService,
    BooklyWebSocketGateway,

    // JWT Strategy for admin endpoints
    JwtStrategy,

    // Webhook/Notification providers (registered directly to avoid duplicate EventBus connection)
    ChannelWebhookService,
    SendGridWebhookHandler,
    TwilioWebhookHandler,
    MetaWhatsAppWebhookHandler,
    FirebaseWebhookHandler,
    NotificationMetricsService,
  ],
})
export class ApiGatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Aplicar JWT Extractor a todas las rutas
    consumer.apply(JwtExtractorMiddleware).forRoutes("*");
  }
}
