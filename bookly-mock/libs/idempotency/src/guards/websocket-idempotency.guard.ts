import { Logger } from "@libs/common";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { CorrelationService } from "../services/correlation.service";
import { IdempotencyService } from "../services/idempotency.service";

/**
 * WebSocket Guard for automatic message deduplication
 * Prevents duplicate processing of WebSocket messages using idempotency keys
 *
 * @example
 * ```typescript
 * @UseGuards(WebSocketIdempotencyGuard)
 * @SubscribeMessage('reservation.create')
 * async handleCreate(
 *   @MessageBody() data: CreateReservationDto,
 *   @ConnectedSocket() client: Socket
 * ) {
 *   // Message is guaranteed to be processed only once
 * }
 * ```
 *
 * Client must send:
 * ```typescript
 * socket.emit('reservation.create', {
 *   idempotencyKey: 'unique-key-123',
 *   correlationId: 'corr-456',
 *   data: { ... }
 * });
 * ```
 */
@Injectable()
export class WebSocketIdempotencyGuard implements CanActivate {
  private readonly logger = new Logger("WebSocketIdempotencyGuard");

  constructor(
    private readonly idempotencyService: IdempotencyService,
    private readonly correlationService: CorrelationService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const wsContext = context.switchToWs();
    const data = wsContext.getData();
    const client = wsContext.getClient();

    // Extract idempotency metadata from message
    const idempotencyKey = data?.idempotencyKey;
    const correlationId =
      data?.correlationId ||
      client.handshake?.headers?.["x-correlation-id"] ||
      this.correlationService.generateCorrelationId("ws");
    const messageId =
      data?.messageId || this.correlationService.generateMessageId();

    // If no idempotency key, allow through (non-idempotent message)
    if (!idempotencyKey) {
      // Inject correlationId and messageId for tracing
      data.correlationId = correlationId;
      data.messageId = messageId;
      return true;
    }

    try {
      // Check idempotency
      const status =
        await this.idempotencyService.checkIdempotency(idempotencyKey);

      if (status === "completed") {
        // Message already processed, send cached result
        const cachedResult =
          await this.idempotencyService.getOperationResult(idempotencyKey);

        this.logger.info("WebSocket message already processed", {
          idempotencyKey,
          correlationId,
          clientId: client.id,
        });

        // Send cached response back to client
        client.emit("message.response", {
          success: true,
          cached: true,
          idempotencyKey,
          correlationId,
          data: cachedResult,
        });

        // Block further processing
        return false;
      }

      if (status === "duplicate") {
        // Another instance is processing
        this.logger.warn("WebSocket message already being processed", {
          idempotencyKey,
          correlationId,
        });

        // Notify client
        client.emit("message.duplicate", {
          success: false,
          message: "Message is already being processed",
          idempotencyKey,
          correlationId,
        });

        // Block processing
        return false;
      }

      // New message - mark as processing
      await this.idempotencyService.startOperation(
        idempotencyKey,
        correlationId,
        messageId
      );

      // Inject metadata for handler
      data.correlationId = correlationId;
      data.messageId = messageId;
      data._idempotencyTracked = true;

      // Store reference for completion in interceptor
      (context as any).idempotencyKey = idempotencyKey;

      this.logger.debug("WebSocket message accepted for processing", {
        idempotencyKey,
        correlationId,
        messageId,
      });

      return true;
    } catch (error) {
      this.logger.error("Error checking WebSocket idempotency", error, {
        idempotencyKey,
      });

      // On error, allow through (fail open)
      return true;
    }
  }
}

/**
 * Interceptor to complete idempotency tracking after successful WebSocket processing
 * Use together with WebSocketIdempotencyGuard
 *
 * @example
 * ```typescript
 * @UseGuards(WebSocketIdempotencyGuard)
 * @UseInterceptors(WebSocketIdempotencyInterceptor)
 * @SubscribeMessage('reservation.create')
 * async handleCreate(@MessageBody() data: any) {
 *   return await this.service.create(data);
 * }
 * ```
 */
@Injectable()
export class WebSocketIdempotencyInterceptor {
  private readonly logger = new Logger("WebSocketIdempotencyInterceptor");

  constructor(private readonly idempotencyService: IdempotencyService) {}

  async intercept(context: ExecutionContext, next: any): Promise<any> {
    const idempotencyKey = (context as any).idempotencyKey;

    if (!idempotencyKey) {
      return next.handle();
    }

    try {
      const result = await next.handle().toPromise();

      // Mark as completed
      await this.idempotencyService.completeOperation(idempotencyKey, result);

      this.logger.debug("WebSocket message processing completed", {
        idempotencyKey,
      });

      return result;
    } catch (error) {
      // Mark as failed
      await this.idempotencyService.failOperation(idempotencyKey, error);

      this.logger.error("WebSocket message processing failed", error, {
        idempotencyKey,
      });

      throw error;
    }
  }
}
