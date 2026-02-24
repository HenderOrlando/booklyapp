import { normalizeApiEndpoint } from "@/infrastructure/data-providers/endpoint-routing";
import type {
  DataProvider,
  DataProviderRequest,
} from "@/infrastructure/data-providers/types";
import { MockService } from "@/infrastructure/mock/mockService";

function createAbortError(): Error {
  const error = new Error("Request aborted");
  error.name = "AbortError";
  return error;
}

export class MockDataProvider implements DataProvider {
  readonly id = "mock" as const;

  buildUrl(endpoint: string): string {
    return normalizeApiEndpoint(endpoint);
  }

  async request<T>(request: DataProviderRequest) {
    if (request.signal?.aborted) {
      throw createAbortError();
    }

    const response = await MockService.mockRequest<T>(
      this.buildUrl(request.endpoint),
      request.method,
      request.data,
    );

    if (request.signal?.aborted) {
      throw createAbortError();
    }

    return response;
  }
}
