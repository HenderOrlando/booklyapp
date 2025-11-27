import { createLogger } from "@libs/common";
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

/**
 * Logging Interceptor
 * Logs all incoming requests and outgoing responses
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = createLogger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query } = request;
    const userAgent = request.get("user-agent") || "";
    const ip = request.ip;

    const now = Date.now();

    this.logger.info(`Incoming Request: ${method} ${url}`, {
      method,
      url,
      query,
      body: this.sanitizeBody(body),
      userAgent,
      ip,
    });

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const duration = Date.now() - now;

          this.logger.info(
            `Outgoing Response: ${method} ${url} - ${statusCode}`,
            {
              method,
              url,
              statusCode,
              duration: `${duration}ms`,
            }
          );
        },
        error: (error) => {
          const duration = Date.now() - now;

          this.logger.error(`Request Error: ${method} ${url}`, error, {
            method,
            url,
            duration: `${duration}ms`,
          });
        },
      })
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sanitized = { ...body };
    const sensitiveFields = ["password", "token", "secret", "apiKey"];

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = "***REDACTED***";
      }
    }

    return sanitized;
  }
}
