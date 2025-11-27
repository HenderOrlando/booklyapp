import { NotificationChannel } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";
import { WebhookEventType } from "../../enums/notification.enum";
import { IWebhookHandler, WebhookPayload } from "../webhook.interface";

/**
 * Meta WhatsApp API Webhook Handler
 * Maneja webhooks de Meta WhatsApp Cloud API para confirmaciones de mensajes
 */
@Injectable()
export class MetaWhatsAppWebhookHandler implements IWebhookHandler {
  readonly providerName = "meta_whatsapp";
  private readonly logger = createLogger("MetaWhatsAppWebhookHandler");

  /**
   * Verificar firma del webhook de Meta WhatsApp
   * Meta usa SHA-256 con el App Secret
   */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    try {
      // Meta envía la firma en formato: sha256=<hash>
      const expectedSignature = `sha256=${crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("hex")}`;

      return signature === expectedSignature;
    } catch (error) {
      this.logger.error("Error verifying Meta WhatsApp signature", error);
      return false;
    }
  }

  /**
   * Parsear payload de Meta WhatsApp Cloud API
   */
  parsePayload(body: any): WebhookPayload[] {
    const payloads: WebhookPayload[] = [];

    try {
      // Meta WhatsApp estructura: { object: 'whatsapp_business_account', entry: [...] }
      if (body.object !== "whatsapp_business_account" || !body.entry) {
        this.logger.warn("Invalid Meta WhatsApp webhook structure");
        return [];
      }

      for (const entry of body.entry) {
        if (!entry.changes) continue;

        for (const change of entry.changes) {
          if (change.field !== "messages") continue;

          const value = change.value;

          // Procesar mensajes de estado
          if (value.statuses) {
            for (const status of value.statuses) {
              payloads.push({
                provider: this.providerName,
                channel: NotificationChannel.WHATSAPP,
                eventType: this.mapMetaStatus(status.status),
                messageId: status.id,
                recipient: status.recipient_id,
                timestamp: new Date(parseInt(status.timestamp) * 1000),
                metadata: {
                  status: status.status,
                  conversation: status.conversation,
                  pricing: status.pricing,
                  errors: status.errors,
                },
                error: status.errors?.[0]?.title,
              });
            }
          }

          // Procesar mensajes entrantes (para confirmar recepción)
          if (value.messages) {
            for (const message of value.messages) {
              payloads.push({
                provider: this.providerName,
                channel: NotificationChannel.WHATSAPP,
                eventType: WebhookEventType.DELIVERED,
                messageId: message.id,
                recipient: message.from,
                timestamp: new Date(parseInt(message.timestamp) * 1000),
                metadata: {
                  type: message.type,
                  text: message.text?.body,
                  context: message.context,
                },
              });
            }
          }
        }
      }
    } catch (error) {
      this.logger.error("Error parsing Meta WhatsApp webhook payload", error);
    }

    return payloads;
  }

  /**
   * Procesar evento de Meta WhatsApp
   */
  async handleEvent(payload: WebhookPayload): Promise<void> {
    this.logger.info(`Meta WhatsApp webhook event: ${payload.eventType}`, {
      messageId: payload.messageId,
      recipient: payload.recipient,
    });

    // TODO: Actualizar estado en base de datos
    // TODO: Publicar evento en Event Bus
    // TODO: Actualizar métricas
  }

  /**
   * Mapear estados de Meta WhatsApp a tipos estándar
   */
  private mapMetaStatus(status: string): WebhookEventType {
    const mapping: Record<string, WebhookEventType> = {
      sent: WebhookEventType.DELIVERED,
      delivered: WebhookEventType.DELIVERED,
      read: WebhookEventType.OPENED,
      failed: WebhookEventType.FAILED,
      deleted: WebhookEventType.FAILED,
    };

    return mapping[status] || WebhookEventType.FAILED;
  }

  /**
   * Verificar webhook de Meta (challenge inicial)
   */
  verifyWebhook(
    mode: string,
    token: string,
    challenge: string,
    verifyToken: string
  ): string | null {
    // Meta envía un challenge durante la configuración inicial
    if (mode === "subscribe" && token === verifyToken) {
      this.logger.info("Meta WhatsApp webhook verified successfully");
      return challenge;
    }

    this.logger.warn("Meta WhatsApp webhook verification failed");
    return null;
  }
}
