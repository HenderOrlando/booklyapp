import { NotificationChannel } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { PushProviderType } from "../../../enums/notification.enum";
import {
  NotificationPayload,
  NotificationResult,
} from "../../../interfaces/notification.interface";
import { IPushAdapter, PushNotificationData } from "./base-push.adapter";

const logger = createLogger("ExpoPushAdapter");

/**
 * Expo Push Adapter
 * Adapter para envío de push notifications usando Expo Push Notifications
 */
@Injectable()
export class ExpoPushAdapter implements IPushAdapter {
  private readonly expoApiUrl = "https://exp.host/--/api/v2/push/send";
  private readonly maxBatchSize = 100;

  constructor(private readonly config: Record<string, any>) {}

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      const tokens = Array.isArray(payload.to) ? payload.to : [payload.to];

      // Validar tokens de Expo
      const validTokens = tokens.filter((token) => this.validateToken(token));

      if (validTokens.length === 0) {
        throw new Error("No valid Expo push tokens provided");
      }

      const messages = validTokens.map((token) => ({
        to: token,
        title: payload.subject || "Notification",
        body: payload.message,
        data: payload.data || {},
        sound: "default",
        priority: "high",
      }));

      logger.info("Sending push via Expo", {
        tokens: validTokens.length,
        title: payload.subject,
      });

      // TODO: Implementar envío real con Expo Push API
      // const response = await fetch(this.expoApiUrl, {
      //   method: 'POST',
      //   headers: {
      //     'Accept': 'application/json',
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(messages),
      // });

      return {
        success: true,
        channel: NotificationChannel.PUSH,
        messageId: `expo-${Date.now()}`,
        provider: PushProviderType.EXPO,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error("Error sending push via Expo", error);
      return {
        success: false,
        channel: NotificationChannel.PUSH,
        error: error instanceof Error ? error.message : String(error),
        provider: PushProviderType.EXPO,
        timestamp: new Date(),
      };
    }
  }

  async sendMulticast(
    tokens: string[],
    notification: PushNotificationData
  ): Promise<NotificationResult> {
    try {
      // Validar tokens
      const validTokens = tokens.filter((token) => this.validateToken(token));

      if (validTokens.length === 0) {
        throw new Error("No valid Expo push tokens provided");
      }

      // Dividir en batches (Expo tiene límite de 100 notificaciones por request)
      const batches = this.chunkArray(validTokens, this.maxBatchSize);

      logger.info(
        `Sending multicast to ${validTokens.length} tokens via Expo in ${batches.length} batches`
      );

      const messages = validTokens.map((token) => ({
        to: token,
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
        sound: notification.sound || "default",
        badge: notification.badge,
        priority: notification.priority || "high",
        ttl: notification.ttl,
      }));

      // TODO: Enviar batches en paralelo

      return {
        success: true,
        channel: NotificationChannel.PUSH,
        messageId: `expo-multicast-${Date.now()}`,
        provider: PushProviderType.EXPO,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error("Error sending multicast via Expo", error);
      return {
        success: false,
        channel: NotificationChannel.PUSH,
        error: error instanceof Error ? error.message : String(error),
        provider: PushProviderType.EXPO,
        timestamp: new Date(),
      };
    }
  }

  async sendToTopic(
    topic: string,
    notification: PushNotificationData
  ): Promise<NotificationResult> {
    // Expo no soporta topics nativamente
    // Se debe implementar mediante almacenamiento de tokens por topic en DB
    logger.warn(
      "Expo does not support topics natively. Implement token storage by topic."
    );

    return {
      success: false,
      channel: NotificationChannel.PUSH,
      error: "Topic sending not supported for Expo. Use token-based sending.",
      provider: PushProviderType.EXPO,
      timestamp: new Date(),
    };
  }

  async subscribeToTopic(tokens: string[], topic: string): Promise<boolean> {
    // Expo no tiene soporte nativo de topics
    logger.warn(
      "Expo does not support topics. Implement custom topic management."
    );
    return false;
  }

  async unsubscribeFromTopic(
    tokens: string[],
    topic: string
  ): Promise<boolean> {
    logger.warn(
      "Expo does not support topics. Implement custom topic management."
    );
    return false;
  }

  validateToken(token: string): boolean {
    // Expo push tokens tienen formato: ExponentPushToken[...]
    // O también pueden ser tokens de FCM/APNS que Expo acepta
    if (token.startsWith("ExponentPushToken[")) {
      return token.endsWith("]") && token.length > 20;
    }

    // También acepta tokens de FCM (Android)
    if (token.length > 50 && /^[a-zA-Z0-9_-]+$/.test(token)) {
      return true;
    }

    // Y tokens de APNS (iOS) en formato hexadecimal
    if (token.length === 64 && /^[a-f0-9]+$/i.test(token)) {
      return true;
    }

    return false;
  }

  async isAvailable(): Promise<boolean> {
    // Expo siempre está disponible si hay conexión a internet
    return true;
  }

  getProviderInfo() {
    return {
      type: PushProviderType.EXPO,
      name: "Expo Push Notifications",
      version: "1.0.0",
    };
  }

  /**
   * Dividir array en chunks
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}
