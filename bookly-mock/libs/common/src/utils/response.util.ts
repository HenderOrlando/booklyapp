/**
 * Unified Response Utilities for Bookly
 * Supports HTTP, WebSocket, Events, and RPC responses
 * Compatible with bookly-backend ResponseUtil standard
 */

import { ResponseContextPriority, ResponseContextType } from "../enums";
import {
  AdvancedSearchPaginationMeta,
  ApiResponseBookly,
  PaginationMeta,
  ResponseContext,
} from "../interfaces";

export class ResponseUtil {
  /**
   * Create a successful response
   * @param data - Response data
   * @param message - Optional success message
   * @param meta - Optional pagination or search metadata
   * @param context - Optional context (for events, websockets, etc.)
   */
  static success<T>(
    data: T,
    message?: string,
    meta?: PaginationMeta | AdvancedSearchPaginationMeta,
    context?: ResponseContext
  ): ApiResponseBookly<T> {
    const response: ApiResponseBookly<T> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };

    if (message) {
      response.message = message;
    }

    if (meta) {
      response.meta = meta;
    }

    if (context) {
      response.context = context;
      if (context.path) response.path = context.path;
      if (context.method) response.method = context.method;
      if (context.statusCode) response.statusCode = context.statusCode;
    }

    return response;
  }

  /**
   * Create a successful paginated response
   */
  static paginated<T>(
    data: T[],
    total: number,
    page: number = 1,
    limit: number = 20,
    message?: string,
    context?: ResponseContext
  ): ApiResponseBookly<T[]> {
    const meta: PaginationMeta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    return this.success<T[]>(data, message, meta, context);
  }

  /**
   * Create a successful advanced search paginated response
   */
  static advancedSearchPaginated<T>(
    data: T[],
    pagination: PaginationMeta,
    startTime: number,
    filters: any,
    message?: string,
    context?: ResponseContext
  ): ApiResponseBookly<T[]> {
    const meta: AdvancedSearchPaginationMeta = {
      pagination: {
        ...pagination,
        page: pagination.page || 1,
        limit: pagination.limit || 20,
        totalPages:
          pagination.totalPages ||
          Math.ceil((pagination.total || 0) / (pagination.limit || 20)),
      },
      executionTimeMs: Date.now() - startTime,
      timestamp: new Date(),
      filters,
    };

    return this.success<T[]>(data, message, meta, context);
  }

  /**
   * Create an error response
   */
  static error(
    message: string,
    errors?: Record<string, string[]>,
    data?: any,
    context?: ResponseContext
  ): ApiResponseBookly<any> {
    const response: ApiResponseBookly<any> = {
      success: false,
      message,
      data: data || null,
      timestamp: new Date().toISOString(),
    };

    if (errors) {
      response.errors = errors;
    }

    if (context) {
      response.context = context;
      if (context.path) response.path = context.path;
      if (context.method) response.method = context.method;
      if (context.statusCode) response.statusCode = context.statusCode;
    }

    return response;
  }

  /**
   * Create validation error response
   */
  static validationError(
    errors: Record<string, string[]>,
    message: string = "Validation failed",
    context?: ResponseContext
  ): ApiResponseBookly<null> {
    return this.error(message, errors, null, context);
  }

  /**
   * Create not found error response
   */
  static notFound(
    resource: string = "Resource",
    message?: string,
    context?: ResponseContext
  ): ApiResponseBookly<null> {
    return this.error(
      message || `${resource} not found`,
      undefined,
      null,
      context
    );
  }

  /**
   * Create unauthorized error response
   */
  static unauthorized(
    message: string = "Unauthorized access",
    context?: ResponseContext
  ): ApiResponseBookly<null> {
    return this.error(message, undefined, null, context);
  }

  /**
   * Create forbidden error response
   */
  static forbidden(
    message: string = "Access forbidden",
    context?: ResponseContext
  ): ApiResponseBookly<null> {
    return this.error(message, undefined, null, context);
  }

  /**
   * Transform service response to standardized format
   */
  static fromServiceResponse<T>(serviceResponse: {
    data?: T[] | T;
    items?: T[];
    total?: number;
    page?: number;
    limit?: number;
    message?: string;
  }): ApiResponseBookly<T[] | T> {
    // Handle paginated service responses
    if (serviceResponse.items && serviceResponse.total !== undefined) {
      return this.paginated(
        serviceResponse.items,
        serviceResponse.total,
        serviceResponse.page,
        serviceResponse.limit,
        serviceResponse.message
      );
    }

    // Handle regular service responses
    const data = (serviceResponse.data || serviceResponse.items) as T[] | T;
    return this.success(data, serviceResponse.message);
  }

  /**
   * Transform array of entities to list response
   */
  static list<T>(items: T[], message?: string): ApiResponseBookly<T[]> {
    return this.success(items, message || "List retrieved successfully");
  }

  /**
   * Create an event response (for Event-Driven Architecture)
   * @param data - Event payload
   * @param eventType - Type of event (e.g., 'RESOURCE_CREATED')
   * @param service - Service that emitted the event
   * @param message - Optional message
   * @param options - Event options including idempotency, correlation, retry logic
   */
  static event<T>(
    data: T,
    eventType: string,
    service: string,
    message?: string,
    options?: {
      correlationId?: string;
      messageId?: string;
      causationId?: string;
      idempotencyKey?: string;
      retryCount?: number;
      maxRetries?: number;
      ttl?: number;
      expiresAt?: Date | string;
      version?: string;
      priority?: ResponseContextPriority;
    }
  ): ApiResponseBookly<T> {
    const context: ResponseContext = {
      type: ResponseContextType.EVENT,
      timestamp: new Date().toISOString(),
      eventType,
      service,
      ...options,
    };

    return this.success(data, message, undefined, context);
  }

  /**
   * Create a WebSocket response
   * @param data - Message payload
   * @param message - Optional message
   * @param path - WebSocket path
   * @param options - WebSocket options including idempotency
   */
  static websocket<T>(
    data: T,
    message?: string,
    path?: string,
    options?: {
      messageId?: string;
      correlationId?: string;
      idempotencyKey?: string;
      priority?: ResponseContextPriority;
    }
  ): ApiResponseBookly<T> {
    const context: ResponseContext = {
      type: ResponseContextType.WEBSOCKET,
      timestamp: new Date().toISOString(),
      path,
      ...options,
    };

    return this.success(data, message, undefined, context);
  }

  /**
   * Create an RPC response
   * @param data - Response payload
   * @param correlationId - Request correlation ID
   * @param message - Optional message
   * @param options - RPC options including idempotency and retry logic
   */
  static rpc<T>(
    data: T,
    correlationId: string,
    message?: string,
    options?: {
      messageId?: string;
      idempotencyKey?: string;
      retryCount?: number;
      maxRetries?: number;
      ttl?: number;
      priority?: ResponseContextPriority;
    }
  ): ApiResponseBookly<T> {
    const context: ResponseContext = {
      type: ResponseContextType.RPC,
      timestamp: new Date().toISOString(),
      correlationId,
      ...options,
    };

    return this.success(data, message, undefined, context);
  }

  /**
   * Create an HTTP response (legacy compatibility)
   */
  static http<T>(
    data: T,
    statusCode: number,
    path?: string,
    method?: string,
    message?: string
  ): ApiResponseBookly<T> {
    const context: ResponseContext = {
      type: ResponseContextType.HTTP,
      timestamp: new Date().toISOString(),
      statusCode,
      path,
      method,
    };

    return this.success(data, message, undefined, context);
  }
}

// Legacy exports for backward compatibility
export const createSuccessResponse = <T>(data: T, message?: string) =>
  ResponseUtil.success(data, message);

export const createErrorResponse = (message: string, code?: string) =>
  ResponseUtil.error(message, code ? { [code]: [message] } : undefined);

export const createValidationErrorResponse = (
  errors: Record<string, string[]>
) => ResponseUtil.validationError(errors);
