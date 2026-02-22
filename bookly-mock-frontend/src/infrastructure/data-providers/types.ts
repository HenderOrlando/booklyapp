import type { ApiResponse } from "@/types/api/response";
import type { AxiosRequestConfig } from "axios";

export type DataProviderId = "mock" | "server-gateway" | "server-direct";

export type ProviderHttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface DataProviderRequest {
  endpoint: string;
  method: ProviderHttpMethod;
  data?: unknown;
  config?: AxiosRequestConfig;
  signal?: AbortSignal;
}

export interface DataProvider {
  id: DataProviderId;
  request: <T>(request: DataProviderRequest) => Promise<ApiResponse<T>>;
  buildUrl: (endpoint: string) => string;
}
