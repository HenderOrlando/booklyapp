import {
  AppConfiguration,
  AppConfigurationDocument,
} from "@auth/infrastructure/schemas/app-configuration.schema";
import { createLogger } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import {
  CommandHandler,
  ICommandHandler,
  IQueryHandler,
  QueryHandler,
} from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  UpdateAppConfigCommand,
  UpdateStorageConfigCommand,
} from "../commands/app-config.commands";
import {
  GetAppConfigQuery,
  GetPublicAppConfigQuery,
  GetStorageConfigQuery,
} from "../queries/app-config.queries";

const logger = createLogger("AppConfigHandlers");

/**
 * Mask sensitive fields for logging/responses
 */
function maskSecrets(
  obj: Record<string, any> | undefined,
): Record<string, any> | undefined {
  if (!obj) return obj;
  const masked = { ...obj };
  const secretFields = [
    "secretAccessKey",
    "privateKey",
    "accessKeyId",
    "clientEmail",
  ];
  for (const field of secretFields) {
    if (masked[field]) {
      masked[field] = "***MASKED***";
    }
  }
  return masked;
}

/**
 * Helper: get or create singleton config
 */
async function getOrCreateConfig(
  model: Model<AppConfigurationDocument>,
): Promise<AppConfigurationDocument> {
  let config = await model.findOne().exec();
  if (!config) {
    config = await new model({}).save();
    logger.info("Default AppConfiguration created");
  }
  return config;
}

// ─── COMMAND HANDLERS ───

@CommandHandler(UpdateAppConfigCommand)
export class UpdateAppConfigHandler
  implements ICommandHandler<UpdateAppConfigCommand>
{
  constructor(
    @InjectModel(AppConfiguration.name)
    private readonly configModel: Model<AppConfigurationDocument>,
    private readonly eventBusService: EventBusService,
  ) {}

  async execute(
    command: UpdateAppConfigCommand,
  ): Promise<AppConfigurationDocument> {
    const config = await getOrCreateConfig(this.configModel);
    const updateData: Record<string, any> = { updatedBy: command.updatedBy };

    for (const [key, value] of Object.entries(command.changes)) {
      if (value !== undefined) {
        updateData[key] = value;
      }
    }

    const updated = await this.configModel
      .findByIdAndUpdate(config._id, { $set: updateData }, { new: true })
      .exec();

    logger.info("AppConfiguration updated", {
      updatedBy: command.updatedBy,
      changedFields: Object.keys(command.changes),
    });

    // Publish domain event via EventBus
    try {
      await this.eventBusService.publish("app_config.updated", {
        eventId: `app-config-updated-${Date.now()}`,
        eventType: "app_config.updated",
        service: "auth-service",
        timestamp: new Date(),
        data: {
          updatedBy: command.updatedBy,
          changedFields: Object.keys(command.changes),
        },
      });
    } catch (error) {
      logger.warn("Failed to publish app_config.updated event", {
        error: (error as Error).message,
      });
    }

    return updated!;
  }
}

@CommandHandler(UpdateStorageConfigCommand)
export class UpdateStorageConfigHandler
  implements ICommandHandler<UpdateStorageConfigCommand>
{
  constructor(
    @InjectModel(AppConfiguration.name)
    private readonly configModel: Model<AppConfigurationDocument>,
    private readonly eventBusService: EventBusService,
  ) {}

  async execute(
    command: UpdateStorageConfigCommand,
  ): Promise<AppConfigurationDocument> {
    const config = await getOrCreateConfig(this.configModel);
    const updateData: Record<string, any> = {
      updatedBy: command.updatedBy,
      storageProvider: command.storageProvider,
    };

    if (command.storageS3Config) {
      updateData.storageS3Config = command.storageS3Config;
    }
    if (command.storageGcsConfig) {
      updateData.storageGcsConfig = command.storageGcsConfig;
    }

    const updated = await this.configModel
      .findByIdAndUpdate(config._id, { $set: updateData }, { new: true })
      .exec();

    logger.info("Storage configuration updated", {
      updatedBy: command.updatedBy,
      provider: command.storageProvider,
      s3Config: maskSecrets(command.storageS3Config),
      gcsConfig: maskSecrets(command.storageGcsConfig as any),
    });

    try {
      await this.eventBusService.publish("app_config.updated", {
        eventId: `storage-config-updated-${Date.now()}`,
        eventType: "app_config.updated",
        service: "auth-service",
        timestamp: new Date(),
        data: {
          updatedBy: command.updatedBy,
          changedFields: [
            "storageProvider",
            "storageS3Config",
            "storageGcsConfig",
          ],
        },
      });
    } catch (error) {
      logger.warn("Failed to publish app_config.updated event", {
        error: (error as Error).message,
      });
    }

    return updated!;
  }
}

// ─── QUERY HANDLERS ───

@QueryHandler(GetAppConfigQuery)
export class GetAppConfigHandler implements IQueryHandler<GetAppConfigQuery> {
  constructor(
    @InjectModel(AppConfiguration.name)
    private readonly configModel: Model<AppConfigurationDocument>,
  ) {}

  async execute(query: GetAppConfigQuery): Promise<AppConfigurationDocument> {
    const config = await getOrCreateConfig(this.configModel);

    if (!query.includeSecrets) {
      const obj = config.toObject();
      if (obj.storageS3Config) {
        obj.storageS3Config = maskSecrets(obj.storageS3Config) as any;
      }
      if (obj.storageGcsConfig) {
        obj.storageGcsConfig = maskSecrets(obj.storageGcsConfig) as any;
      }
      return obj as any;
    }

    return config;
  }
}

@QueryHandler(GetPublicAppConfigQuery)
export class GetPublicAppConfigHandler
  implements IQueryHandler<GetPublicAppConfigQuery>
{
  constructor(
    @InjectModel(AppConfiguration.name)
    private readonly configModel: Model<AppConfigurationDocument>,
  ) {}

  async execute(): Promise<Record<string, any>> {
    const config = await getOrCreateConfig(this.configModel);
    return {
      registrationEnabled: config.registrationEnabled,
      corporateAuthEnabled: config.corporateAuthEnabled,
      themeMode: config.themeMode,
      primaryColor: config.primaryColor,
      secondaryColor: config.secondaryColor,
      defaultLocale: config.defaultLocale,
      supportedLocales: config.supportedLocales,
      appName: config.appName,
      logoLightUrl: config.logoLightUrl,
      logoDarkUrl: config.logoDarkUrl,
      faviconUrl: config.faviconUrl,
      timezone: config.timezone,
      features: config.features,
      maintenanceMode: config.maintenanceMode,
    };
  }
}

@QueryHandler(GetStorageConfigQuery)
export class GetStorageConfigHandler
  implements IQueryHandler<GetStorageConfigQuery>
{
  constructor(
    @InjectModel(AppConfiguration.name)
    private readonly configModel: Model<AppConfigurationDocument>,
  ) {}

  async execute(): Promise<Record<string, any>> {
    const config = await getOrCreateConfig(this.configModel);
    return {
      storageProvider: config.storageProvider || "local",
      storageS3Config: maskSecrets(config.storageS3Config),
      storageGcsConfig: maskSecrets(config.storageGcsConfig as any),
    };
  }
}

export const AppConfigHandlers = [
  UpdateAppConfigHandler,
  UpdateStorageConfigHandler,
  GetAppConfigHandler,
  GetPublicAppConfigHandler,
  GetStorageConfigHandler,
];
