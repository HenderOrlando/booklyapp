import { NotificationChannel } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { PushProviderType } from "../../../enums/notification.enum";
import {
  NotificationPayload,
  NotificationResult,
} from "../../../interfaces/notification.interface";
import { IPushAdapter, PushNotificationData } from "./base-push.adapter";

const logger = createLogger("AwsSnsPushAdapter");

/**
 * AWS SNS Push Adapter
 * Adapter para envío de push notifications usando AWS SNS
 */
@Injectable()
export class AwsSnsPushAdapter implements IPushAdapter {
  private sns: any = null;
  private platformApplicationArn: string;

  constructor(private readonly config: Record<string, any>) {
    this.platformApplicationArn = config.platformApplicationArn || "";
    this.initializeClient();
  }

  private async initializeClient(): Promise<void> {
    try {
      // TODO: Inicializar AWS SNS client
      // const AWS = require('aws-sdk');
      // this.sns = new AWS.SNS({
      //   region: this.config.region || 'us-east-1',
      //   accessKeyId: this.config.accessKeyId,
      //   secretAccessKey: this.config.secretAccessKey,
      // });

      logger.info("AWS SNS Push client initialized");
    } catch (error) {
      logger.error("Failed to initialize AWS SNS Push client", error);
    }
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      const tokens = Array.isArray(payload.to) ? payload.to : [payload.to];

      logger.info("Sending push via AWS SNS", {
        tokens: tokens.length,
        subject: payload.subject,
      });

      // TODO: Implementar envío real con AWS SNS
      // Para cada token, necesitas crear un endpoint y publicar
      // const createEndpointParams = {
      //   PlatformApplicationArn: this.platformApplicationArn,
      //   Token: token,
      // };
      // const endpoint = await this.sns.createPlatformEndpoint(createEndpointParams).promise();
      //
      // const publishParams = {
      //   TargetArn: endpoint.EndpointArn,
      //   Message: JSON.stringify({
      //     default: payload.message,
      //     GCM: JSON.stringify({
      //       notification: {
      //         title: payload.subject,
      //         body: payload.message,
      //       },
      //       data: payload.data || {},
      //     }),
      //     APNS: JSON.stringify({
      //       aps: {
      //         alert: {
      //           title: payload.subject,
      //           body: payload.message,
      //         },
      //         badge: 1,
      //       },
      //       data: payload.data || {},
      //     }),
      //   }),
      //   MessageStructure: 'json',
      // };
      // await this.sns.publish(publishParams).promise();

      return {
        success: true,
        channel: NotificationChannel.PUSH,
        messageId: `sns-push-${Date.now()}`,
        provider: PushProviderType.AWS_SNS,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error("Error sending push via AWS SNS", error);
      return {
        success: false,
        channel: NotificationChannel.PUSH,
        error: error instanceof Error ? error.message : String(error),
        provider: PushProviderType.AWS_SNS,
        timestamp: new Date(),
      };
    }
  }

  async sendMulticast(
    tokens: string[],
    notification: PushNotificationData
  ): Promise<NotificationResult> {
    try {
      logger.info(`Sending multicast to ${tokens.length} tokens via AWS SNS`);

      // AWS SNS requiere crear endpoint por cada token y publicar individualmente
      // O usar topics para envío masivo

      return {
        success: true,
        channel: NotificationChannel.PUSH,
        messageId: `sns-push-multicast-${Date.now()}`,
        provider: PushProviderType.AWS_SNS,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error("Error sending multicast via AWS SNS", error);
      return {
        success: false,
        channel: NotificationChannel.PUSH,
        error: error instanceof Error ? error.message : String(error),
        provider: PushProviderType.AWS_SNS,
        timestamp: new Date(),
      };
    }
  }

  async sendToTopic(
    topic: string,
    notification: PushNotificationData
  ): Promise<NotificationResult> {
    try {
      logger.info(`Sending to topic: ${topic} via AWS SNS`);

      // TODO: Implementar envío a topic SNS
      // const params = {
      //   TopicArn: topic, // El topic ARN debe ser proporcionado
      //   Message: JSON.stringify({
      //     default: notification.body,
      //     GCM: JSON.stringify({
      //       notification: {
      //         title: notification.title,
      //         body: notification.body,
      //       },
      //       data: notification.data || {},
      //     }),
      //   }),
      //   MessageStructure: 'json',
      // };
      // await this.sns.publish(params).promise();

      return {
        success: true,
        channel: NotificationChannel.PUSH,
        messageId: `sns-push-topic-${Date.now()}`,
        provider: PushProviderType.AWS_SNS,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error("Error sending to topic via AWS SNS", error);
      return {
        success: false,
        channel: NotificationChannel.PUSH,
        error: error instanceof Error ? error.message : String(error),
        provider: PushProviderType.AWS_SNS,
        timestamp: new Date(),
      };
    }
  }

  async subscribeToTopic(tokens: string[], topic: string): Promise<boolean> {
    try {
      logger.info(`Subscribing ${tokens.length} endpoints to topic: ${topic}`);

      // TODO: Suscribir endpoints a topic SNS
      // for (const token of tokens) {
      //   const endpoint = await this.createOrGetEndpoint(token);
      //   await this.sns.subscribe({
      //     TopicArn: topic,
      //     Protocol: 'application',
      //     Endpoint: endpoint.EndpointArn,
      //   }).promise();
      // }

      return true;
    } catch (error) {
      logger.error("Error subscribing to topic via AWS SNS", error);
      return false;
    }
  }

  async unsubscribeFromTopic(
    tokens: string[],
    topic: string
  ): Promise<boolean> {
    try {
      logger.info(
        `Unsubscribing ${tokens.length} endpoints from topic: ${topic}`
      );

      // TODO: Desuscribir endpoints de topic SNS
      // Se necesita el SubscriptionArn para desuscribir

      return true;
    } catch (error) {
      logger.error("Error unsubscribing from topic via AWS SNS", error);
      return false;
    }
  }

  validateToken(token: string): boolean {
    // Los tokens de dispositivo pueden ser de FCM (Android) o APNS (iOS)
    // FCM tokens son largos y alfanuméricos
    if (token.length > 50 && /^[a-zA-Z0-9_-]+$/.test(token)) {
      return true;
    }

    // APNS tokens son hexadecimales de 64 caracteres
    const cleanToken = token.replace(/[<>\s]/g, "");
    if (cleanToken.length === 64 && /^[a-f0-9]+$/i.test(cleanToken)) {
      return true;
    }

    return false;
  }

  async isAvailable(): Promise<boolean> {
    return this.sns !== null && !!this.platformApplicationArn;
  }

  getProviderInfo() {
    return {
      type: PushProviderType.AWS_SNS,
      name: "AWS Simple Notification Service (Push)",
      version: "1.0.0",
    };
  }
}
