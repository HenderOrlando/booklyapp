import { NotificationChannel } from "@libs/common/enums";
import { WebhookEventType } from "../enums/notification.enum";

/**
 * Webhook Payload
 */
export interface WebhookPayload {
  provider: string;
  channel: NotificationChannel;
  eventType: WebhookEventType;
  messageId: string;
  tenantId?: string;
  recipient: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  error?: string;
}

/**
 * Webhook Handler Interface
 */
export interface IWebhookHandler {
  /**
   * Provider name (sendgrid, twilio, etc.)
   */
  readonly providerName: string;

  /**
   * Verificar firma del webhook
   */
  verifySignature(payload: string, signature: string, secret: string): boolean;

  /**
   * Parsear payload del webhook
   */
  parsePayload(body: any): WebhookPayload[];

  /**
   * Procesar evento del webhook
   */
  handleEvent(payload: WebhookPayload): Promise<void>;
}
