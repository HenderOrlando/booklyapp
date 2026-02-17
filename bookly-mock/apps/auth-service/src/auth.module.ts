import { JWT_EXPIRATION, JWT_SECRET } from "@libs/common/constants";
import { DatabaseModule, ReferenceDataModule } from "@libs/database";
import { EventBusModule } from "@libs/event-bus";
import { RedisModule } from "@libs/redis";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CqrsModule } from "@nestjs/cqrs";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { AuditDecoratorsModule } from "@reports/audit-decorators";
import { AllHandlers } from "./application/handlers";
import { AppConfigurationService } from "./application/services/app-configuration.service";
import { AuditService } from "./application/services/audit.service";
import { AuthService } from "./application/services/auth.service";
import { GoogleOAuthService } from "./application/services/google-oauth.service";
import { PermissionService } from "./application/services/permission.service";
import { RoleService } from "./application/services/role.service";
import { TwoFactorService } from "./application/services/two-factor.service";
import { UserService } from "./application/services/user.service";
import { AuthCacheService } from "./infrastructure/cache";
import { AppConfigurationController } from "./infrastructure/controllers/app-configuration.controller";
import { AuditController } from "./infrastructure/controllers/audit.controller";
import { AuthController } from "./infrastructure/controllers/auth.controller";
import { HealthController } from "./infrastructure/controllers/health.controller";
import { OAuthController } from "./infrastructure/controllers/oauth.controller";
import { PermissionController } from "./infrastructure/controllers/permission.controller";
import { ReferenceDataController } from "./infrastructure/controllers/reference-data.controller";
import { RoleController } from "./infrastructure/controllers/role.controller";
import { UsersController } from "./infrastructure/controllers/users.controller";
import { ActionGuard } from "./infrastructure/guards/action.guard";
import { PermissionsGuard } from "./infrastructure/guards/permissions.guard";
import { RolesGuard } from "./infrastructure/guards/roles.guard";
import { RoleRepository } from "./infrastructure/repositories/role.repository";
import { UserRepository } from "./infrastructure/repositories/user.repository";
import {
  AppConfiguration,
  AppConfigurationSchema,
} from "./infrastructure/schemas/app-configuration.schema";
import {
  AuditLog,
  AuditLogSchema,
} from "./infrastructure/schemas/audit-log.schema";
import {
  Permission,
  PermissionSchema,
} from "./infrastructure/schemas/permission.schema";
import { Role, RoleSchema } from "./infrastructure/schemas/role.schema";
import { User, UserSchema } from "./infrastructure/schemas/user.schema";
import { GoogleStrategy } from "./infrastructure/strategies/google.strategy";
import { JwtStrategy } from "./infrastructure/strategies/jwt.strategy";
import { OAuthModule, OAuthProvider, OAuthPurpose } from "./modules/oauth";

/**
 * Auth Module
 * Módulo principal del microservicio de autenticación
 */
@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "apps/auth-service/.env"],
    }),

    // CQRS
    CqrsModule,

    // Redis
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        host: configService.get("REDIS_HOST", "localhost"),
        port: configService.get("REDIS_PORT", 6379),
        password: configService.get("REDIS_PASSWORD"),
        db: configService.get("REDIS_DB", 0),
      }),
      inject: [ConfigService],
      serviceName: "auth-service",
    }),

    // Event Bus
    EventBusModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        brokerType:
          configService.get("EVENT_BUS_TYPE") === "kafka"
            ? "kafka"
            : "rabbitmq",
        config:
          configService.get("EVENT_BUS_TYPE") === "kafka"
            ? {
                clientId: "auth-service",
                brokers: (
                  configService.get("KAFKA_BROKERS") || "localhost:9092"
                ).split(","),
                groupId: "auth-group",
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

    // Database - Conexión global con librería estandarizada
    DatabaseModule,

    // Reference Data (tipos, estados dinámicos del dominio auth)
    ReferenceDataModule,

    // Mongoose schemas
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: AppConfiguration.name, schema: AppConfigurationSchema },
    ]),

    // Passport & JWT
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: {
        expiresIn: JWT_EXPIRATION,
      },
    }),

    // OAuth
    OAuthModule.forRoot({
      providers: [
        {
          provider: OAuthProvider.GOOGLE,
          purpose: OAuthPurpose.SSO,
          configPrefix: "GOOGLE",
        },
      ],
    }),

    // Audit Decorators (event-driven audit)
    AuditDecoratorsModule,
  ],
  controllers: [
    AuthController,
    OAuthController,
    AppConfigurationController,
    UsersController,
    RoleController,
    PermissionController,
    AuditController,
    ReferenceDataController,
    HealthController,
  ],
  providers: [
    // Strategies
    JwtStrategy,
    GoogleStrategy,

    // Services
    AppConfigurationService,
    AuthService,
    UserService,
    RoleService,
    PermissionService,
    AuditService,
    TwoFactorService,
    GoogleOAuthService,
    AuthCacheService,

    // Guards
    PermissionsGuard,
    RolesGuard,
    ActionGuard,

    // Repositories
    {
      provide: "IUserRepository",
      useClass: UserRepository,
    },
    {
      provide: "IRoleRepository",
      useClass: RoleRepository,
    },

    // CQRS Handlers
    ...AllHandlers,
  ],
  exports: [AuthService, UserService, RoleService, PermissionService],
})
export class AuthModule {}
