import { DatabaseModule } from "@libs/database";
import { EventBusModule, EventBusService } from "@libs/event-bus";
import { RedisModule, RedisService } from "@libs/redis";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { AuditDecoratorsModule } from "@reports/audit-decorators";
import { JwtStrategy } from "./infrastructure/strategies/jwt.strategy";

// Application Layer
import * as EventHandlers from "./application/event-handlers";
import { AllHandlers } from "./application/handlers";
import {
  AttributeValidationService,
  CategoryService,
  MaintenanceService,
  ResourceService,
} from "./application/services";

// Infrastructure Layer
import {
  CategoriesController,
  HealthController,
  ImportController,
  MaintenancesController,
  ResourcesController,
} from "./infrastructure/controllers";
import {
  CategoryRepository,
  ImportJobRepository,
  MaintenanceRepository,
  ResourceRepository,
} from "./infrastructure/repositories";
import {
  Category,
  CategorySchema,
  ImportJob,
  ImportJobSchema,
  Maintenance,
  MaintenanceSchema,
  Program,
  ProgramSchema,
  Resource,
  ResourceSchema,
} from "./infrastructure/schemas";

// Repository Interfaces Tokens
const RESOURCE_REPOSITORY = "IResourceRepository";
const CATEGORY_REPOSITORY = "ICategoryRepository";
const MAINTENANCE_REPOSITORY = "IMaintenanceRepository";
const IMPORT_JOB_REPOSITORY = "IImportJobRepository";

/**
 * Resources Module
 * Módulo principal del servicio de recursos
 */
@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "apps/resources-service/.env"],
    }),

    // CQRS
    CqrsModule,

    // MongoDB - Conexión global con librería estandarizada
    DatabaseModule,

    // Schemas
    MongooseModule.forFeature([
      { name: Resource.name, schema: ResourceSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Maintenance.name, schema: MaintenanceSchema },
      { name: Program.name, schema: ProgramSchema },
      { name: ImportJob.name, schema: ImportJobSchema },
    ]),

    // JWT
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>("JWT_SECRET") ||
          "bookly-secret-key-change-in-production",
        signOptions: {
          expiresIn: configService.get<string>("JWT_EXPIRATION") || "1d",
        },
      }),
      inject: [ConfigService],
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
                clientId: "resources-service",
                brokers: (
                  configService.get("KAFKA_BROKERS") || "localhost:9092"
                ).split(","),
                groupId: "resources-group",
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

    // Redis Cache
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        host: configService.get("REDIS_HOST", "localhost"),
        port: configService.get("REDIS_PORT", 6379),
        password: configService.get("REDIS_PASSWORD"),
        db: configService.get("REDIS_DB", 0),
      }),
      inject: [ConfigService],
    }),

    // Audit Decorators (event-driven audit)
    AuditDecoratorsModule,
  ],
  controllers: [
    ResourcesController,
    CategoriesController,
    MaintenancesController,
    ImportController,
    HealthController,
  ],
  providers: [
    // JWT Strategy
    JwtStrategy,

    // CQRS Handlers
    ...AllHandlers,

    // Event Handlers (EDA)
    EventHandlers.QueryResourceByIdHandler,
    EventHandlers.QueryCandidateResourcesHandler,
    EventHandlers.QueryResourcesByIdsHandler,
    EventHandlers.CheckResourceAvailabilityHandler,

    // Services
    AttributeValidationService,
    ResourceService,
    CategoryService,
    MaintenanceService,

    // Repository Implementations
    {
      provide: RESOURCE_REPOSITORY,
      useClass: ResourceRepository,
    },
    {
      provide: CATEGORY_REPOSITORY,
      useClass: CategoryRepository,
    },
    {
      provide: MAINTENANCE_REPOSITORY,
      useClass: MaintenanceRepository,
    },
    {
      provide: IMPORT_JOB_REPOSITORY,
      useClass: ImportJobRepository,
    },

    // Direct Repository Injections (for handlers)
    ResourceRepository,
    CategoryRepository,
    MaintenanceRepository,
    ImportJobRepository,

    // Inject Repositories into Services
    {
      provide: ResourceService,
      useFactory: (
        resourceRepository: ResourceRepository,
        eventBusService: any,
        attributeValidationService: AttributeValidationService,
        redisService: any
      ) => {
        return new ResourceService(
          resourceRepository,
          eventBusService,
          attributeValidationService,
          redisService
        );
      },
      inject: [
        RESOURCE_REPOSITORY,
        EventBusService,
        AttributeValidationService,
        RedisService,
      ],
    },
    {
      provide: CategoryService,
      useFactory: (
        categoryRepository: CategoryRepository,
        redisService: any
      ) => {
        return new CategoryService(categoryRepository, redisService);
      },
      inject: [CATEGORY_REPOSITORY, RedisService],
    },
    {
      provide: MaintenanceService,
      useFactory: (maintenanceRepository: MaintenanceRepository) => {
        return new MaintenanceService(maintenanceRepository);
      },
      inject: [MAINTENANCE_REPOSITORY],
    },
  ],
})
export class ResourcesModule {}
