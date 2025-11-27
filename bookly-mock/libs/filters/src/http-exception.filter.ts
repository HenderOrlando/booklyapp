import { ApiResponse } from "@libs/common";
import { createLogger } from "@libs/common";
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";
import { Response } from "express";

/**
 * HTTP Exception Filter
 * Catches all HTTP exceptions and formats them consistently
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = createLogger("HttpExceptionFilter");

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const errorResponse: ApiResponse = {
      success: false,
      message: this.getErrorMessage(exceptionResponse),
      errors: this.getErrorDetails(exceptionResponse),
      timestamp: new Date(),
    };

    this.logger.error(
      `HTTP ${status} Error: ${request.method} ${request.url}`,
      exception,
      {
        statusCode: status,
        message: errorResponse.message,
        path: request.url,
        method: request.method,
      }
    );

    response.status(status).json(errorResponse);
  }

  private getErrorMessage(exceptionResponse: any): string {
    if (typeof exceptionResponse === "string") {
      return exceptionResponse;
    }

    if (exceptionResponse?.message) {
      if (Array.isArray(exceptionResponse.message)) {
        return exceptionResponse.message.join(", ");
      }
      return exceptionResponse.message;
    }

    return "An error occurred";
  }

  private getErrorDetails(exceptionResponse: any): any[] {
    if (typeof exceptionResponse === "object" && exceptionResponse?.message) {
      if (Array.isArray(exceptionResponse.message)) {
        return exceptionResponse.message.map((msg, index) => ({
          code: `VALIDATION_ERROR_${index}`,
          message: msg,
          type: "validation",
        }));
      }
    }

    return [];
  }
}
