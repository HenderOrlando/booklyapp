import { NotificationChannel } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import {
  NotificationPayload,
  NotificationResult,
} from "../../../interfaces/notification.interface";
import { EmailProviderType, IEmailAdapter } from "./base-email.adapter";

const logger = createLogger("AwsSesAdapter");

/**
 * AWS SES Email Adapter
 * Adapter para envío de emails usando AWS Simple Email Service
 */
@Injectable()
export class AwsSesAdapter implements IEmailAdapter {
  private client: any = null;

  constructor(private readonly config: Record<string, any>) {
    this.initializeClient();
  }

  private async initializeClient(): Promise<void> {
    try {
      // TODO: Inicializar cliente de AWS SES
      // const { SESClient } = require('@aws-sdk/client-ses');
      // this.client = new SESClient({
      //   region: this.config.region,
      //   credentials: {
      //     accessKeyId: this.config.accessKeyId,
      //     secretAccessKey: this.config.secretAccessKey,
      //   },
      // });
      logger.info("AWS SES client initialized");
    } catch (error) {
      logger.error("Failed to initialize AWS SES", error);
    }
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      // TODO: Implementar envío real con AWS SES
      // const { SendEmailCommand } = require('@aws-sdk/client-ses');
      // const command = new SendEmailCommand({
      //   Source: this.config.from,
      //   Destination: {
      //     ToAddresses: Array.isArray(payload.to) ? payload.to : [payload.to],
      //   },
      //   Message: {
      //     Subject: { Data: payload.subject || 'Notificación' },
      //     Body: {
      //       Html: { Data: payload.message },
      //     },
      //   },
      // });
      // const response = await this.client.send(command);

      logger.info("Sending email via AWS SES", {
        to: payload.to,
        subject: payload.subject,
      });

      // Simulación de envío
      return {
        success: true,
        channel: NotificationChannel.EMAIL,
        messageId: `ses-${Date.now()}`,
        provider: EmailProviderType.AWS_SES,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error("Error sending email via AWS SES", error);
      return {
        success: false,
        channel: NotificationChannel.EMAIL,
        error: error instanceof Error ? error.message : String(error),
        provider: EmailProviderType.AWS_SES,
        timestamp: new Date(),
      };
    }
  }

  validateRecipient(recipient: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(recipient);
  }

  async isAvailable(): Promise<boolean> {
    return (
      this.client !== null &&
      !!this.config.region &&
      !!this.config.accessKeyId &&
      !!this.config.secretAccessKey
    );
  }

  getProviderInfo() {
    return {
      type: EmailProviderType.AWS_SES,
      name: "AWS Simple Email Service",
      version: "v3",
    };
  }
}
