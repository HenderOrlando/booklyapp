/**
 * Barrel export para clientes HTTP
 * Centraliza todos los clientes API de la aplicación
 *
 * @example
 * ```typescript
 * import { ReservationsClient, ResourcesClient, AuthClient } from '@/infrastructure/api';
 *
 * // Usar cualquier cliente
 * const reservations = await ReservationsClient.getAll();
 * const resources = await ResourcesClient.search({ type: 'CLASSROOM' });
 * const user = await AuthClient.getProfile();
 * ```
 */

// Tipos compartidos
export * from "./types";

// Base client con interceptors (incluye todos los interceptors predefinidos)
export * from "./base-client";

// Clientes HTTP Type-Safe
export * from "./approvals-client";
export * from "./auth-client";
export * from "./check-in-client";
export * from "./config-client";
export * from "./feedback-client";
export * from "./notifications-client";
export * from "./reports-client";
export * from "./reservations-client";
export * from "./resources-client";
export * from "./waitlist-client";

/**
 * Stack HTTP Completo Disponible:
 *
 * @Interceptors (11 totales)
 * - authInterceptor (request)
 * - loggingInterceptor (request)
 * - timingRequestInterceptor (request)
 * - responseLoggingInterceptor (response)
 * - analyticsInterceptor (response)
 * - timingResponseInterceptor (response)
 * - errorLoggingInterceptor (error)
 * - retryInterceptor (error)
 * - refreshTokenInterceptor (error)
 *
 * @Clientes (3 + 42 métodos)
 * - ReservationsClient (9 métodos)
 * - ResourcesClient (14 métodos)
 * - AuthClient (19 métodos)
 *
 * @Uso
 * ```typescript
 * // 1. Inicializar en layout.tsx
 * import { initializeInterceptors } from '@/infrastructure/api';
 *
 * useEffect(() => {
 *   initializeInterceptors({
 *     includeRetry: true,
 *     includeAnalytics: false,
 *     includeTiming: true
 *   });
 * }, []);
 *
 * // 2. Usar clientes
 * import { ReservationsClient } from '@/infrastructure/api';
 *
 * const response = await ReservationsClient.getAll();
 * // Token agregado automáticamente
 * // Logging de request/response
 * // Retry automático si falla
 * // Auto-refresh de token
 * // Timing de performance
 * ```
 */
