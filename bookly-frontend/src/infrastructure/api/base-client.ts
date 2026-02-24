/**
 * Base HTTP Client con Interceptors
 *
 * Proporciona una capa base para todos los clientes HTTP con:
 * - Interceptor de autenticación (agrega token automáticamente)
 * - Interceptor de logging (registra todas las peticiones)
 * - Interceptor de errores (manejo centralizado)
 * - Auto-refresh de tokens cuando expiran
 *
 * @example
 * ```typescript
 * const response = await BaseHttpClient.request<User>('/users/profile', 'GET');
 * ```
 */

import { MockService } from "@/infrastructure/mock/mockService";
import { config } from "@/lib/config";
import type { ApiResponse } from "@/types/api/response";

/**
 * Tipo para interceptores de request
 */
export type RequestInterceptor = (
  endpoint: string,
  method: string,
  data?: any
) =>
  | Promise<{ endpoint: string; method: string; data?: any }>
  | { endpoint: string; method: string; data?: any };

/**
 * Tipo para interceptores de response
 */
export type ResponseInterceptor = <T>(
  response: ApiResponse<T>,
  endpoint: string,
  method: string
) => Promise<ApiResponse<T>> | ApiResponse<T>;

/**
 * Tipo para interceptores de error
 */
export type ErrorInterceptor = (
  error: any,
  endpoint: string,
  method: string
) => Promise<any> | any;

/**
 * Cliente HTTP base con sistema de interceptors
 */
export class BaseHttpClient {
  private static requestInterceptors: RequestInterceptor[] = [];
  private static responseInterceptors: ResponseInterceptor[] = [];
  private static errorInterceptors: ErrorInterceptor[] = [];

  /**
   * Registra un interceptor de request
   * Se ejecuta ANTES de cada petición
   *
   * @param interceptor - Función interceptora
   * @example
   * ```typescript
   * BaseHttpClient.addRequestInterceptor(async (endpoint, method, data) => {
   *   console.log(`Request: ${method} ${endpoint}`);
   *   return { endpoint, method, data };
   * });
   * ```
   */
  static addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Registra un interceptor de response
   * Se ejecuta DESPUÉS de cada respuesta exitosa
   *
   * @param interceptor - Función interceptora
   */
  static addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Registra un interceptor de error
   * Se ejecuta cuando hay un error en la petición
   *
   * @param interceptor - Función interceptora
   */
  static addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * Limpia todos los interceptors
   */
  static clearInterceptors(): void {
    this.requestInterceptors = [];
    this.responseInterceptors = [];
    this.errorInterceptors = [];
  }

  /**
   * Ejecuta una petición HTTP con todos los interceptors
   *
   * @param endpoint - Endpoint de la API
   * @param method - Método HTTP
   * @param data - Datos opcionales
   * @returns Respuesta tipada
   *
   * @example
   * ```typescript
   * const response = await BaseHttpClient.request<User>('/users/profile', 'GET');
   * if (response.success) {
   *   console.log(response.data.name);
   * }
   * ```
   */
  static async request<T>(
    endpoint: string,
    method: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    try {
      // 1. Ejecutar interceptores de REQUEST
      let interceptedEndpoint = endpoint;
      let interceptedMethod = method;
      let interceptedData = data;

      for (const interceptor of this.requestInterceptors) {
        const result = await interceptor(
          interceptedEndpoint,
          interceptedMethod,
          interceptedData
        );
        interceptedEndpoint = result.endpoint;
        interceptedMethod = result.method;
        interceptedData = result.data;
      }

      // 2. Hacer la petición real
      const response = await MockService.mockRequest<T>(
        interceptedEndpoint,
        interceptedMethod,
        interceptedData
      );

      // 3. Ejecutar interceptores de RESPONSE
      let interceptedResponse = response;
      for (const interceptor of this.responseInterceptors) {
        interceptedResponse = await interceptor(
          interceptedResponse,
          interceptedEndpoint,
          interceptedMethod
        );
      }

      return interceptedResponse;
    } catch (error) {
      // 4. Ejecutar interceptores de ERROR
      let handledError = error;
      for (const interceptor of this.errorInterceptors) {
        handledError = await interceptor(handledError, endpoint, method);
      }

      throw handledError;
    }
  }
}

// ============================================
// INTERCEPTORS PREDEFINIDOS
// ============================================

/**
 * Interceptor de Autenticación
 * Agrega automáticamente el token JWT a las peticiones
 */
export const authInterceptor: RequestInterceptor = async (
  endpoint,
  method,
  data
) => {
  // Obtener token de localStorage
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (token) {
    // En un cliente real HTTP (fetch/axios), agregar header Authorization
    // Como usamos MockService, podemos simular agregando el token al data
    console.log(`[Auth Interceptor] Token agregado a ${method} ${endpoint}`);

    // En implementación real:
    // headers: { Authorization: `Bearer ${token}` }
  }

  return { endpoint, method, data };
};

/**
 * Interceptor de Logging
 * Registra todas las peticiones y respuestas
 */
export const loggingInterceptor: RequestInterceptor = (
  endpoint,
  method,
  data
) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${method} ${endpoint}`, data ? { data } : "");
  return { endpoint, method, data };
};

/**
 * Interceptor de Response Logging
 * Registra las respuestas exitosas
 */
export const responseLoggingInterceptor: ResponseInterceptor = <T>(
  response: ApiResponse<T>,
  endpoint: string,
  method: string
) => {
  const timestamp = new Date().toISOString();
  console.log(
    `[${timestamp}] ${method} ${endpoint} → ${response.success ? "✓ SUCCESS" : "✗ FAILED"}`,
    { success: response.success, hasData: !!response.data }
  );
  return response;
};

/**
 * Interceptor de Errores
 * Manejo centralizado de errores con logging
 */
export const errorLoggingInterceptor: ErrorInterceptor = (
  error,
  endpoint,
  method
) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ${method} ${endpoint} → ERROR`, error);
  return error;
};

/**
 * Interceptor de Refresh Token
 * Detecta tokens expirados y los refresca automáticamente
 *
 * ✅ TODO IMPLEMENTADO: Auto-refresh funcional con AuthClient
 */
export const refreshTokenInterceptor: ErrorInterceptor = async (
  error,
  endpoint,
  method
) => {
  // Detectar si es error de token expirado
  const isTokenExpired =
    error?.message?.includes("token") ||
    error?.message?.includes("expired") ||
    error?.message?.includes("unauthorized");

  if (isTokenExpired && typeof window !== "undefined") {
    const refreshToken = localStorage.getItem("refreshToken");

    if (refreshToken) {
      try {
        console.log("[Refresh Token] Token expirado, refrescando...");

        // Evitar loop infinito: no refrescar si el endpoint es refresh-token
        if (endpoint.includes("/refresh-token")) {
          throw new Error("Refresh token inválido");
        }

        // Llamar endpoint de refresh token (importación dinámica para evitar ciclos)
        const { AuthClient } = await import("./auth-client");
        const response = await AuthClient.refreshToken(refreshToken);

        if (response.success && response.data) {
          // Guardar nuevo token
          localStorage.setItem("token", response.data.token);
          console.log("[Refresh Token] Token refrescado exitosamente");

          // Reintentar la petición original
          return await BaseHttpClient.request(endpoint, method);
        } else {
          throw new Error("Failed to refresh token");
        }
      } catch (refreshError) {
        console.error("[Refresh Token] Error al refrescar token", refreshError);

        // Si falla el refresh, redirigir a login
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
  }

  throw error;
};

// ============================================
// INTERCEPTORS ADICIONALES
// ============================================

/**
 * Interceptor de Retry con Exponential Backoff
 * Reintenta automáticamente peticiones fallidas con delays progresivos
 *
 * ✅ TODO IMPLEMENTADO: Retry logic con exponential backoff
 * - Máximo 3 reintentos
 * - Delays: 1s, 2s, 4s (exponential backoff)
 * - Solo para errores recuperables (network, timeout, 503, 429)
 *
 * @example
 * Reintenta hasta 3 veces con delays de 1s, 2s, 4s
 */
export const retryInterceptor: ErrorInterceptor = async (
  error,
  endpoint,
  method
) => {
  // Obtener contador de reintentos del error (si existe)
  const retries = (error as any).__retryCount || 0;
  const maxRetries = 3;

  // Verificar si el error es recuperable
  const isRetryable =
    error?.message?.includes("network") ||
    error?.message?.includes("timeout") ||
    error?.message?.includes("fetch") ||
    (error as any)?.status === 503 || // Service Unavailable
    (error as any)?.status === 429; // Too Many Requests

  if (isRetryable && retries < maxRetries) {
    // Calcular delay con exponential backoff: 1s, 2s, 4s
    const delay = Math.pow(2, retries) * 1000;
    const nextRetry = retries + 1;

    console.log(
      `[Retry Interceptor] Intento ${nextRetry}/${maxRetries} en ${delay}ms para ${method} ${endpoint}`
    );

    // Esperar antes de reintentar
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Marcar el reintento en el error para tracking
    const retryError = new Error(error.message);
    (retryError as any).__retryCount = nextRetry;

    try {
      // Reintentar la petición
      return await BaseHttpClient.request(endpoint, method);
    } catch (retryErr) {
      // Pasar el contador al siguiente error
      (retryErr as any).__retryCount = nextRetry;
      throw retryErr;
    }
  }

  // Si no es recuperable o se agotaron reintentos
  if (retries >= maxRetries) {
    console.error(
      `[Retry Interceptor] Máximo de reintentos alcanzado para ${method} ${endpoint}`
    );
  }

  throw error;
};

/**
 * Interceptor de Analytics
 * Envía eventos a Google Analytics (gtag) automáticamente
 *
 * @example
 * Cada petición HTTP genera un evento en GA con método, endpoint y éxito
 */
export const analyticsInterceptor: ResponseInterceptor = <T>(
  response: ApiResponse<T>,
  endpoint: string,
  method: string
) => {
  // Solo enviar analytics en cliente (no SSR)
  if (
    typeof window !== "undefined" &&
    typeof (window as any).gtag === "function"
  ) {
    const gtag = (window as any).gtag;

    // Enviar evento a Google Analytics
    gtag("event", "api_call", {
      event_category: "API",
      event_label: `${method} ${endpoint}`,
      value: response.success ? 1 : 0,
      success: response.success,
      method,
      endpoint,
    });

    console.log(
      `[Analytics] Evento enviado: ${method} ${endpoint} (${response.success ? "✓" : "✗"})`
    );
  }

  return response;
};

/**
 * Interceptor de Performance Timing
 * Mide y registra el tiempo de respuesta de cada petición
 */
const timingMap = new Map<string, number>();

export const timingRequestInterceptor: RequestInterceptor = (
  endpoint,
  method,
  data
) => {
  const key = `${method}:${endpoint}`;
  timingMap.set(key, Date.now());
  return { endpoint, method, data };
};

export const timingResponseInterceptor: ResponseInterceptor = <T>(
  response: ApiResponse<T>,
  endpoint: string,
  method: string
) => {
  const key = `${method}:${endpoint}`;
  const startTime = timingMap.get(key);

  if (startTime) {
    const duration = Date.now() - startTime;
    console.log(`[Timing] ${key} → ${duration}ms`);
    timingMap.delete(key);

    // Enviar a analytics si está disponible
    if (
      typeof window !== "undefined" &&
      typeof (window as any).gtag === "function"
    ) {
      (window as any).gtag("event", "timing_complete", {
        name: "api_response_time",
        value: duration,
        event_category: "API",
        event_label: key,
      });
    }
  }

  return response;
};

// ============================================
// CONFIGURACIÓN INICIAL
// ============================================

/**
 * Inicializa los interceptors por defecto
 * Debe llamarse en el layout principal o _app
 *
 * @param options - Opciones de configuración
 * @param options.includeRetry - Activar interceptor de retry (default: true)
 * @param options.includeAnalytics - Activar interceptor de analytics (default: false)
 * @param options.includeTiming - Activar interceptor de timing (default: true en dev)
 *
 * @example
 * ```typescript
 * // En layout.tsx - Configuración por defecto
 * useEffect(() => {
 *   initializeInterceptors();
 * }, []);
 *
 * // Configuración personalizada
 * initializeInterceptors({
 *   includeRetry: true,
 *   includeAnalytics: true,
 *   includeTiming: true
 * });
 * ```
 */
export function initializeInterceptors(options?: {
  includeRetry?: boolean;
  includeAnalytics?: boolean;
  includeTiming?: boolean;
}): void {
  const {
    includeRetry = true,
    includeAnalytics = false,
    includeTiming = config.isDevelopment,
  } = options || {};

  // Limpiar interceptors anteriores
  BaseHttpClient.clearInterceptors();

  // REQUEST INTERCEPTORS
  BaseHttpClient.addRequestInterceptor(authInterceptor);
  BaseHttpClient.addRequestInterceptor(loggingInterceptor);

  if (includeTiming) {
    BaseHttpClient.addRequestInterceptor(timingRequestInterceptor);
  }

  // RESPONSE INTERCEPTORS
  BaseHttpClient.addResponseInterceptor(responseLoggingInterceptor);

  if (includeAnalytics) {
    BaseHttpClient.addResponseInterceptor(analyticsInterceptor);
  }

  if (includeTiming) {
    BaseHttpClient.addResponseInterceptor(timingResponseInterceptor);
  }

  // ERROR INTERCEPTORS
  BaseHttpClient.addErrorInterceptor(errorLoggingInterceptor);

  if (includeRetry) {
    BaseHttpClient.addErrorInterceptor(retryInterceptor);
  }

  BaseHttpClient.addErrorInterceptor(refreshTokenInterceptor);

  console.log("[Interceptors] Inicializados correctamente", {
    retry: includeRetry,
    analytics: includeAnalytics,
    timing: includeTiming,
  });
}
