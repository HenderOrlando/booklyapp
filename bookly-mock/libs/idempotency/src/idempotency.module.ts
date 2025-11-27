import { RedisModule } from "@libs/redis";
import { DynamicModule, Global, Module } from "@nestjs/common";
import {
  WebSocketIdempotencyGuard,
  WebSocketIdempotencyInterceptor,
} from "./guards/websocket-idempotency.guard";
import { IdempotencyInterceptor } from "./interceptors/idempotency.interceptor";
import { CorrelationIdMiddleware } from "./middleware/correlation-id.middleware";
import { CorrelationService } from "./services/correlation.service";
import { IdempotencyService } from "./services/idempotency.service";

export interface IdempotencyModuleOptions {
  defaultTtl?: number;
  keyPrefix?: string;
  enableAutoCorrelation?: boolean;
}

/**
 * Global module for idempotency and distributed tracing
 * Provides services, middleware, and interceptors for handling
 * idempotent operations and correlation IDs across microservices
 */
@Global()
@Module({})
export class IdempotencyModule {
  static forRoot(options?: IdempotencyModuleOptions): DynamicModule {
    return {
      module: IdempotencyModule,
      imports: [RedisModule],
      providers: [
        {
          provide: "IDEMPOTENCY_OPTIONS",
          useValue: options || {},
        },
        IdempotencyService,
        CorrelationService,
        CorrelationIdMiddleware,
        IdempotencyInterceptor,
        WebSocketIdempotencyGuard,
        WebSocketIdempotencyInterceptor,
      ],
      exports: [
        IdempotencyService,
        CorrelationService,
        CorrelationIdMiddleware,
        IdempotencyInterceptor,
        WebSocketIdempotencyGuard,
        WebSocketIdempotencyInterceptor,
      ],
    };
  }
}
