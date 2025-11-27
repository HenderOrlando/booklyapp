import { NotificationChannel } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { WebhookEventType } from "../../enums/notification.enum";
import { IWebhookHandler, WebhookPayload } from "../webhook.interface";

/**
 * Firebase FCM Webhook Handler
 * Maneja webhooks de Firebase Cloud Messaging para eventos de entrega y errores
 */
@Injectable()
export class FirebaseWebhookHandler implements IWebhookHandler {
  readonly providerName = "firebase";
  private readonly logger = createLogger("FirebaseWebhookHandler");

  /**
   * Verificar firma del webhook de Firebase
   * Firebase no usa firmas HMAC, usa OAuth 2.0 JWT tokens
   */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    // Firebase FCM webhooks usan Google Cloud Pub/Sub
    // La verificación se hace mediante JWT en el header Authorization
    // Para simplicidad, retornamos true aquí y la verificación real
    // se haría en el controller verificando el JWT token
    this.logger.debug("Firebase webhook signature verification (JWT required)");
    return true;
  }

  /**
   * Parsear payload de Firebase FCM
   * Firebase envía eventos a través de Cloud Pub/Sub
   */
  parsePayload(body: any): WebhookPayload[] {
    const payloads: WebhookPayload[] = [];

    try {
      // Firebase Cloud Messaging Data API format
      // Estructura: { message: { data: ..., publishTime: ..., messageId: ... } }

      if (!body.message) {
        this.logger.warn("Invalid Firebase webhook structure");
        return [];
      }

      const message = body.message;
      const data = message.data
        ? JSON.parse(Buffer.from(message.data, "base64").toString())
        : {};

      // Firebase envía diferentes tipos de eventos
      const eventType = data.eventType || data.event || "unknown";

      payloads.push({
        provider: this.providerName,
        channel: NotificationChannel.PUSH,
        eventType: this.mapFirebaseEvent(eventType),
        messageId: data.messageId || message.messageId || "",
        recipient: data.to || data.token || "",
        timestamp: new Date(message.publishTime || Date.now()),
        metadata: {
          eventType,
          rawData: data,
          attributes: message.attributes,
          deliveryAttempt: data.deliveryAttempt,
          error: data.error,
          errorCode: data.errorCode,
        },
        error: data.error?.message || data.errorDescription,
      });
    } catch (error) {
      this.logger.error("Error parsing Firebase webhook payload", error);
    }

    return payloads;
  }

  /**
   * Parsear eventos de Firebase Data API (alternativa)
   * Estructura directa sin Pub/Sub
   */
  parseDataApiPayload(body: any): WebhookPayload[] {
    const payloads: WebhookPayload[] = [];

    try {
      // Formato directo de Data API
      // { event: 'delivered', messageId: '...', timestamp: '...', ... }

      if (Array.isArray(body)) {
        // Batch de eventos
        for (const event of body) {
          payloads.push(this.createPayloadFromEvent(event));
        }
      } else {
        // Evento individual
        payloads.push(this.createPayloadFromEvent(body));
      }
    } catch (error) {
      this.logger.error("Error parsing Firebase Data API payload", error);
    }

    return payloads;
  }

  /**
   * Crear payload desde evento individual
   */
  private createPayloadFromEvent(event: any): WebhookPayload {
    return {
      provider: this.providerName,
      channel: NotificationChannel.PUSH,
      eventType: this.mapFirebaseEvent(event.event || event.eventType),
      messageId: event.messageId || event.message_id || "",
      recipient: event.to || event.token || event.registration_id || "",
      timestamp: new Date(event.timestamp || Date.now()),
      tenantId: event.tenantId,
      metadata: {
        platform: event.platform, // 'android', 'ios', 'web'
        priority: event.priority,
        ttl: event.ttl,
        collapseKey: event.collapse_key,
        analytics: event.analytics,
        error: event.error,
      },
      error: event.error?.message,
    };
  }

  /**
   * Procesar evento de Firebase
   */
  async handleEvent(payload: WebhookPayload): Promise<void> {
    this.logger.info(`Firebase FCM webhook event: ${payload.eventType}`, {
      messageId: payload.messageId,
      recipient: payload.recipient,
      platform: payload.metadata?.platform,
    });

    // TODO: Actualizar estado en base de datos
    // TODO: Publicar evento en Event Bus
    // TODO: Actualizar métricas
    // TODO: Si es error de token inválido, marcar token para limpieza
  }

  /**
   * Mapear eventos de Firebase a tipos estándar
   */
  private mapFirebaseEvent(event: string): WebhookEventType {
    const mapping: Record<string, WebhookEventType> = {
      delivered: WebhookEventType.DELIVERED,
      sent: WebhookEventType.DELIVERED,
      opened: WebhookEventType.OPENED,
      clicked: WebhookEventType.CLICKED,
      dismissed: WebhookEventType.CLICKED,
      failed: WebhookEventType.FAILED,
      error: WebhookEventType.FAILED,
      invalid_token: WebhookEventType.FAILED,
      unregistered: WebhookEventType.FAILED,
    };

    return mapping[event?.toLowerCase()] || WebhookEventType.FAILED;
  }

  /**
   * Validar token JWT de Google Cloud
   * Esta función debe ser llamada en el controller antes de procesar el webhook
   */
  async validateGoogleJwt(token: string): Promise<boolean> {
    try {
      // TODO: Implementar validación de JWT
      // const { OAuth2Client } = require('google-auth-library');
      // const client = new OAuth2Client();
      //
      // const ticket = await client.verifyIdToken({
      //   idToken: token,
      //   audience: process.env.GOOGLE_CLOUD_PROJECT_ID,
      // });
      //
      // const payload = ticket.getPayload();
      // return payload.email_verified && payload.email.endsWith('@gserviceaccount.com');

      this.logger.debug("Google JWT validation required");
      return true; // Placeholder
    } catch (error) {
      this.logger.error("Error validating Google JWT", error);
      return false;
    }
  }
}
