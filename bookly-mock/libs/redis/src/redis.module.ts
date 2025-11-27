import { DynamicModule, Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CacheMetricsService } from "./cache-metrics.service";
import { RedisService } from "./redis.service";

export interface RedisModuleOptions {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
}

@Global()
@Module({})
export class RedisModule {
  static forRoot(options?: RedisModuleOptions): DynamicModule {
    return {
      module: RedisModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: "REDIS_OPTIONS",
          useValue: options || {},
        },
        RedisService,
        {
          provide: "RedisService",
          useExisting: RedisService,
        },
      ],
      exports: [RedisService, "RedisService"],
    };
  }

  static forRootAsync(options: {
    useFactory: (
      ...args: any[]
    ) => RedisModuleOptions | Promise<RedisModuleOptions>;
    inject?: any[];
    serviceName?: string;
  }): DynamicModule {
    const serviceName = options.serviceName || "unknown-service";

    return {
      module: RedisModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: "REDIS_OPTIONS",
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        RedisService,
        {
          provide: "RedisService",
          useExisting: RedisService,
        },
        {
          provide: CacheMetricsService,
          useValue: new CacheMetricsService(serviceName),
        },
        {
          provide: "CacheMetricsService",
          useExisting: CacheMetricsService,
        },
      ],
      exports: [
        RedisService,
        "RedisService",
        CacheMetricsService,
        "CacheMetricsService",
      ],
    };
  }
}
