import { NotificationChannel } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { SmsProviderType } from "../../../enums/notification.enum";
import {
  NotificationPayload,
  NotificationResult,
} from "../../../interfaces/notification.interface";
import { ISmsAdapter } from "./base-sms.adapter";

const logger = createLogger("AwsSnsAdapter");

/**
 * AWS SNS SMS Adapter
 * Adapter para envío de SMS usando AWS SNS
 */
@Injectable()
export class AwsSnsAdapter implements ISmsAdapter {
  private client: any = null;

  constructor(private readonly config: Record<string, any>) {
    this.initializeClient();
  }

  private async initializeClient(): Promise<void> {
    try {
      // TODO: Inicializar cliente de AWS SNS
      // const AWS = require('aws-sdk');
      // this.client = new AWS.SNS({
      //   region: this.config.region,
      //   accessKeyId: this.config.accessKeyId,
      //   secretAccessKey: this.config.secretAccessKey,
      // });
      logger.info("AWS SNS client initialized");
    } catch (error) {
      logger.error("Failed to initialize AWS SNS", error);
    }
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      // TODO: Implementar envío real con AWS SNS
      logger.info("Sending SMS via AWS SNS", {
        to: payload.to,
      });

      // Simulación de envío
      return {
        success: true,
        channel: NotificationChannel.SMS,
        messageId: `aws-sns-${Date.now()}`,
        provider: SmsProviderType.AWS_SNS,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error("Error sending SMS via AWS SNS", error);
      return {
        success: false,
        channel: NotificationChannel.SMS,
        error: error instanceof Error ? error.message : String(error),
        provider: SmsProviderType.AWS_SNS,
        timestamp: new Date(),
      };
    }
  }

  validateRecipient(recipient: string): boolean {
    // E.164 format: +[country code][number]
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(recipient);
  }

  async isAvailable(): Promise<boolean> {
    return this.client !== null && !!this.config.region;
  }

  getProviderInfo() {
    return {
      type: SmsProviderType.AWS_SNS,
      name: "AWS SNS",
      version: "2.x",
    };
  }
}
