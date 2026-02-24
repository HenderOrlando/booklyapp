import { Logger, ResponseContext, ResponseContextType } from "@libs/common";
import { CorrelationService } from "../services/correlation.service";
import { IdempotencyService } from "../services/idempotency.service";

/**
 * Abstract base class for event handlers with automatic idempotency
 * Prevents duplicate processing of events using Redis-backed idempotency
 *
 * @example
 * ```typescript
 * @EventsHandler(ReservationCreatedEvent)
 * export class ReservationCreatedHandler
 *   extends EventIdempotencyHandler<ReservationCreatedEvent> {
 *
 *   constructor(
 *     idempotencyService: IdempotencyService,
 *     correlationService: CorrelationService,
 *     private readonly notificationService: NotificationService
 *   ) {
 *     super(idempotencyService, correlationService);
 *   }
 *
 *   protected async processEvent(
 *     event: ReservationCreatedEvent,
 *     context: ResponseContext
 *   ): Promise<void> {
 *     // Solo implementar lógica de negocio
 *     await this.notificationService.send(...);
 *   }
 *
 *   protected getIdempotencyKey(event: ReservationCreatedEvent): string {
 *     return `reservation-created-${event.data.reservationId}`;
 *   }
 * }
 * ```
 */
export abstract class EventIdempotencyHandler<T = any> {
  protected readonly logger: Logger;

  constructor(
    protected readonly idempotencyService: IdempotencyService,
    protected readonly correlationService: CorrelationService,
    loggerContext?: string
  ) {
    this.logger = new Logger(loggerContext || this.constructor.name);
  }

  /**
   * Main handle method called by NestJS event bus
   * Implements idempotency check before processing
   */
  async handle(event: T): Promise<void> {
    const context = this.extractContext(event);
    const idempotencyKey = this.getIdempotencyKey(event);

    try {
      // Check if event was already processed
      const status =
        await this.idempotencyService.checkIdempotency(idempotencyKey);

      if (status === "completed") {
        this.logger.info("Event already processed, skipping", {
          idempotencyKey,
          eventType: context.eventType,
          correlationId: context.correlationId,
        });
        return;
      }

      if (status === "duplicate") {
        this.logger.warn("Event is being processed by another instance", {
          idempotencyKey,
          eventType: context.eventType,
        });
        return;
      }

      // Mark as processing
      await this.idempotencyService.startOperation(
        idempotencyKey,
        context.correlationId || "unknown",
        context.messageId || `msg-${Date.now()}`
      );

      // Record in event chain
      if (context.correlationId && context.messageId) {
        await this.correlationService.recordEventChain(
          context.correlationId,
          context.messageId,
          context.causationId || null,
          context.eventType || "UNKNOWN_EVENT",
          context.service || process.env.SERVICE_NAME || "unknown"
        );
      }

      // Process the event
      await this.processEvent(event, context);

      // Mark as completed
      await this.idempotencyService.completeOperation(idempotencyKey, {
        processed: true,
        timestamp: new Date(),
      });

      this.logger.info("Event processed successfully", {
        idempotencyKey,
        eventType: context.eventType,
        correlationId: context.correlationId,
      });
    } catch (error) {
      this.logger.error("Error processing event", error, {
        idempotencyKey,
        eventType: context.eventType,
      });

      // Mark as failed
      await this.idempotencyService.failOperation(idempotencyKey, error);

      // Re-throw for potential retry mechanisms
      throw error;
    }
  }

  /**
   * Abstract method to be implemented by subclasses
   * Contains the actual business logic for processing the event
   */
  protected abstract processEvent(
    event: T,
    context: ResponseContext
  ): Promise<void>;

  /**
   * Generate idempotency key for the event
   * Override this method to customize key generation
   */
  protected getIdempotencyKey(event: T): string {
    const context = this.extractContext(event);

    // Default: use messageId if available, otherwise generate from context
    if (context.messageId) {
      return `event-${context.messageId}`;
    }

    return this.idempotencyService.generateIdempotencyKey(
      context.eventType || "unknown",
      context.correlationId || "unknown",
      Date.now()
    );
  }

  /**
   * Extract ResponseContext from event payload
   * Override if your event structure is different
   */
  protected extractContext(event: T): ResponseContext {
    // Assuming event has structure: { payload: { context: ResponseContext } }
    const payload = (event as any).payload || event;
    const context = payload.context || {};

    return {
      type: ResponseContextType.EVENT,
      timestamp: context.timestamp || new Date().toISOString(),
      eventType: context.eventType || payload.eventType || "UNKNOWN_EVENT",
      service: context.service || process.env.SERVICE_NAME || "unknown",
      correlationId: context.correlationId,
      messageId: context.messageId,
      causationId: context.causationId,
      idempotencyKey: context.idempotencyKey,
      retryCount: context.retryCount || 0,
      maxRetries: context.maxRetries || 3,
    };
  }

  /**
   * Determine if event should be retried based on error
   * Override to customize retry logic
   */
  protected shouldRetry(error: Error, context: ResponseContext): boolean {
    const retryCount = context.retryCount || 0;
    const maxRetries = context.maxRetries || 3;

    // Don't retry if max retries reached
    if (retryCount >= maxRetries) {
      return false;
    }

    // Don't retry validation errors (4xx-like errors)
    if (
      error.name === "ValidationError" ||
      error.name === "BadRequestException"
    ) {
      return false;
    }

    // Retry transient errors (network, timeout, etc.)
    return true;
  }
}
