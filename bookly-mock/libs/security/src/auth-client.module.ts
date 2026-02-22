import { RedisModule } from "@libs/redis";
import { HttpModule } from "@nestjs/axios";
import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthClientService } from "./auth-client.service";
import { AuthClientOptions } from "./interfaces/auth-client.interface";

/**
 * Auth Client Module
 * Shared module for microservices to authenticate and authorize via auth-service.
 *
 * Usage:
 * ```typescript
 * AuthClientModule.forRoot({
 *   authServiceUrl: 'http://localhost:3001',
 * })
 * ```
 *
 * Or async:
 * ```typescript
 * AuthClientModule.forRootAsync({
 *   useFactory: (configService: ConfigService) => ({
 *     authServiceUrl: configService.get('AUTH_SERVICE_URL') || 'http://localhost:3001',
 *   }),
 *   inject: [ConfigService],
 * })
 * ```
 */
@Module({})
export class AuthClientModule {
  static forRoot(options: AuthClientOptions): DynamicModule {
    return {
      module: AuthClientModule,
      imports: [
        ConfigModule,
        HttpModule.register({ timeout: options.timeout || 5000 }),
      ],
      providers: [
        {
          provide: "AUTH_CLIENT_OPTIONS",
          useValue: options,
        },
        AuthClientService,
      ],
      exports: [AuthClientService],
      global: true,
    };
  }

  static forRootAsync(options: {
    useFactory: (
      ...args: any[]
    ) => Promise<AuthClientOptions> | AuthClientOptions;
    inject?: any[];
  }): DynamicModule {
    return {
      module: AuthClientModule,
      imports: [
        ConfigModule,
        HttpModule.register({ timeout: 5000 }),
      ],
      providers: [
        {
          provide: "AUTH_CLIENT_OPTIONS",
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        AuthClientService,
      ],
      exports: [AuthClientService],
      global: true,
    };
  }
}
