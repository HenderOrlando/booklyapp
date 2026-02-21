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
      return response.data as ApiResponse<T>;
    }

    // Fallback for legacy format or unformatted responses
    return {
      success: true,
      data: response.data as T,
    };
  }
}
