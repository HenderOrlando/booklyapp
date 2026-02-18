/**
 * CQRS Commands for AppConfiguration
 */

export class UpdateAppConfigCommand {
  constructor(
    public readonly updatedBy: string,
    public readonly changes: {
      registrationEnabled?: boolean;
      corporateAuthEnabled?: boolean;
      allowedDomains?: string[];
      autoRegisterOnSSO?: boolean;
      themeMode?: string;
      primaryColor?: string;
      secondaryColor?: string;
      defaultLocale?: string;
      supportedLocales?: string[];
      appName?: string;
      logoLightUrl?: string;
      logoDarkUrl?: string;
      faviconUrl?: string;
      timezone?: string;
      features?: {
        enableNotifications?: boolean;
        enableRealtime?: boolean;
      };
      maintenanceMode?: boolean;
    },
  ) {}
}

export class UpdateStorageConfigCommand {
  constructor(
    public readonly updatedBy: string,
    public readonly storageProvider: "local" | "s3" | "gcs",
    public readonly storageS3Config?: {
      bucket?: string;
      region?: string;
      accessKeyId?: string;
      secretAccessKey?: string;
      endpoint?: string;
    },
    public readonly storageGcsConfig?: {
      bucket?: string;
      projectId?: string;
      keyFilePath?: string;
      clientEmail?: string;
      privateKey?: string;
    },
  ) {}
}
