import { NotificationChannel } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";
import { WebhookEventType } from "../../enums/notification.enum";
import { IWebhookHandler, WebhookPayload } from "../webhook.interface";

/**
 * Twilio Webhook Handler
 * Maneja webhooks de Twilio para SMS y WhatsApp
 */
@Injectable()
export class TwilioWebhookHandler implements IWebhookHandler {
  readonly providerName = "twilio";
  private readonly logger = createLogger("TwilioWebhookHandler");

  /**
   * Verificar firma del webhook de Twilio
   */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac("sha1", secret)
        .update(Buffer.from(payload, "utf-8"))
        .digest("base64");

      return signature === expectedSignature;
    } catch (error) {
      this.logger.error("Error verifying Twilio signature", error);
      return false;
    }
  }

  /**
   * Parsear payload de Twilio
   */
  parsePayload(body: any): WebhookPayload[] {
    const channel = this.detectChannel(body);

    return [
      {
        provider: this.providerName,
        channel,
        eventType: this.mapTwilioStatus(body.MessageStatus || body.SmsStatus),
        messageId: body.MessageSid || body.SmsSid,
        recipient: body.To,
        timestamp: new Date(),
        metadata: {
          from: body.From,
          status: body.MessageStatus || body.SmsStatus,
          errorCode: body.ErrorCode,
          errorMessage: body.ErrorMessage,
          price: body.Price,
          priceUnit: body.PriceUnit,
        },
        error: body.ErrorMessage,
      },
    ];
  }

  /**
   * Procesar evento de Twilio
   */
  async handleEvent(payload: WebhookPayload): Promise<void> {
    this.logger.info(
      `Twilio webhook event: ${payload.channel} - ${payload.eventType}`,
      {
        messageId: payload.messageId,
        recipient: payload.recipient,
      }
    );

    // TODO: Actualizar estado en base de datos
    // TODO: Publicar evento en Event Bus
    // TODO: Actualizar métricas
  }

  /**
   * Detectar canal (SMS o WhatsApp)
   */
  private detectChannel(body: any): NotificationChannel {
    const from = body.From || "";
    if (from.startsWith("whatsapp:")) {
      return NotificationChannel.WHATSAPP;
    }
    return NotificationChannel.SMS;
  }

  /**
   * Mapear estados de Twilio a tipos estándar
   */
  private mapTwilioStatus(status: string): WebhookEventType {
    const mapping: Record<string, WebhookEventType> = {
      delivered: WebhookEventType.DELIVERED,
      sent: WebhookEventType.DELIVERED,
      read: WebhookEventType.OPENED,
      failed: WebhookEventType.FAILED,
      undelivered: WebhookEventType.FAILED,
    };

    return mapping[status?.toLowerCase()] || WebhookEventType.FAILED;
  }
}
