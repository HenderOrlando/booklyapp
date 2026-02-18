export type AppThemeMode = "system" | "light" | "dark";

export type AppStorageProvider = "local" | "s3" | "gcs";

export interface AppConfigFeatures {
  enableNotifications: boolean;
  enableRealtime: boolean;
}

export interface AppConfigStorageS3 {
  bucket?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpoint?: string;
}

export interface AppConfigStorageGcs {
  bucket?: string;
  projectId?: string;
  keyFilePath?: string;
  clientEmail?: string;
  privateKey?: string;
}

export interface AppConfigBase {
  registrationEnabled: boolean;
  corporateAuthEnabled: boolean;
  allowedDomains: string[];
  autoRegisterOnSSO: boolean;
  themeMode: AppThemeMode;
  primaryColor: string;
  secondaryColor: string;
  defaultLocale: string;
  supportedLocales: string[];
  appName: string;
  logoLightUrl: string;
  logoDarkUrl: string;
  faviconUrl: string;
  timezone: string;
  features: AppConfigFeatures;
  maintenanceMode: boolean;
}

export interface PublicAppConfig extends AppConfigBase {}

export interface AppConfig extends AppConfigBase {
  storageProvider: AppStorageProvider;
  storageS3Config?: AppConfigStorageS3;
  storageGcsConfig?: AppConfigStorageGcs;
}
