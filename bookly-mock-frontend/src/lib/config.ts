/**
 * Configuración global de la aplicación
 * Centraliza variables de entorno y configuraciones
 */

export type DataMode = "mock" | "serve";

export const config = {
  // URLs de API
  apiGatewayUrl:
    process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:3000",
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000",

  // URLs de Microservicios (para bypass del API Gateway)
  useDirectServices: process.env.NEXT_PUBLIC_USE_DIRECT_SERVICES === "true",
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
  dataMode: (process.env.NEXT_PUBLIC_DATA_MODE || "mock") as DataMode,

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
  return config.dataMode === "mock";
}

/**
 * Verifica si estamos en modo serve
 */
export function isServeMode(): boolean {
  return config.dataMode === "serve";
}

/**
 * Obtiene la URL base para un servicio específico
 * @param service Nombre del servicio
 * @returns URL base del servicio
 */
export function getServiceUrl(
  service: keyof typeof config.serviceUrls
): string {
  if (config.useDirectServices) {
    return config.serviceUrls[service];
  }
  return config.apiGatewayUrl;
}

/**
 * Log de configuración (solo en desarrollo)
 */
export function logConfig(): void {
  if (config.isDevelopment) {
    console.log("📋 Configuración de la aplicación:");
    console.log("  🌐 API Gateway:", config.apiGatewayUrl);
    console.log("  🔌 WebSocket:", config.wsUrl);
    console.log("  📦 Modo de datos:", config.dataMode.toUpperCase());
    console.log(
      "  🔧 Servicios directos:",
      config.useDirectServices ? "ACTIVADO" : "DESACTIVADO"
    );
    if (config.useDirectServices) {
      console.log("  📍 Auth Service:", config.serviceUrls.auth);
      console.log("  📍 Resources Service:", config.serviceUrls.resources);
      console.log(
        "  📍 Availability Service:",
        config.serviceUrls.availability
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
