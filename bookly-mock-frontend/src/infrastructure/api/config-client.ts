import { CONFIG_ENDPOINTS } from "@/infrastructure/api/endpoints";
import { httpClient } from "@/infrastructure/http/httpClient";
import type { ApiResponse } from "@/types/api/response";
import type {
  AppConfig,
  AppConfigFeatures,
  AppConfigStorageGcs,
  AppConfigStorageS3,
  AppStorageProvider,
  AppThemeMode,
  PublicAppConfig,
} from "@/types/entities/app-config";

const DEFAULT_APP_CONFIG_FEATURES: AppConfigFeatures = {
  enableNotifications: true,
  enableRealtime: true,
};

export const DEFAULT_PUBLIC_APP_CONFIG: PublicAppConfig = {
  registrationEnabled: true,
  corporateAuthEnabled: true,
  allowedDomains: ["ufps.edu.co"],
  autoRegisterOnSSO: true,
  themeMode: "system",
  primaryColor: "#2563eb",
  secondaryColor: "#14b8a6",
  defaultLocale: "es",
  supportedLocales: ["es", "en"],
  appName: "Bookly UFPS",
  logoLightUrl: "/images/bookly_imagotipo_light.png",
  logoDarkUrl: "/images/bookly_logotipo_dark-vertical.png",
  faviconUrl: "",
  timezone: "America/Bogota",
  features: DEFAULT_APP_CONFIG_FEATURES,
  maintenanceMode: false,
};

export const DEFAULT_APP_CONFIG: AppConfig = {
  ...DEFAULT_PUBLIC_APP_CONFIG,
  storageProvider: "local",
};

export interface UpdateAppConfigPayload extends Partial<PublicAppConfig> {
  features?: Partial<AppConfigFeatures>;
}

export interface UpdateStorageConfigPayload {
  storageProvider: AppStorageProvider;
  storageS3Config?: AppConfigStorageS3;
  storageGcsConfig?: AppConfigStorageGcs;
}

interface StorageConfigResponse {
  storageProvider: AppStorageProvider;
  storageS3Config?: AppConfigStorageS3;
  storageGcsConfig?: AppConfigStorageGcs;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function normalizeStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  return normalized.length > 0 ? normalized : fallback;
}

function normalizeBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function normalizeThemeMode(value: unknown, fallback: AppThemeMode): AppThemeMode {
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }

  return fallback;
}

function normalizeStorageProvider(
  value: unknown,
  fallback: AppStorageProvider,
): AppStorageProvider {
  if (value === "local" || value === "s3" || value === "gcs") {
    return value;
  }

  return fallback;
}

function normalizeFeatures(
  value: unknown,
  fallback: AppConfigFeatures,
): AppConfigFeatures {
  if (!isRecord(value)) {
    return fallback;
  }

  return {
    enableNotifications: normalizeBoolean(
      value.enableNotifications,
      fallback.enableNotifications,
    ),
    enableRealtime: normalizeBoolean(value.enableRealtime, fallback.enableRealtime),
  };
}

function normalizePublicConfig(
  value: unknown,
  fallback: PublicAppConfig = DEFAULT_PUBLIC_APP_CONFIG,
): PublicAppConfig {
  if (!isRecord(value)) {
    return fallback;
  }

  return {
    registrationEnabled: normalizeBoolean(
      value.registrationEnabled,
      fallback.registrationEnabled,
    ),
    corporateAuthEnabled: normalizeBoolean(
      value.corporateAuthEnabled,
      fallback.corporateAuthEnabled,
    ),
    allowedDomains: normalizeStringArray(value.allowedDomains, fallback.allowedDomains),
    autoRegisterOnSSO: normalizeBoolean(
      value.autoRegisterOnSSO,
      fallback.autoRegisterOnSSO,
    ),
    themeMode: normalizeThemeMode(value.themeMode, fallback.themeMode),
    primaryColor: normalizeString(value.primaryColor, fallback.primaryColor),
    secondaryColor: normalizeString(value.secondaryColor, fallback.secondaryColor),
    defaultLocale: normalizeString(value.defaultLocale, fallback.defaultLocale),
    supportedLocales: normalizeStringArray(
      value.supportedLocales,
      fallback.supportedLocales,
    ),
    appName: normalizeString(value.appName, fallback.appName),
    logoLightUrl: typeof value.logoLightUrl === "string" ? value.logoLightUrl : fallback.logoLightUrl,
    logoDarkUrl: typeof value.logoDarkUrl === "string" ? value.logoDarkUrl : fallback.logoDarkUrl,
    faviconUrl: typeof value.faviconUrl === "string" ? value.faviconUrl : fallback.faviconUrl,
    timezone: normalizeString(value.timezone, fallback.timezone),
    features: normalizeFeatures(value.features, fallback.features),
    maintenanceMode: normalizeBoolean(value.maintenanceMode, fallback.maintenanceMode),
  };
}

function normalizeAppConfig(value: unknown, fallback: AppConfig = DEFAULT_APP_CONFIG): AppConfig {
  const normalizedPublic = normalizePublicConfig(value, fallback);

  if (!isRecord(value)) {
    return {
      ...normalizedPublic,
      storageProvider: fallback.storageProvider,
      storageS3Config: fallback.storageS3Config,
      storageGcsConfig: fallback.storageGcsConfig,
    };
  }

  return {
    ...normalizedPublic,
    storageProvider: normalizeStorageProvider(value.storageProvider, fallback.storageProvider),
    storageS3Config: isRecord(value.storageS3Config)
      ? (value.storageS3Config as AppConfigStorageS3)
      : fallback.storageS3Config,
    storageGcsConfig: isRecord(value.storageGcsConfig)
      ? (value.storageGcsConfig as AppConfigStorageGcs)
      : fallback.storageGcsConfig,
  };
}

function buildUpdateConfigPayload(data: UpdateAppConfigPayload): UpdateAppConfigPayload {
  const payload: UpdateAppConfigPayload = {};

  if (data.registrationEnabled !== undefined) {
    payload.registrationEnabled = data.registrationEnabled;
  }
  if (data.corporateAuthEnabled !== undefined) {
    payload.corporateAuthEnabled = data.corporateAuthEnabled;
  }
  if (data.allowedDomains !== undefined) {
    payload.allowedDomains = data.allowedDomains;
  }
  if (data.autoRegisterOnSSO !== undefined) {
    payload.autoRegisterOnSSO = data.autoRegisterOnSSO;
  }
  if (data.themeMode !== undefined) {
    payload.themeMode = data.themeMode;
  }
  if (data.primaryColor !== undefined) {
    payload.primaryColor = data.primaryColor;
  }
  if (data.secondaryColor !== undefined) {
    payload.secondaryColor = data.secondaryColor;
  }
  if (data.defaultLocale !== undefined) {
    payload.defaultLocale = data.defaultLocale;
  }
  if (data.supportedLocales !== undefined) {
    payload.supportedLocales = data.supportedLocales;
  }
  if (data.appName !== undefined) {
    payload.appName = data.appName;
  }
  if (data.logoLightUrl !== undefined) {
    payload.logoLightUrl = data.logoLightUrl;
  }
  if (data.logoDarkUrl !== undefined) {
    payload.logoDarkUrl = data.logoDarkUrl;
  }
  if (data.faviconUrl !== undefined) {
    payload.faviconUrl = data.faviconUrl;
  }
  if (data.timezone !== undefined) {
    payload.timezone = data.timezone;
  }
  if (data.maintenanceMode !== undefined) {
    payload.maintenanceMode = data.maintenanceMode;
  }
  if (data.features !== undefined) {
    payload.features = {
      ...(data.features.enableNotifications !== undefined
        ? { enableNotifications: data.features.enableNotifications }
        : {}),
      ...(data.features.enableRealtime !== undefined
        ? { enableRealtime: data.features.enableRealtime }
        : {}),
    };
  }

  return payload;
}

export class ConfigClient {
  static async getPublicConfig(): Promise<ApiResponse<PublicAppConfig>> {
    const response = await httpClient.get<unknown>(CONFIG_ENDPOINTS.PUBLIC);

    if (!response.success || !response.data) {
      return response as ApiResponse<PublicAppConfig>;
    }

    return {
      ...response,
      data: normalizePublicConfig(response.data),
    };
  }

  static async getConfig(): Promise<ApiResponse<AppConfig>> {
    const response = await httpClient.get<unknown>(CONFIG_ENDPOINTS.BASE);

    if (!response.success || !response.data) {
      return response as ApiResponse<AppConfig>;
    }

    return {
      ...response,
      data: normalizeAppConfig(response.data),
    };
  }

  static async updateConfig(
    data: UpdateAppConfigPayload,
  ): Promise<ApiResponse<AppConfig>> {
    const response = await httpClient.put<unknown>(
      CONFIG_ENDPOINTS.BASE,
      buildUpdateConfigPayload(data),
    );

    if (!response.success || !response.data) {
      return response as ApiResponse<AppConfig>;
    }

    return {
      ...response,
      data: normalizeAppConfig(response.data),
    };
  }

  static async getStorageConfig(): Promise<ApiResponse<StorageConfigResponse>> {
    const response = await httpClient.get<unknown>(CONFIG_ENDPOINTS.STORAGE);

    if (!response.success || !response.data || !isRecord(response.data)) {
      return response as ApiResponse<StorageConfigResponse>;
    }

    return {
      ...response,
      data: {
        storageProvider: normalizeStorageProvider(
          response.data.storageProvider,
          DEFAULT_APP_CONFIG.storageProvider,
        ),
        storageS3Config: isRecord(response.data.storageS3Config)
          ? (response.data.storageS3Config as AppConfigStorageS3)
          : undefined,
        storageGcsConfig: isRecord(response.data.storageGcsConfig)
          ? (response.data.storageGcsConfig as AppConfigStorageGcs)
          : undefined,
      },
    };
  }

  static async updateStorageConfig(
    data: UpdateStorageConfigPayload,
  ): Promise<ApiResponse<StorageConfigResponse>> {
    const response = await httpClient.put<unknown>(CONFIG_ENDPOINTS.STORAGE, data);

    if (!response.success || !response.data || !isRecord(response.data)) {
      return response as ApiResponse<StorageConfigResponse>;
    }

    return {
      ...response,
      data: {
        storageProvider: normalizeStorageProvider(
          response.data.storageProvider,
          data.storageProvider,
        ),
        storageS3Config: isRecord(response.data.storageS3Config)
          ? (response.data.storageS3Config as AppConfigStorageS3)
          : data.storageS3Config,
        storageGcsConfig: isRecord(response.data.storageGcsConfig)
          ? (response.data.storageGcsConfig as AppConfigStorageGcs)
          : data.storageGcsConfig,
      },
    };
  }
}
