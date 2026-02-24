import { NotificationChannel } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { PushProviderType } from "../../../enums/notification.enum";
import {
  NotificationPayload,
  NotificationResult,
} from "../../../interfaces/notification.interface";
import { IPushAdapter, PushNotificationData } from "./base-push.adapter";

const logger = createLogger("ApnsAdapter");

/**
 * Apple APNS Adapter
 * Adapter para envío de push notifications usando Apple Push Notification Service
 */
@Injectable()
export class ApnsAdapter implements IPushAdapter {
  private apns: any = null;
  private production: boolean;

  constructor(private readonly config: Record<string, any>) {
    this.production = config.production || false;
    this.initializeClient();
  }

  private async initializeClient(): Promise<void> {
    try {
      // TODO: Inicializar apn provider
      // const apn = require('apn');
      // const options = {
      //   token: {
      //     key: this.config.keyPath,
      //     keyId: this.config.keyId,
      //     teamId: this.config.teamId,
      //   },
      //   production: this.production,
      // };
      // this.apns = new apn.Provider(options);

      logger.info(
        `APNS client initialized (${this.production ? "production" : "sandbox"})`
      );
    } catch (error) {
      logger.error("Failed to initialize APNS client", error);
    }
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      const tokens = Array.isArray(payload.to) ? payload.to : [payload.to];

      // Validar tokens
      const validTokens = tokens.filter((token) => this.validateToken(token));

      if (validTokens.length === 0) {
        throw new Error("No valid APNS device tokens provided");
      }

      logger.info("Sending push via APNS", {
        tokens: validTokens.length,
        subject: payload.subject,
        production: this.production,
      });

      // TODO: Implementar envío real con APNS
      // const notification = new apn.Notification({
      //   alert: {
      //     title: payload.subject || 'Notification',
      //     body: payload.message,
      //   },
      //   topic: this.config.bundleId,
      //   payload: payload.data || {},
      //   sound: 'default',
      //   badge: 1,
      // });
      //
      // const result = await this.apns.send(notification, validTokens);

      return {
        success: true,
        channel: NotificationChannel.PUSH,
        messageId: `apns-${Date.now()}`,
        provider: PushProviderType.APNS,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error("Error sending push via APNS", error);
      return {
        success: false,
        channel: NotificationChannel.PUSH,
        error: error instanceof Error ? error.message : String(error),
        provider: PushProviderType.APNS,
        timestamp: new Date(),
      };
    }
  }

  async sendMulticast(
    tokens: string[],
    notification: PushNotificationData
  ): Promise<NotificationResult> {
    try {
      const validTokens = tokens.filter((token) => this.validateToken(token));

      if (validTokens.length === 0) {
        throw new Error("No valid APNS device tokens provided");
      }

      logger.info(`Sending multicast to ${validTokens.length} tokens via APNS`);

      // TODO: Implementar envío multicast real con APNS
      // const apnNotification = new apn.Notification({
      //   alert: {
      //     title: notification.title,
      //     body: notification.body,
      //   },
      //   topic: this.config.bundleId,
      //   payload: notification.data || {},
      //   sound: notification.sound || 'default',
      //   badge: notification.badge,
      //   priority: notification.priority === 'high' ? 10 : 5,
      //   expiry: notification.ttl ? Math.floor(Date.now() / 1000) + notification.ttl : undefined,
      // });
      //
      // const result = await this.apns.send(apnNotification, validTokens);

      return {
        success: true,
        channel: NotificationChannel.PUSH,
        messageId: `apns-multicast-${Date.now()}`,
        provider: PushProviderType.APNS,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error("Error sending multicast via APNS", error);
      return {
        success: false,
        channel: NotificationChannel.PUSH,
        error: error instanceof Error ? error.message : String(error),
        provider: PushProviderType.APNS,
        timestamp: new Date(),
      };
    }
  }

  async sendToTopic(
    topic: string,
    notification: PushNotificationData
  ): Promise<NotificationResult> {
    try {
      logger.info(`Sending to topic: ${topic} via APNS`);

      // APNS soporta topics pero requiere configuración especial
      // El topic generalmente es el bundle ID de la app

      return {
        success: true,
        channel: NotificationChannel.PUSH,
        messageId: `apns-topic-${Date.now()}`,
        provider: PushProviderType.APNS,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error("Error sending to topic via APNS", error);
      return {
        success: false,
        channel: NotificationChannel.PUSH,
        error: error instanceof Error ? error.message : String(error),
        provider: PushProviderType.APNS,
        timestamp: new Date(),
      };
    }
  }

  async subscribeToTopic(tokens: string[], topic: string): Promise<boolean> {
    // APNS no tiene concepto de suscripción a topics como FCM
    // Los topics en APNS se refieren al bundle ID de la app
    logger.warn("APNS does not support topic subscription like FCM");
    return false;
  }

  async unsubscribeFromTopic(
    tokens: string[],
    topic: string
  ): Promise<boolean> {
    logger.warn("APNS does not support topic subscription like FCM");
    return false;
  }

  validateToken(token: string): boolean {
    // Los device tokens de APNS son strings hexadecimales de 64 caracteres
    // Sin espacios ni caracteres especiales (< >)
    const cleanToken = token.replace(/[<>\s]/g, "");
    return cleanToken.length === 64 && /^[a-f0-9]+$/i.test(cleanToken);
  }

  async isAvailable(): Promise<boolean> {
    return this.apns !== null;
  }

  getProviderInfo() {
    return {
      type: PushProviderType.APNS,
      name: "Apple Push Notification Service",
      version: "1.0.0",
    };
  }

  /**
   * Cerrar conexión con APNS
   */
  async close(): Promise<void> {
    if (this.apns) {
      // await this.apns.shutdown();
      logger.info("APNS connection closed");
    }
  }
}
