import { Logger } from "@libs/common";
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, of } from "rxjs";
import { tap } from "rxjs/operators";
import { IdempotencyService } from "../services/idempotency.service";

/**
 * Interceptor for HTTP endpoints to handle idempotency
 * Checks idempotency key from headers and returns cached result if exists
 */
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger("IdempotencyInterceptor");

  constructor(private readonly idempotencyService: IdempotencyService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const idempotencyKey = request.headers["idempotency-key"] as string;

    // Only apply to POST, PUT, PATCH (mutating operations)
    const method = request.method;
    if (!idempotencyKey || !["POST", "PUT", "PATCH"].includes(method)) {
      return next.handle();
    }

    try {
      // Check if operation was already completed
      const status =
        await this.idempotencyService.checkIdempotency(idempotencyKey);

      if (status === "completed") {
        // Return cached result
        const cachedResult =
          await this.idempotencyService.getOperationResult(idempotencyKey);

        this.logger.info("Returning cached result for idempotent request", {
          idempotencyKey,
          path: request.url,
        });

        return of(cachedResult);
      }

      if (status === "duplicate") {
        // Another instance is processing, return 409 Conflict
        const response = context.switchToHttp().getResponse();
        response.status(409).json({
          success: false,
          message: "Request is already being processed",
          idempotencyKey,
        });
        return of(null);
      }

      // New operation - mark as started
      const correlationId = (request as any).correlationId || "unknown";
      const messageId = `msg-${Date.now()}`;

      await this.idempotencyService.startOperation(
        idempotencyKey,
        correlationId,
        messageId
      );

      // Process and cache result
      return next.handle().pipe(
        tap(async (result) => {
          await this.idempotencyService.completeOperation(
            idempotencyKey,
            result
          );
        })
      );
    } catch (error) {
      this.logger.error("Error in idempotency interceptor", error);
      // On error, allow request to proceed
      return next.handle();
    }
  }
}
