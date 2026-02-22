import { createLogger } from "@libs/common";
import { DynamicModule, Module } from "@nestjs/common";
import { GCSStorageAdapter, GCSStorageConfig } from "./adapters/gcs-storage.adapter";
import { LocalStorageAdapter } from "./adapters/local-storage.adapter";
import { S3StorageAdapter, S3StorageConfig } from "./adapters/s3-storage.adapter";
import { STORAGE_PORT, StorageProvider } from "./ports/storage.port";

const logger = createLogger("StorageModule");

export interface StorageModuleConfig {
  provider: StorageProvider;
  local?: { basePath?: string };
  s3?: S3StorageConfig;
  gcs?: GCSStorageConfig;
}

/**
 * StorageModule — Dynamic NestJS module
 * Selects the correct adapter based on provider config.
 * Fallback: LocalStorageAdapter if no valid config.
 */
@Module({})
export class StorageModule {
  static forRoot(config: StorageModuleConfig): DynamicModule {
    return {
      module: StorageModule,
      global: true,
      providers: [
        {
          provide: STORAGE_PORT,
          useFactory: () => StorageModule.createAdapter(config),
        },
      ],
      exports: [STORAGE_PORT],
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => StorageModuleConfig | Promise<StorageModuleConfig>;
    inject?: any[];
  }): DynamicModule {
    return {
      module: StorageModule,
      global: true,
      providers: [
        {
          provide: STORAGE_PORT,
          useFactory: async (...args: any[]) => {
            const config = await options.useFactory(...args);
            return StorageModule.createAdapter(config);
          },
          inject: options.inject || [],
        },
      ],
      exports: [STORAGE_PORT],
    };
  }

  private static createAdapter(config: StorageModuleConfig) {
    switch (config.provider) {
      case "s3":
        if (!config.s3?.bucket || !config.s3?.accessKeyId) {
          logger.warn(
            "S3 config incomplete — falling back to local storage. Set bucket + accessKeyId.",
          );
          return new LocalStorageAdapter(config.local?.basePath);
        }
        logger.info("Using S3 storage adapter", {
          bucket: config.s3.bucket,
          region: config.s3.region,
        });
        return new S3StorageAdapter(config.s3);

      case "gcs":
        if (!config.gcs?.bucket || !config.gcs?.projectId) {
          logger.warn(
            "GCS config incomplete — falling back to local storage. Set bucket + projectId.",
          );
          return new LocalStorageAdapter(config.local?.basePath);
        }
        logger.info("Using GCS storage adapter", {
          bucket: config.gcs.bucket,
          projectId: config.gcs.projectId,
        });
        return new GCSStorageAdapter(config.gcs);

      case "local":
      default:
        logger.info("Using local storage adapter", {
          basePath: config.local?.basePath || "data/uploads",
        });
        return new LocalStorageAdapter(config.local?.basePath);
    }
  }
}
