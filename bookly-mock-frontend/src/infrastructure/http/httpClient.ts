/**
 * Cliente HTTP Unificado para Bookly
 *
 * Maneja automáticamente el modo de datos (Mock o Serve):
 * - Mock Mode: Usa MockService con datos simulados
 * - Serve Mode: Hace peticiones reales al backend
 */

import { MockDataProvider } from "@/infrastructure/data-providers/mock-data-provider";
import {
  selectDataProvider,
  type DataProviderRegistry,
} from "@/infrastructure/data-providers/select-data-provider";
import { ServerDirectDataProvider } from "@/infrastructure/data-providers/server-direct-provider";
import { ServerGatewayDataProvider } from "@/infrastructure/data-providers/server-gateway-provider";
import type { ProviderHttpMethod } from "@/infrastructure/data-providers/types";
import { extractMappedError } from "@/infrastructure/http/errorMapper";
import { config, isMockMode } from "@/lib/config";
import {
  getDataConfigSnapshot,
  subscribeToDataConfig,
  type DataConfigSnapshot,
} from "@/lib/data-config";
import { ApiResponse } from "@/types/api/response";
import axios, {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  type AxiosRequestConfig,
  type GenericAbortSignal,
} from "axios";

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

interface MutableRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _rateLimitRetry?: boolean;
  headers?: AxiosHeaders;
}

interface RefreshTokenPayload {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
}

interface RefreshTokenResponse {
  success: boolean;
  data?: RefreshTokenPayload;
}

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
  (requestConfig) => {
    const headers = AxiosHeaders.from(requestConfig.headers);

    // Agregar correlation ID para trazabilidad end-to-end
    headers.set("X-Correlation-ID", generateCorrelationId());

    // Obtener token de localStorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    requestConfig.headers = headers;
    return requestConfig;
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
    const originalRequest = (error.config ?? {}) as MutableRequestConfig;
    const originalHeaders = originalRequest.headers ?? new AxiosHeaders();
    originalRequest.headers = originalHeaders;

    // Manejo de token expirado (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Si ya se está refrescando, esperar a que termine
        return new Promise((resolve) => {
          addRefreshSubscriber((token: string) => {
            originalHeaders.set("Authorization", `Bearer ${token}`);
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
        const response = await axios.post<RefreshTokenResponse>(
          `${config.apiGatewayUrl}/api/v1/auth/refresh`,
          { refreshToken },
        );

        if (response.data.success && response.data.data) {
          const newAccessToken =
            response.data.data.accessToken || response.data.data.token;
          const newRefreshToken = response.data.data.refreshToken;

          if (!newAccessToken) {
            throw new Error("Refresh response without access token");
          }

          // Guardar nuevos tokens
          localStorage.setItem("accessToken", newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }

          // Actualizar header
          axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          originalHeaders.set("Authorization", `Bearer ${newAccessToken}`);

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
      const retryAfter = error.response.headers?.["retry-after"];
      const retryAfterRaw = Array.isArray(retryAfter)
        ? retryAfter[0]
        : retryAfter;
      const retryAfterSeconds = retryAfterRaw
        ? Number.parseInt(retryAfterRaw, 10)
        : Number.NaN;
      const waitMs = Number.isFinite(retryAfterSeconds)
        ? retryAfterSeconds * 1000
        : 2000;

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

function isAbortLikeError(error: unknown): boolean {
  if (axios.isCancel(error)) {
    return true;
  }

  if (error instanceof Error && error.name === "AbortError") {
    return true;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ERR_CANCELED"
  ) {
    return true;
  }

  return false;
}

function mergeAbortSignals(signals: GenericAbortSignal[]): {
  signal: AbortSignal;
  cleanup: () => void;
} {
  const validSignals = signals.filter(Boolean);

  const mergedController = new AbortController();
  const handlers = new Map<GenericAbortSignal, EventListener>();

  const abortMerged = () => {
    if (!mergedController.signal.aborted) {
      mergedController.abort();
    }
  };

  validSignals.forEach((signal) => {
    if (signal.aborted) {
      abortMerged();
      return;
    }

    if (typeof signal.addEventListener === "function") {
      const handler: EventListener = () => abortMerged();
      handlers.set(signal, handler);
      signal.addEventListener("abort", handler, { once: true });
    }
  });

  return {
    signal: mergedController.signal,
    cleanup: () => {
      handlers.forEach((handler, signal) => {
        if (typeof signal.removeEventListener === "function") {
          signal.removeEventListener("abort", handler);
        }
      });
    },
  };
}

/**
 * Cliente HTTP Unificado
 * Cambia automáticamente entre Mock y Serve según configuración runtime.
 */
class HttpClient {
  private readonly providers: DataProviderRegistry;
  private readonly activeControllers = new Set<AbortController>();
  private previousProviderId: string;

  constructor() {
    this.providers = {
      mock: new MockDataProvider(),
      serverGateway: new ServerGatewayDataProvider(axiosInstance),
      serverDirect: new ServerDirectDataProvider(axiosInstance),
    };

    this.previousProviderId = this.getActiveProvider().id;

    if (typeof window !== "undefined") {
      subscribeToDataConfig(() => {
        this.handleRuntimeConfigChange();
      });
    }

    this.logMode(getDataConfigSnapshot());
  }

  private getActiveProvider(
    snapshot: DataConfigSnapshot = getDataConfigSnapshot(),
  ) {
    return selectDataProvider(snapshot, this.providers);
  }

  private handleRuntimeConfigChange(): void {
    const snapshot = getDataConfigSnapshot();
    const activeProvider = this.getActiveProvider(snapshot);

    if (config.isDevelopment && this.previousProviderId !== activeProvider.id) {
      console.log(
        `[HTTP] Data provider reconfigurado: ${this.previousProviderId} -> ${activeProvider.id}`,
      );
    }

    this.previousProviderId = activeProvider.id;
    this.abortInFlightRequests();
    this.logMode(snapshot);
  }

  private logMode(snapshot: DataConfigSnapshot): void {
    if (config.isDevelopment && typeof window !== "undefined") {
      console.log(
        `[HTTP] Runtime config: ${snapshot.dataMode} | ${snapshot.routingMode} | ws=${snapshot.wsEnabled ? "ON" : "OFF"} | source=${snapshot.source}`,
      );
    }
  }

  private abortInFlightRequests(): void {
    this.activeControllers.forEach((controller) => {
      if (!controller.signal.aborted) {
        controller.abort();
      }
    });

    this.activeControllers.clear();
  }

  private createRequestSignal(externalSignal?: GenericAbortSignal): {
    controller: AbortController;
    signal: AbortSignal;
    cleanup: () => void;
  } {
    const controller = new AbortController();
    this.activeControllers.add(controller);

    if (!externalSignal) {
      return {
        controller,
        signal: controller.signal,
        cleanup: () => {},
      };
    }

    const merged = mergeAbortSignals([controller.signal, externalSignal]);
    return {
      controller,
      signal: merged.signal,
      cleanup: merged.cleanup,
    };
  }

  private async request<T>(
    method: ProviderHttpMethod,
    endpoint: string,
    data?: unknown,
    requestConfig?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const snapshot = getDataConfigSnapshot();
    const provider = this.getActiveProvider(snapshot);
    const { controller, signal, cleanup } = this.createRequestSignal(
      requestConfig?.signal,
    );

    try {
      const finalConfig: AxiosRequestConfig = {
        ...(requestConfig ?? {}),
        signal,
      };

      return await provider.request<T>({
        endpoint,
        method,
        data,
        config: finalConfig,
        signal,
      });
    } catch (error: unknown) {
      throw this.handleError(error);
    } finally {
      cleanup();
      this.activeControllers.delete(controller);
    }
  }

  async get<T = unknown>(
    endpoint: string,
    requestConfig?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>("GET", endpoint, undefined, requestConfig);
  }

  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    requestConfig?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>("POST", endpoint, data, requestConfig);
  }

  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    requestConfig?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>("PUT", endpoint, data, requestConfig);
  }

  async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    requestConfig?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>("PATCH", endpoint, data, requestConfig);
  }

  async delete<T = unknown>(
    endpoint: string,
    requestConfig?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", endpoint, undefined, requestConfig);
  }

  private handleError(
    error: unknown,
  ): Error & { mapped?: ReturnType<typeof extractMappedError> } {
    if (isAbortLikeError(error)) {
      const abortError = new Error("Request aborted");
      abortError.name = "AbortError";
      return abortError;
    }

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

  getMode(): "mock" | "serve" {
    return getDataConfigSnapshot().legacyDataMode;
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
