/**
 * Configuración global de la aplicación
 * Centraliza variables de entorno y configuraciones
 */

import { getDataConfigSnapshot } from "@/lib/data-config";

export type DataMode = "mock" | "serve";

const envDataMode =
  (process.env.NEXT_PUBLIC_DATA_MODE || "mock") === "mock" ? "mock" : "serve";
const envUseDirectServices =
  process.env.NEXT_PUBLIC_USE_DIRECT_SERVICES === "true";

export const config = {
  // URLs de API
  apiGatewayUrl:
    process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:3000",
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000",

  // URLs de Microservicios (para bypass del API Gateway)
  useDirectServices: envUseDirectServices,
  serviceUrls: {
    auth: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "http://localhost:3001",
    resources:
      process.env.NEXT_PUBLIC_RESOURCES_SERVICE_URL || "http://localhost:3002",
    availability:
      process.env.NEXT_PUBLIC_AVAILABILITY_SERVICE_URL ||
      "http://localhost:3003",
    stockpile:
      process.env.NEXT_PUBLIC_STOCKPILE_SERVICE_URL || "http://localhost:3004",
    reports:
      process.env.NEXT_PUBLIC_REPORTS_SERVICE_URL || "http://localhost:3005",
  },

  // Modo de datos: 'mock' o 'serve'
  dataMode: envDataMode as DataMode,

  // NextAuth
  nextAuthUrl: process.env.NEXTAUTH_URL || "http://localhost:4200",
  nextAuthSecret:
    process.env.NEXTAUTH_SECRET || "development-secret-change-in-production",

  // OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",

  // Feature Flags
  features: {
    enable2FA: process.env.NEXT_PUBLIC_ENABLE_2FA === "true",
    enableSSO: process.env.NEXT_PUBLIC_ENABLE_SSO === "true",
    enableWebSocket: process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === "true",
  },

  // Monitoring
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
  gaId: process.env.NEXT_PUBLIC_GA_ID || "",

  // Environment
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
  isTest: process.env.NODE_ENV === "test",
} as const;

/**
 * Verifica si estamos en modo mock
 */
export function isMockMode(): boolean {
  if (typeof window === "undefined") {
    return config.dataMode === "mock";
  }

  return getDataConfigSnapshot().dataMode === "MOCK";
}

/**
 * Verifica si estamos en modo serve
 */
export function isServeMode(): boolean {
  if (typeof window === "undefined") {
    return config.dataMode === "serve";
  }

  return getDataConfigSnapshot().dataMode === "SERVER";
}

/**
 * Obtiene la URL base para un servicio específico
 * @param service Nombre del servicio
 * @returns URL base del servicio
 */
export function getServiceUrl(
  service: keyof typeof config.serviceUrls,
): string {
  if (typeof window === "undefined") {
    return config.useDirectServices
      ? config.serviceUrls[service]
      : config.apiGatewayUrl;
  }

  if (getDataConfigSnapshot().useDirectServices) {
    return config.serviceUrls[service];
  }

  return config.apiGatewayUrl;
}

/**
 * Log de configuración (solo en desarrollo)
 */
export function logConfig(): void {
  if (config.isDevelopment) {
    const runtimeSnapshot =
      typeof window === "undefined"
        ? {
            legacyDataMode: config.dataMode,
            useDirectServices: config.useDirectServices,
            wsEnabled:
              config.features.enableWebSocket &&
              config.dataMode === "serve" &&
              !config.useDirectServices,
            source: "env",
          }
        : getDataConfigSnapshot();

    console.log("📋 Configuración de la aplicación:");
    console.log("  🌐 API Gateway:", config.apiGatewayUrl);
    console.log("  🔌 WebSocket:", config.wsUrl);
    console.log(
      "  📦 Modo de datos:",
      runtimeSnapshot.legacyDataMode.toUpperCase(),
    );
    console.log(
      "  🔧 Servicios directos:",
      runtimeSnapshot.useDirectServices ? "ACTIVADO" : "DESACTIVADO",
    );
    console.log(
      "  ⚡ WebSocket activo:",
      runtimeSnapshot.wsEnabled ? "SI" : "NO",
    );
    console.log(
      "  🧭 Fuente de configuración:",
      runtimeSnapshot.source.toUpperCase(),
    );
    if (runtimeSnapshot.useDirectServices) {
      console.log("  📍 Auth Service:", config.serviceUrls.auth);
      console.log("  📍 Resources Service:", config.serviceUrls.resources);
      console.log(
        "  📍 Availability Service:",
        config.serviceUrls.availability,
      );
      console.log("  📍 Stockpile Service:", config.serviceUrls.stockpile);
      console.log("  📍 Reports Service:", config.serviceUrls.reports);
    }
    console.log("  ⚙️  Features:", config.features);
  }
}

// Log automático en desarrollo
if (typeof window !== "undefined" && config.isDevelopment) {
  logConfig();
}
