import { NotificationChannel } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import { Injectable } from "@nestjs/common";
import { NotificationMetricsService } from "../services/notification-metrics.service";
import { IWebhookHandler, WebhookPayload } from "./webhook.interface";

const logger = createLogger("ChannelWebhookService");

/**
 * Channel Webhook Service
 * Servicio central para manejar webhooks organizados por canal
 */
@Injectable()
export class ChannelWebhookService {
  private handlers: Map<string, IWebhookHandler[]> = new Map();

  constructor(
    private readonly metricsService: NotificationMetricsService,
    private readonly eventBus: EventBusService
  ) {
    this.initializeChannelMaps();
  }

  /**
   * Inicializar mapas de canales
   */
  private initializeChannelMaps(): void {
    this.handlers.set(NotificationChannel.EMAIL, []);
    this.handlers.set(NotificationChannel.SMS, []);
    this.handlers.set(NotificationChannel.WHATSAPP, []);
    this.handlers.set(NotificationChannel.PUSH, []);
  }

  /**
   * Registrar un webhook handler para un canal
   */
  registerHandler(
    channel: NotificationChannel,
    handler: IWebhookHandler
  ): void {
    const channelHandlers = this.handlers.get(channel) || [];
    channelHandlers.push(handler);
    this.handlers.set(channel, channelHandlers);

    logger.info(
      `Webhook handler registered: ${handler.providerName} for channel ${channel}`
    );
  }

  /**
   * Procesar webhook por canal
   */
  async processWebhook(
    channel: NotificationChannel,
    provider: string,
    body: any,
    signature?: string,
    secret?: string
  ): Promise<{ processed: number; errors: string[] }> {
    const channelHandlers = this.handlers.get(channel) || [];

    // Buscar el handler específico del provider
    const handler = channelHandlers.find((h) => h.providerName === provider);

    if (!handler) {
      throw new Error(
        `No webhook handler found for provider: ${provider} in channel: ${channel}`
      );
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
      `Webhook processed: ${channel}/${provider} - ${processed}/${payloads.length} events`
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
    await this.eventBus.publish(`bookly.notifications.${payload.channel}`, {
      eventId: `webhook-${payload.messageId}-${Date.now()}`,
      eventType: `notification.${payload.eventType}`,
      service: "notifications",
      timestamp: new Date(),
      data: payload,
    });
  }

  /**
   * Obtener handlers registrados por canal
   */
  getHandlersByChannel(channel: NotificationChannel): string[] {
    const channelHandlers = this.handlers.get(channel) || [];
    return channelHandlers.map((h) => h.providerName);
  }

  /**
   * Obtener todos los canales con handlers
   */
  getAvailableChannels(): NotificationChannel[] {
    return Array.from(this.handlers.keys()).filter(
      (channel) => this.handlers.get(channel)!.length > 0
    ) as NotificationChannel[];
  }

  /**
   * Verificar si un provider tiene handler en un canal
   */
  hasHandler(channel: NotificationChannel, provider: string): boolean {
    const channelHandlers = this.handlers.get(channel) || [];
    return channelHandlers.some((h) => h.providerName === provider);
  }
}
