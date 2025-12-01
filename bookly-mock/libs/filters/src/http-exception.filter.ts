import { 
  createLogger, 
  ResponseUtil, 
  ApiResponseBookly,
  ResponseContext,
  ResponseContextType 
} from "@libs/common";
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

/**
 * HTTP Exception Filter
 * Catches all HTTP exceptions and formats them using ResponseUtil
 * Ensures consistent error responses across all services
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = createLogger("HttpExceptionFilter");

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Build error response using ResponseUtil
    const errorResponse: ApiResponseBookly<null> = this.buildErrorResponse(
      exception,
      exceptionResponse,
      status,
      request
    );

    // Log error with context
    this.logger.error(
      `HTTP ${status} Error: ${request.method} ${request.url}`, exception,
      {
        statusCode: status,
        message: errorResponse.message || 'Unknown error',
        path: request.url,
        method: request.method,
        stack: exception.stack,
        user: request.user?.id || 'anonymous',
      }
    );

    response.status(status).json(errorResponse);
  }

  /**
   * Build error response using ResponseUtil based on HTTP status
   */
  private buildErrorResponse(
    exception: HttpException,
    exceptionResponse: any,
    status: number,
    request: any
  ): ApiResponseBookly<null> {
    const message = this.getErrorMessage(exceptionResponse);
    const errors = this.getValidationErrors(exceptionResponse);

    const context: ResponseContext = {
      type: ResponseContextType.HTTP,
      path: request.url,
      method: request.method,
      statusCode: status,
      timestamp: new Date().toISOString(),
    };

    // Use appropriate ResponseUtil method based on status code
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        if (errors && Object.keys(errors).length > 0) {
          return ResponseUtil.validationError(errors, message, context);
        }
        return ResponseUtil.error(message, errors, null, context);

      case HttpStatus.UNAUTHORIZED:
        return ResponseUtil.unauthorized(message, context);

      case HttpStatus.FORBIDDEN:
        return ResponseUtil.forbidden(message, context);

      case HttpStatus.NOT_FOUND:
        return ResponseUtil.notFound(this.extractResourceName(message), message, context);

      case HttpStatus.CONFLICT:
      case HttpStatus.UNPROCESSABLE_ENTITY:
      case HttpStatus.INTERNAL_SERVER_ERROR:
      default:
        return ResponseUtil.error(message, errors, null, context);
    }
  }

  /**
   * Extract error message from exception response
   */
  private getErrorMessage(exceptionResponse: any): string {
    if (typeof exceptionResponse === "string") {
      return exceptionResponse;
    }

    if (exceptionResponse?.message) {
      if (Array.isArray(exceptionResponse.message)) {
        return exceptionResponse.message[0] || "Validation failed";
      }
      return exceptionResponse.message;
    }

    return exceptionResponse?.error || "An error occurred";
  }

  /**
   * Extract validation errors from exception response
   */
  private getValidationErrors(exceptionResponse: any): Record<string, string[]> | undefined {
    if (typeof exceptionResponse === "object" && exceptionResponse?.message) {
      if (Array.isArray(exceptionResponse.message)) {
        // Convert array of validation messages to structured errors
        const errors: Record<string, string[]> = {};
        exceptionResponse.message.forEach((msg: string) => {
          // Try to extract field name from message (e.g., "email must be valid")
          const match = msg.match(/^(\w+)\s/);
          const field = match ? match[1] : 'general';
          if (!errors[field]) {
            errors[field] = [];
          }
          errors[field].push(msg);
        });
        return errors;
      }
    }

    return undefined;
  }

  /**
   * Extract resource name from error message
   */
  private extractResourceName(message: string): string {
    // Try to extract resource name from messages like "User not found"
    const match = message.match(/^(\w+)\s+not\s+found/i);
    return match ? match[1] : 'Resource';
  }
}
