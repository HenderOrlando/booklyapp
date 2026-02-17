/**
 * Cliente HTTP Unificado para Bookly
 *
 * Maneja automáticamente el modo de datos (Mock o Serve):
 * - Mock Mode: Usa MockService con datos simulados
 * - Serve Mode: Hace peticiones reales al backend
 *
 * Uso:
 * ```ts
 * import { httpClient } from '@/infrastructure/http/httpClient';
 * const response = await httpClient.get('/auth/me');
 * ```
 */

import { MockService } from "@/infrastructure/mock/mockService";
import { config, getServiceUrl, isMockMode } from "@/lib/config";
import { ApiResponse } from "@/types/api/response";
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { extractMappedError } from "./errorMapper";

/**
 * Cliente Axios configurado para Serve Mode
 * NOTA: baseURL se deja vacío porque buildUrl() construye URLs completas
 * según la configuración (API Gateway vs servicios directos)
 */
const axiosInstance: AxiosInstance = axios.create({
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag para evitar refresh loops
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

/**
 * Genera un UUID v4 simple para correlation IDs
 */
function generateCorrelationId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback para entornos sin crypto.randomUUID
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Interceptor para agregar token de autenticación y correlation ID
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Agregar correlation ID para trazabilidad end-to-end
    config.headers["X-Correlation-ID"] = generateCorrelationId();

    // Obtener token de localStorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Interceptor para manejo de errores global y auto-refresh
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Manejo de token expirado (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si ya se está refrescando, esperar a que termine
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Intentar refresh del token
        const response = await axios.post(
          `${config.apiGatewayUrl}/api/v1/auth/refresh`,
          { refreshToken },
        );

        if (response.data.success && response.data.data) {
          const newAccessToken =
            response.data.data.accessToken || response.data.data.token;
          const newRefreshToken = response.data.data.refreshToken;

          // Guardar nuevos tokens
          localStorage.setItem("accessToken", newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }

          // Actualizar header
          axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Notificar a requests en espera
          onRefreshed(newAccessToken);
          isRefreshing = false;

          // Reintentar request original
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        isRefreshing = false;

        // Si falla el refresh, limpiar todo y redirigir a login
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          document.cookie = "accessToken=; path=/; max-age=0";
          document.cookie = "refreshToken=; path=/; max-age=0";

          // Redirigir solo si no estamos en login
          if (window.location.pathname !== "/login") {
            window.location.href = "/login?expired=true";
          }
        }

        return Promise.reject(refreshError);
      }
    }

    // Manejo de HTTP 429 (Rate Limited) con retry-after
    if (error.response?.status === 429 && !originalRequest._rateLimitRetry) {
      originalRequest._rateLimitRetry = true;
      const retryAfter = error.response.headers["retry-after"];
      const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 2000; // Default 2s backoff

      console.warn(`[HTTP 429] Rate limited. Retrying after ${waitMs}ms...`);

      await new Promise((resolve) => setTimeout(resolve, waitMs));
      return axiosInstance(originalRequest);
    }

    // Manejo de errores de servidor (500+)
    if (error.response?.status && error.response.status >= 500) {
      console.error("Error del servidor:", error.response.data);
    }

    // Manejo de errores de red
    if (!error.response) {
      console.error("Error de red: No se pudo conectar con el servidor");
    }

    return Promise.reject(error);
  },
);

/**
 * Cliente HTTP Unificado
 * Cambia automáticamente entre Mock y Serve según configuración
 */
class HttpClient {
  constructor() {
    this.logMode();
  }

  /**
   * Log del modo de operación (solo en desarrollo)
   */
  private logMode(): void {
    if (config.isDevelopment && typeof window !== "undefined") {
      console.log(
        `🌐 HTTP Client inicializado en modo: ${config.dataMode.toUpperCase()}`,
      );
      if (config.useDirectServices) {
        console.log("🔧 Usando servicios directos (bypass API Gateway)");
      }
    }
  }

  /**
   * Detecta si debe usar Mock Service
   */
  private shouldUseMock(): boolean {
    return isMockMode();
  }

  /**
   * Construye la URL completa del endpoint
   * Soporta servicios directos cuando useDirectServices=true
   */
  private buildUrl(endpoint: string): string {
    // Eliminar / inicial si existe
    let cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;

    // Si el endpoint ya tiene /api/v1/, no agregarlo de nuevo
    const fullEndpoint = cleanEndpoint.startsWith("api/v1/")
      ? `/${cleanEndpoint}`
      : `/api/v1/${cleanEndpoint}`;

    // DEBUG: Log de construcción de URL
    if (config.isDevelopment) {
      console.log("🔧 buildUrl DEBUG:", {
        input: endpoint,
        cleanEndpoint,
        fullEndpoint,
        isMock: this.shouldUseMock(),
        useDirectServices: config.useDirectServices,
      });
    }

    // En mock mode, retornar endpoint con prefijo (MockService lo maneja)
    if (this.shouldUseMock()) {
      console.log("📦 Mock Mode - URL:", fullEndpoint);
      return fullEndpoint;
    }

    // En serve mode con API Gateway (por defecto)
    if (!config.useDirectServices) {
      const url = `${config.apiGatewayUrl}${fullEndpoint}`;
      console.log("🌐 API Gateway Mode - URL:", url);
      return url;
    }

    // En serve mode con servicios directos
    // Detectar servicio desde el endpoint
    if (
      fullEndpoint.includes("/auth/") ||
      fullEndpoint.includes("/users/") ||
      fullEndpoint.includes("/users") ||
      fullEndpoint.includes("/roles") ||
      fullEndpoint.includes("/permissions")
    ) {
      const url = `${getServiceUrl("auth")}${fullEndpoint}`;
      console.log("🔑 Auth Service - URL:", url);
      return url;
    }
    if (
      fullEndpoint.includes("/resources/") ||
      fullEndpoint.includes("/resources") ||
      fullEndpoint.includes("resources") ||
      fullEndpoint.includes("/categories") ||
      fullEndpoint.includes("categories") ||
      fullEndpoint.includes("/programs") ||
      fullEndpoint.includes("programs")
    ) {
      const url = `${getServiceUrl("resources")}${fullEndpoint}`;
      console.log("📦 Resources Service - URL:", url);
      return url;
    }
    if (
      fullEndpoint.includes("/reservations") ||
      fullEndpoint.includes("/availabilities") ||
      fullEndpoint.includes("availability") ||
      fullEndpoint.includes("/history") ||
      fullEndpoint.includes("/reassignments") ||
      fullEndpoint.includes("/waitlist") ||
      fullEndpoint.includes("/check-in")
    ) {
      const url = `${getServiceUrl("availability")}${fullEndpoint}`;
      console.log("📅 Availability Service - URL:", url);
      return url;
    }
    if (
      fullEndpoint.includes("/stockpile/") ||
      fullEndpoint.includes("stockpile") ||
      fullEndpoint.includes("/approvals") ||
      fullEndpoint.includes("/approval-flows") ||
      fullEndpoint.includes("/approval-requests") ||
      fullEndpoint.includes("/documents") ||
      fullEndpoint.includes("/check-in-out")
    ) {
      const url = `${getServiceUrl("stockpile")}${fullEndpoint}`;
      console.log("✅ Stockpile Service - URL:", url);
      return url;
    }
    if (
      fullEndpoint.includes("/reports/") ||
      fullEndpoint.includes("dashboard/") ||
      fullEndpoint.includes("usage-reports") ||
      fullEndpoint.includes("demand-reports") ||
      fullEndpoint.includes("user-reports") ||
      fullEndpoint.includes("conflict-reports") ||
      fullEndpoint.includes("/feedback") ||
      fullEndpoint.includes("/notifications") ||
      fullEndpoint.includes("/audit") ||
      fullEndpoint.includes("/evaluations")
    ) {
      const url = `${getServiceUrl("reports")}${fullEndpoint}`;
      console.log("📊 Reports Service - URL:", url);
      return url;
    }

    // Por defecto usar API Gateway
    const defaultUrl = `${config.apiGatewayUrl}${fullEndpoint}`;
    console.log("🌐 Default (API Gateway) - URL:", defaultUrl);
    return defaultUrl;
  }

  /**
   * GET request
   */
  async get<T = any>(
    endpoint: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);

    if (this.shouldUseMock()) {
      return await MockService.mockRequest<T>(url, "GET");
    }

    try {
      const response = await axiosInstance.get<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);

    if (this.shouldUseMock()) {
      return await MockService.mockRequest<T>(url, "POST", data);
    }

    try {
      const response = await axiosInstance.post<ApiResponse<T>>(
        url,
        data,
        config,
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);

    if (this.shouldUseMock()) {
      return await MockService.mockRequest<T>(url, "PUT", data);
    }

    try {
      const response = await axiosInstance.put<ApiResponse<T>>(
        url,
        data,
        config,
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);

    if (this.shouldUseMock()) {
      return await MockService.mockRequest<T>(url, "PATCH", data);
    }

    try {
      const response = await axiosInstance.patch<ApiResponse<T>>(
        url,
        data,
        config,
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);

    if (this.shouldUseMock()) {
      return await MockService.mockRequest<T>(url, "DELETE");
    }

    try {
      const response = await axiosInstance.delete<ApiResponse<T>>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(
    error: any,
  ): Error & { mapped?: ReturnType<typeof extractMappedError> } {
    const mapped = extractMappedError(error);
    const err = new Error(mapped.fallbackMessage) as Error & {
      mapped?: typeof mapped;
      code?: string;
      httpCode?: number;
    };
    err.mapped = mapped;
    err.code = mapped.code;
    err.httpCode = mapped.httpCode;
    return err;
  }

  /**
   * Obtiene el modo actual
   */
  getMode(): "mock" | "serve" {
    return this.shouldUseMock() ? "mock" : "serve";
  }
}

/**
 * Instancia singleton del cliente HTTP
 * Usar esta instancia en toda la aplicación
 */
export const httpClient = new HttpClient();

/**
 * Helper para verificar si estamos en Mock Mode
 */
export { isMockMode };
