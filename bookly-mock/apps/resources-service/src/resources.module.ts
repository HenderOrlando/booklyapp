import { JWT_SECRET } from "@libs/common/constants";
import {
  DatabaseModule,
  ReferenceDataModule,
  ReferenceDataRepository,
} from "@libs/database";
import { EventBusModule, EventBusService } from "@libs/event-bus";
import { IdempotencyModule } from "@libs/idempotency";
import { RedisModule, RedisService } from "@libs/redis";
import { AuthClientModule } from "@libs/security";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { AuditDecoratorsModule } from "@reports/audit-decorators";
import { ResourceImportService } from "./application/services/resource-import.service";
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
import { ResourcesCacheService } from "./infrastructure/cache";
import {
  CategoriesController,
  HealthController,
  ImportController,
  MaintenancesController,
  ReferenceDataController,
  ResourcesController,
} from "./infrastructure/controllers";
import { DepartmentsController } from "./infrastructure/controllers/departments.controller";
import { FacultiesController } from "./infrastructure/controllers/faculties.controller";
import { ProgramsController } from "./infrastructure/controllers/programs.controller";
import * as InfraEventHandlers from "./infrastructure/event-handlers";
import {
  CategoryRepository,
  ImportJobRepository,
  MaintenanceRepository,
  ResourceRepository,
} from "./infrastructure/repositories";
import {
  Category,
  CategorySchema,
  Department,
  DepartmentSchema,
  Faculty,
  FacultySchema,
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
    // Cache
    CacheModule.register({ isGlobal: true }),
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "apps/resources-service/.env"],
    }),

    // CQRS
    CqrsModule,

    // MongoDB - Conexión global con librería estandarizada
    DatabaseModule,

    // Reference Data (tipos, estados, categorías dinámicos)
    ReferenceDataModule,

    // Schemas
    MongooseModule.forFeature([
      { name: Resource.name, schema: ResourceSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Maintenance.name, schema: MaintenanceSchema },
      { name: Program.name, schema: ProgramSchema },
      { name: ImportJob.name, schema: ImportJobSchema },
      { name: Faculty.name, schema: FacultySchema },
      { name: Department.name, schema: DepartmentSchema },
    ]),

    // JWT
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRATION || "1d",
      },
    }),

    // Auth Client (centralized auth via auth-service)
    AuthClientModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        authServiceUrl:
          configService.get("AUTH_SERVICE_URL") || "http://localhost:3001",
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
      serviceName: "resources-service",
    }),

    // Idempotency + Correlation
    IdempotencyModule.forRoot({ keyPrefix: "resources" }),

    // Audit Decorators (event-driven audit)
    AuditDecoratorsModule,
  ],
  controllers: [
    ResourcesController,
    CategoriesController,
    MaintenancesController,
    ImportController,
    FacultiesController,
    DepartmentsController,
    ProgramsController,
    ReferenceDataController,
    HealthController,
  ],
  providers: [
    // JWT Strategy
    JwtStrategy,

    // CQRS Handlers
    ...AllHandlers,

    // Resource Import Service (with factory for interface injection)
    {
      provide: ResourceImportService,
      useFactory: (
        resourceRepository: ResourceRepository,
        categoryRepository: CategoryRepository,
      ) => {
        return new ResourceImportService(
          resourceRepository,
          categoryRepository,
        );
      },
      inject: [RESOURCE_REPOSITORY, CATEGORY_REPOSITORY],
    },

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
    ResourcesCacheService,

    // Infrastructure Event Handlers
    InfraEventHandlers.ReservationCreatedHandler,
    InfraEventHandlers.ReservationCancelledHandler,
    InfraEventHandlers.CheckOutCompletedHandler,

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
        referenceDataRepository: ReferenceDataRepository,
        redisService: any,
      ) => {
        return new ResourceService(
          resourceRepository,
          eventBusService,
          attributeValidationService,
          referenceDataRepository,
          redisService,
        );
      },
      inject: [
        RESOURCE_REPOSITORY,
        EventBusService,
        AttributeValidationService,
        ReferenceDataRepository,
        RedisService,
      ],
    },
    {
      provide: CategoryService,
      useFactory: (
        categoryRepository: CategoryRepository,
        redisService: any,
      ) => {
        return new CategoryService(categoryRepository, redisService);
      },
      inject: [CATEGORY_REPOSITORY, RedisService],
    },
    {
      provide: MaintenanceService,
      useFactory: (
        maintenanceRepository: MaintenanceRepository,
        resourceRepository: ResourceRepository,
        eventBusService: EventBusService,
      ) => {
        return new MaintenanceService(
          maintenanceRepository,
          resourceRepository,
          eventBusService,
        );
      },
      inject: [MAINTENANCE_REPOSITORY, RESOURCE_REPOSITORY, EventBusService],
    },
  ],
})
export class ResourcesModule {}
