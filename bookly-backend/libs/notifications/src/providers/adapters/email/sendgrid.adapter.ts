import { NotificationChannel } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { EmailProviderType } from "../../../enums/notification.enum";
import {
  NotificationPayload,
  NotificationResult,
} from "../../../interfaces/notification.interface";
import { IEmailAdapter } from "./base-email.adapter";

const logger = createLogger("SendgridAdapter");

/**
 * SendGrid Email Adapter
 * Adapter para envío de emails usando SendGrid
 */
@Injectable()
export class SendgridAdapter implements IEmailAdapter {
  private client: any = null;

  constructor(private readonly config: Record<string, any>) {
    this.initializeClient();
  }

  private async initializeClient(): Promise<void> {
    try {
      // TODO: Inicializar cliente de SendGrid
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(this.config.apiKey);
      // this.client = sgMail;
      logger.info("SendGrid client initialized");
    } catch (error) {
      logger.error("Failed to initialize SendGrid", error);
    }
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      // TODO: Implementar envío real con SendGrid
      logger.info("Sending email via SendGrid", {
        to: payload.to,
        subject: payload.subject,
      });

      // Simulación de envío
      return {
        success: true,
        channel: NotificationChannel.EMAIL,
        messageId: `sendgrid-${Date.now()}`,
        provider: EmailProviderType.SENDGRID,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error("Error sending email via SendGrid", error);
      return {
        success: false,
        channel: NotificationChannel.EMAIL,
        error: error instanceof Error ? error.message : String(error),
        provider: EmailProviderType.SENDGRID,
        timestamp: new Date(),
      };
    }
  }

  validateRecipient(recipient: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(recipient);
  }

  async isAvailable(): Promise<boolean> {
    return this.client !== null && !!this.config.apiKey;
  }

  getProviderInfo() {
    return {
      type: EmailProviderType.SENDGRID,
      name: "SendGrid",
      version: "7.7.0",
    };
  }
}
