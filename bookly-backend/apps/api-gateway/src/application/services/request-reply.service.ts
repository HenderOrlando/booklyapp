import { EventType } from "@libs/common/enums";
import { EventPayload } from "@libs/common";
import { createLogger } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import { Injectable, OnModuleInit } from "@nestjs/common";

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timeout: NodeJS.Timeout;
}

/**
 * Request-Reply Service
 * Implementa patrón Request-Reply sobre Kafka usando correlationId
 * Permite esperar respuestas de comandos asíncronos
 */
@Injectable()
export class RequestReplyService implements OnModuleInit {
  private readonly logger = createLogger("RequestReplyService");
  private readonly pendingRequests = new Map<string, PendingRequest>();
  private readonly defaultTimeout = 30000; // 30 segundos

  constructor(private readonly eventBusService: EventBusService) {}

  async onModuleInit() {
    // Suscribirse al tópico de respuestas del API Gateway
    await this.eventBusService.subscribe(
      EventType.API_GATEWAY_REQUEST_REPLY,
      EventType.API_GATEWAY_GROUP,
      this.handleReply.bind(this)
    );

    this.logger.info("Request-Reply service initialized");
  }

  /**
   * Enviar comando y esperar respuesta
   */
  async sendAndWaitReply<T = any>(
    topic: string,
    event: EventPayload,
    timeoutMs?: number
  ): Promise<T> {
    const correlationId = event.eventId;
    const timeout = timeoutMs || this.defaultTimeout;

    this.logger.info(
      `[REQUEST-REPLY] Sending request with correlationId: ${correlationId}`,
      { topic, timeout }
    );

    return new Promise<T>(async (resolve, reject) => {
      // Configurar timeout
      const timeoutHandle = setTimeout(() => {
        this.pendingRequests.delete(correlationId);
        this.logger.error(
          `[REQUEST-REPLY] Timeout waiting for reply: ${correlationId}`
        );
        reject(
          new Error(`Request timeout after ${timeout}ms for ${correlationId}`)
        );
      }, timeout);

      // Guardar request pendiente
      this.pendingRequests.set(correlationId, {
        resolve,
        reject,
        timeout: timeoutHandle,
      });

      try {
        // Agregar metadata de reply al evento
        const enrichedEvent = {
          ...event,
          metadata: {
            ...event.metadata,
            correlationId,
            replyTo: "api-gateway.replies",
            timestamp: new Date().toISOString(),
          },
        };

        // Publicar evento a través del Event Bus
        await this.eventBusService.publish(topic, enrichedEvent);

        this.logger.debug(
          `[REQUEST-REPLY] Request sent successfully: ${correlationId}`
        );
      } catch (error) {
        // Limpiar en caso de error al publicar
        clearTimeout(timeoutHandle);
        this.pendingRequests.delete(correlationId);
        reject(error);
      }
    });
  }

  /**
   * Manejar respuesta de Kafka
   */
  private async handleReply(event: EventPayload): Promise<void> {
    const correlationId =
      event.metadata?.correlationId || event.data?.correlationId;

    if (!correlationId) {
      this.logger.warn("[REQUEST-REPLY] Reply without correlationId received");
      return;
    }

    const pendingRequest = this.pendingRequests.get(correlationId);

    if (!pendingRequest) {
      this.logger.warn(
        `[REQUEST-REPLY] Reply for unknown request: ${correlationId}`
      );
      return;
    }

    this.logger.info(`[REQUEST-REPLY] Reply received for: ${correlationId}`, {
      success: event.data?.success,
      status: event.data?.status,
    });

    // Limpiar timeout
    clearTimeout(pendingRequest.timeout);
    this.pendingRequests.delete(correlationId);

    // Resolver o rechazar según el resultado
    if (event.data?.success === false || event.data?.error) {
      pendingRequest.reject(
        new Error(event.data?.error || "Command execution failed")
      );
    } else {
      pendingRequest.resolve(event.data);
    }
  }

  /**
   * Obtener estadísticas de requests pendientes
   */
  getStats() {
    return {
      pendingRequests: this.pendingRequests.size,
      requests: Array.from(this.pendingRequests.keys()),
    };
  }
}
