import { ApiResponse } from "@libs/common";
import { createLogger } from "@libs/common";
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Response } from "express";

/**
 * All Exceptions Filter
 * Catches all unhandled exceptions
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = createLogger("AllExceptionsFilter");

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : "Internal server error";

    const errorResponse: ApiResponse = {
      success: false,
      message,
      errors: [
        {
          code: "INTERNAL_ERROR",
          message,
          type: "system",
        },
      ],
      timestamp: new Date(),
    };

    this.logger.error(
      `Unhandled exception: ${request.method} ${request.url}`,
      exception as Error,
      {
        statusCode: status,
        path: request.url,
        method: request.method,
      }
    );

    response.status(status).json(errorResponse);
  }
}
