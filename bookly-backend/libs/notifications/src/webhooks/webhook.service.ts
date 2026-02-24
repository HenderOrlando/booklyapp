import { createLogger } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import { Injectable } from "@nestjs/common";
import { NotificationMetricsService } from "../services/notification-metrics.service";
import { SendGridWebhookHandler } from "./handlers/sendgrid-webhook.handler";
import { TwilioWebhookHandler } from "./handlers/twilio-webhook.handler";
import { IWebhookHandler, WebhookPayload } from "./webhook.interface";

const logger = createLogger("WebhookService");

/**
 * Webhook Service
 * Servicio central para manejar webhooks de todos los proveedores
 */
@Injectable()
export class WebhookService {
  private handlers: Map<string, IWebhookHandler> = new Map();

  constructor(
    private readonly sendGridHandler: SendGridWebhookHandler,
    private readonly twilioHandler: TwilioWebhookHandler,
    private readonly metricsService: NotificationMetricsService,
    private readonly eventBus: EventBusService
  ) {
    // Registrar handlers
    this.registerHandler(sendGridHandler);
    this.registerHandler(twilioHandler);
  }

  /**
   * Registrar un webhook handler
   */
  registerHandler(handler: IWebhookHandler): void {
    this.handlers.set(handler.providerName, handler);
    logger.info(`Webhook handler registered: ${handler.providerName}`);
  }

  /**
   * Procesar webhook de un proveedor
   */
  async processWebhook(
    provider: string,
    body: any,
    signature?: string,
    secret?: string
  ): Promise<{ processed: number; errors: string[] }> {
    const handler = this.handlers.get(provider);

    if (!handler) {
      throw new Error(`No webhook handler found for provider: ${provider}`);
    }

    // Verificar firma si se proporciona
    if (signature && secret) {
      const payloadStr = JSON.stringify(body);
      const isValid = handler.verifySignature(payloadStr, signature, secret);

      if (!isValid) {
        throw new Error("Invalid webhook signature");
      }
    }

    // Parsear payload
    const payloads = handler.parsePayload(body);
    const errors: string[] = [];
    let processed = 0;

    // Procesar cada evento
    for (const payload of payloads) {
      try {
        await this.processEvent(handler, payload);
        processed++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push(`Error processing event ${payload.messageId}: ${errorMsg}`);
        logger.error("Error processing webhook event", error);
      }
    }

    logger.info(
      `Webhook processed: ${provider} - ${processed}/${payloads.length} events`
    );

    return { processed, errors };
  }

  /**
   * Procesar un evento individual
   */
  private async processEvent(
    handler: IWebhookHandler,
    payload: WebhookPayload
  ): Promise<void> {
    // Ejecutar handler específico del proveedor
    await handler.handleEvent(payload);

    // Registrar métricas si es entrega exitosa o fallo
    if (payload.eventType === "delivered") {
      this.metricsService.recordSendEvent(
        payload.provider,
        payload.channel,
        payload.tenantId || "default",
        true,
        0 // Latency no disponible en webhook
      );
    } else if (
      payload.eventType === "failed" ||
      payload.eventType === "bounced"
    ) {
      this.metricsService.recordSendEvent(
        payload.provider,
        payload.channel,
        payload.tenantId || "default",
        false,
        0,
        payload.error
      );
    }

    // Publicar evento en Event Bus
    await this.eventBus.publish("bookly.notifications.webhook", {
      eventId: `webhook-${payload.messageId}-${Date.now()}`,
      eventType: `notification.${payload.eventType}`,
      service: "notifications",
      timestamp: new Date(),
      data: payload,
    });
  }

  /**
   * Obtener handlers registrados
   */
  getRegisteredHandlers(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Verificar si un provider tiene handler
   */
  hasHandler(provider: string): boolean {
    return this.handlers.has(provider);
  }
}
