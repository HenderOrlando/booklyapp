import { ApiResponseBookly } from "@libs/common";
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

/**
 * Transform Interceptor
 * Transforms all responses to ApiResponseBookly unified format
 * Compatible with HTTP, WebSocket, Events, and RPC
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponseBookly<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<ApiResponseBookly<T>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    return next.handle().pipe(
      map((data) => {
        // If data is already ApiResponseBookly format, enhance with HTTP context
        if (data && typeof data === "object" && "success" in data) {
          const apiResponse = data as ApiResponseBookly<T>;

          // Add HTTP context if not present
          if (!apiResponse.path && request?.url) {
            apiResponse.path = request.url;
          }
          if (!apiResponse.method && request?.method) {
            apiResponse.method = request.method;
          }
          if (!apiResponse.statusCode && response?.statusCode) {
            apiResponse.statusCode = response.statusCode;
          }
          if (!apiResponse.timestamp) {
            apiResponse.timestamp = new Date().toISOString();
          }

          return apiResponse;
        }

        // Transform to ApiResponseBookly format with HTTP context
        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
          path: request?.url,
          method: request?.method,
          statusCode: response?.statusCode || 200,
        };
      })
    );
  }
}
