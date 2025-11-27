import { EventPayload, createLogger } from "@libs/common";
import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { EventBusService } from "../event-bus.service";

const logger = createLogger("RequestReplyService");

/**
 * Solicitud pendiente de respuesta
 */
interface PendingRequest<T> {
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
  requestTime: Date;
}

/**
 * Request-Reply Pattern Service
 *
 * Implementa el patrón Request-Reply sobre Event Bus usando correlationId.
 * Permite hacer queries síncronas entre microservicios de forma event-driven.
 *
 * Flujo:
 * 1. Service A publica request con correlationId único
 * 2. Service B escucha request, procesa y publica response con mismo correlationId
 * 3. Service A recibe response y resuelve Promise pendiente
 *
 * @example
 * ```typescript
 * const response = await requestReply.request<RequestData, ResponseData>(
 *   'resources.query.getById',
 *   { resourceId: '123' },
 *   'resources.query.getById.response',
 *   5000
 * );
 * ```
 */
@Injectable()
export class RequestReplyService implements OnModuleDestroy {
  private pendingRequests = new Map<string, PendingRequest<any>>();
  private subscribedTopics = new Set<string>();

  constructor(private readonly eventBus: EventBusService) {
    logger.info("RequestReplyService initialized");
  }

  async onModuleDestroy() {
    // Cleanup: rechazar todas las requests pendientes
    for (const [correlationId, pending] of this.pendingRequests.entries()) {
      clearTimeout(pending.timeout);
      pending.reject(new Error("Service shutting down"));
    }
    this.pendingRequests.clear();

    logger.info("RequestReplyService destroyed", {
      cleanedRequests: this.pendingRequests.size,
    });
  }

  /**
   * Enviar request y esperar reply
   *
   * @param requestTopic - Tópico donde publicar el request
   * @param requestData - Datos del request
   * @param responseTopic - Tópico donde esperar el response
   * @param timeoutMs - Timeout en milisegundos (default: 5000)
   * @param service - Nombre del servicio que hace el request (default: 'unknown')
   * @returns Promise con los datos de respuesta
   * @throws Error si timeout o falla la comunicación
   */
  async request<TRequest, TResponse>(
    requestTopic: string,
    requestData: TRequest,
    responseTopic: string,
    timeoutMs = 5000,
    service = "unknown"
  ): Promise<TResponse> {
    const correlationId = uuidv4();

    logger.debug("Sending request", {
      requestTopic,
      responseTopic,
      correlationId,
      timeoutMs,
    });

    return new Promise<TResponse>((resolve, reject) => {
      // Setup timeout
      const timeout = setTimeout(() => {
        const pending = this.pendingRequests.get(correlationId);
        if (pending) {
          this.pendingRequests.delete(correlationId);
          const elapsed = Date.now() - pending.requestTime.getTime();
          logger.warn("Request timeout", {
            requestTopic,
            correlationId,
            timeoutMs,
            elapsed,
          });
          reject(
            new Error(
              `Request timeout for ${requestTopic} after ${elapsed}ms (timeout: ${timeoutMs}ms)`
            )
          );
        }
      }, timeoutMs);

      // Store pending request
      this.pendingRequests.set(correlationId, {
        resolve,
        reject,
        timeout,
        requestTime: new Date(),
      });

      // Subscribe to response topic (first time only)
      this.ensureSubscribed(responseTopic, service);

      // Publish request with correlationId
      const event: EventPayload<TRequest & { correlationId: string }> = {
        eventId: correlationId,
        eventType: requestTopic,
        timestamp: new Date(),
        service,
        data: {
          ...(requestData as any),
          correlationId,
        },
      };

      this.eventBus
        .publish(requestTopic, event)
        .then(() => {
          logger.debug("Request published", {
            requestTopic,
            correlationId,
          });
        })
        .catch((error) => {
          // Cleanup on publish error
          const pending = this.pendingRequests.get(correlationId);
          if (pending) {
            clearTimeout(pending.timeout);
            this.pendingRequests.delete(correlationId);
          }
          logger.error("Failed to publish request", error, {
            requestTopic,
            correlationId,
          });
          reject(error);
        });
    });
  }

  /**
   * Suscribirse a tópico de respuesta (solo una vez)
   */
  private ensureSubscribed(responseTopic: string, groupId: string): void {
    if (this.subscribedTopics.has(responseTopic)) {
      return;
    }

    this.subscribedTopics.add(responseTopic);

    this.eventBus
      .subscribe(responseTopic, groupId, async (event: EventPayload<any>) => {
        await this.handleResponse(event);
      })
      .then(() => {
        logger.info("Subscribed to response topic", {
          responseTopic,
          groupId,
        });
      })
      .catch((error) => {
        logger.error("Failed to subscribe to response topic", error, {
          responseTopic,
          groupId,
        });
        this.subscribedTopics.delete(responseTopic);
      });
  }

  /**
   * Manejar respuesta recibida
   */
  private async handleResponse(event: EventPayload<any>): Promise<void> {
    const { correlationId, ...responseData } = event.data || {};

    if (!correlationId) {
      logger.warn("Received response without correlationId", {
        eventType: event.eventType,
        eventId: event.eventId,
      });
      return;
    }

    const pending = this.pendingRequests.get(correlationId);

    if (!pending) {
      logger.debug(
        "Received response for unknown correlationId (may be timeout)",
        {
          correlationId,
          eventType: event.eventType,
        }
      );
      return;
    }

    // Cleanup
    clearTimeout(pending.timeout);
    this.pendingRequests.delete(correlationId);

    const elapsed = Date.now() - pending.requestTime.getTime();

    logger.debug("Response received", {
      correlationId,
      eventType: event.eventType,
      elapsed: `${elapsed}ms`,
    });

    // Resolve promise
    pending.resolve(responseData);
  }

  /**
   * Obtener número de requests pendientes (para debug/monitoring)
   */
  getPendingRequestsCount(): number {
    return this.pendingRequests.size;
  }

  /**
   * Obtener estadísticas del servicio
   */
  getStats(): {
    pendingRequests: number;
    subscribedTopics: number;
    topics: string[];
  } {
    return {
      pendingRequests: this.pendingRequests.size,
      subscribedTopics: this.subscribedTopics.size,
      topics: Array.from(this.subscribedTopics),
    };
  }

  /**
   * Cancelar request pendiente manualmente
   */
  cancelRequest(correlationId: string): boolean {
    const pending = this.pendingRequests.get(correlationId);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingRequests.delete(correlationId);
      pending.reject(new Error("Request cancelled manually"));
      logger.info("Request cancelled", { correlationId });
      return true;
    }
    return false;
  }
}
