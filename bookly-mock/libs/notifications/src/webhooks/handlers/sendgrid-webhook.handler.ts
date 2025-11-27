import { NotificationChannel } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import * as crypto from "crypto";
import { WebhookEventType } from "../../enums/notification.enum";
import { IWebhookHandler, WebhookPayload } from "../webhook.interface";

/**
 * SendGrid Webhook Handler
 * Maneja webhooks de SendGrid para confirmaciones de email
 */
@Injectable()
export class SendGridWebhookHandler implements IWebhookHandler {
  readonly providerName = "sendgrid";
  private readonly logger = createLogger("SendGridWebhookHandler");

  /**
   * Verificar firma del webhook de SendGrid
   */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(payload)
        .digest("base64");

      return signature === expectedSignature;
    } catch (error) {
      this.logger.error("Error verifying SendGrid signature", error);
      return false;
    }
  }

  /**
   * Parsear payload de SendGrid
   */
  parsePayload(body: any): WebhookPayload[] {
    if (!Array.isArray(body)) {
      return [];
    }

    return body.map((event) => ({
      provider: this.providerName,
      channel: NotificationChannel.EMAIL,
      eventType: this.mapSendGridEvent(event.event),
      messageId: event.sg_message_id || event["smtp-id"],
      recipient: event.email,
      timestamp: new Date(event.timestamp * 1000),
      metadata: {
        category: event.category,
        reason: event.reason,
        response: event.response,
        url: event.url,
        useragent: event.useragent,
        ip: event.ip,
      },
      error: event.reason || event.response,
    }));
  }

  /**
   * Procesar evento de SendGrid
   */
  async handleEvent(payload: WebhookPayload): Promise<void> {
    this.logger.info(`SendGrid webhook event: ${payload.eventType}`, {
      messageId: payload.messageId,
      recipient: payload.recipient,
    });

    // TODO: Actualizar estado en base de datos
    // TODO: Publicar evento en Event Bus
    // TODO: Actualizar métricas
  }

  /**
   * Mapear eventos de SendGrid a tipos estándar
   */
  private mapSendGridEvent(event: string): WebhookEventType {
    const mapping: Record<string, WebhookEventType> = {
      delivered: WebhookEventType.DELIVERED,
      open: WebhookEventType.OPENED,
      click: WebhookEventType.CLICKED,
      bounce: WebhookEventType.BOUNCED,
      dropped: WebhookEventType.FAILED,
      deferred: WebhookEventType.FAILED,
      spamreport: WebhookEventType.COMPLAINED,
      unsubscribe: WebhookEventType.UNSUBSCRIBED,
      group_unsubscribe: WebhookEventType.UNSUBSCRIBED,
    };

    return mapping[event] || WebhookEventType.FAILED;
  }
}
