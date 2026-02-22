import {
  normalizeApiEndpoint,
  resolveDirectServiceKey,
} from "@/infrastructure/data-providers/endpoint-routing";
import type {
  DataProvider,
  DataProviderRequest,
} from "@/infrastructure/data-providers/types";
import { config } from "@/lib/config";
import type { ApiResponse } from "@/types/api/response";
import type { AxiosInstance } from "axios";

export class ServerDirectDataProvider implements DataProvider {
  readonly id = "server-direct" as const;

  constructor(private readonly axiosInstance: AxiosInstance) {}

  buildUrl(endpoint: string): string {
    const normalizedEndpoint = normalizeApiEndpoint(endpoint);
    const serviceKey = resolveDirectServiceKey(normalizedEndpoint);

    if (!serviceKey) {
      return `${config.apiGatewayUrl}${normalizedEndpoint}`;
    }

    return `${config.serviceUrls[serviceKey]}${normalizedEndpoint}`;
  }

  async request<T>(request: DataProviderRequest): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.request<{ data: T } | ApiResponse<T>>({
      url: this.buildUrl(request.endpoint),
      method: request.method,
      data: request.data,
      ...request.config,
      signal: request.signal ?? request.config?.signal,
    });

    // Handle standard backend format { data: ... }
    if (response.data && "data" in response.data) {
      const payload = response.data as Record<string, unknown>;
      
      // Check for double-wrapped responses from GlobalResponseInterceptor
      if (
        payload.data &&
        typeof payload.data === "object" &&
        "success" in payload.data &&
        "data" in (payload.data as Record<string, unknown>)
      ) {
        return payload.data as ApiResponse<T>;
      }

      // Handle backend paginated format where data is an array and meta is at the root
      if (Array.isArray(payload.data) && payload.meta) {
        return {
          ...payload,
          success: payload.success ?? true,
          data: {
            items: payload.data,
            meta: payload.meta,
          } as unknown as T,
        } as ApiResponse<T>;
      }

      // Handle backend format where data is an object containing arrays but named differently (e.g. { reservations, meta })
      if (
        payload.data &&
        typeof payload.data === "object" &&
        !Array.isArray(payload.data) &&
        !("items" in (payload.data as Record<string, unknown>))
      ) {
        const dataObj = payload.data as Record<string, unknown>;
        const arrayKey = Object.keys(dataObj).find(key => Array.isArray(dataObj[key]));
        
        if (arrayKey && (dataObj.meta || payload.meta)) {
          return {
            ...payload,
            success: payload.success ?? true,
            data: {
              ...dataObj,
              items: dataObj[arrayKey],
              meta: dataObj.meta || payload.meta,
            } as unknown as T,
          } as ApiResponse<T>;
        }
      }

      return {
        ...payload,
        success: payload.success ?? true,
      } as ApiResponse<T>;
    }

    // Fallback for legacy format or unformatted responses
    return {
      success: true,
      data: response.data as T,
    };
  }
}
