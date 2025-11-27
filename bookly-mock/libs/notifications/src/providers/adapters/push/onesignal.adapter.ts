import { NotificationChannel } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { PushProviderType } from "../../../enums/notification.enum";
import {
  NotificationPayload,
  NotificationResult,
} from "../../../interfaces/notification.interface";
import { IPushAdapter, PushNotificationData } from "./base-push.adapter";

const logger = createLogger("OneSignalAdapter");

/**
 * OneSignal Push Adapter
 * Adapter para envío de push notifications usando OneSignal
 */
@Injectable()
export class OneSignalAdapter implements IPushAdapter {
  private apiKey: string;
  private appId: string;
  private apiUrl = "https://onesignal.com/api/v1";

  constructor(config: Record<string, any>) {
    this.apiKey = config.apiKey || "";
    this.appId = config.appId || "";

    if (!this.apiKey || !this.appId) {
      logger.warn("OneSignal API Key or App ID not configured");
    }
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      const tokens = Array.isArray(payload.to) ? payload.to : [payload.to];

      const requestBody = {
        app_id: this.appId,
        include_player_ids: tokens,
        headings: { en: payload.subject || "Notification" },
        contents: { en: payload.message },
        data: payload.data || {},
      };

      logger.info("Sending push via OneSignal", {
        tokens: tokens.length,
        subject: payload.subject,
      });

      // TODO: Implementar envío real con OneSignal REST API
      // const response = await fetch(`${this.apiUrl}/notifications`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Basic ${this.apiKey}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(requestBody),
      // });

      return {
        success: true,
        channel: NotificationChannel.PUSH,
        messageId: `onesignal-${Date.now()}`,
        provider: PushProviderType.ONESIGNAL,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error("Error sending push via OneSignal", error);
      return {
        success: false,
        channel: NotificationChannel.PUSH,
        error: error instanceof Error ? error.message : String(error),
        provider: PushProviderType.ONESIGNAL,
        timestamp: new Date(),
      };
    }
  }

  async sendMulticast(
    tokens: string[],
    notification: PushNotificationData
  ): Promise<NotificationResult> {
    try {
      const requestBody = {
        app_id: this.appId,
        include_player_ids: tokens,
        headings: { en: notification.title },
        contents: { en: notification.body },
        data: notification.data || {},
        priority: notification.priority === "high" ? 10 : 5,
        ttl: notification.ttl,
      };

      logger.info(`Sending multicast to ${tokens.length} tokens via OneSignal`);

      return {
        success: true,
        channel: NotificationChannel.PUSH,
        messageId: `onesignal-multicast-${Date.now()}`,
        provider: PushProviderType.ONESIGNAL,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error("Error sending multicast via OneSignal", error);
      return {
        success: false,
        channel: NotificationChannel.PUSH,
        error: error instanceof Error ? error.message : String(error),
        provider: PushProviderType.ONESIGNAL,
        timestamp: new Date(),
      };
    }
  }

  async sendToTopic(
    topic: string,
    notification: PushNotificationData
  ): Promise<NotificationResult> {
    try {
      const requestBody = {
        app_id: this.appId,
        included_segments: [topic],
        headings: { en: notification.title },
        contents: { en: notification.body },
        data: notification.data || {},
      };

      logger.info(`Sending to segment: ${topic} via OneSignal`);

      return {
        success: true,
        channel: NotificationChannel.PUSH,
        messageId: `onesignal-segment-${Date.now()}`,
        provider: PushProviderType.ONESIGNAL,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error("Error sending to segment via OneSignal", error);
      return {
        success: false,
        channel: NotificationChannel.PUSH,
        error: error instanceof Error ? error.message : String(error),
        provider: PushProviderType.ONESIGNAL,
        timestamp: new Date(),
      };
    }
  }

  async subscribeToTopic(tokens: string[], topic: string): Promise<boolean> {
    try {
      logger.info(`Subscribing ${tokens.length} players to segment: ${topic}`);
      // OneSignal usa tags/segments en lugar de topics tradicionales
      // Se debe usar la API de tags para esto
      return true;
    } catch (error) {
      logger.error("Error subscribing to segment via OneSignal", error);
      return false;
    }
  }

  async unsubscribeFromTopic(
    tokens: string[],
    topic: string
  ): Promise<boolean> {
    try {
      logger.info(
        `Unsubscribing ${tokens.length} players from segment: ${topic}`
      );
      return true;
    } catch (error) {
      logger.error("Error unsubscribing from segment via OneSignal", error);
      return false;
    }
  }

  validateToken(token: string): boolean {
    // OneSignal player IDs son UUIDs
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(token);
  }

  async isAvailable(): Promise<boolean> {
    return !!this.apiKey && !!this.appId;
  }

  getProviderInfo() {
    return {
      type: PushProviderType.ONESIGNAL,
      name: "OneSignal",
      version: "1.0.0",
    };
  }
}
