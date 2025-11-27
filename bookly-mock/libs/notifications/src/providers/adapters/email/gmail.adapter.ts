import { NotificationChannel } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { EmailProviderType } from "../../../enums/notification.enum";
import {
  NotificationPayload,
  NotificationResult,
} from "../../../interfaces/notification.interface";
import { IEmailAdapter } from "./base-email.adapter";

const logger = createLogger("GmailAdapter");

/**
 * Gmail Adapter
 * Adapter para envío de emails usando Gmail API (OAuth2)
 */
@Injectable()
export class GmailAdapter implements IEmailAdapter {
  private client: any = null;

  constructor(private readonly config: Record<string, any>) {
    this.initializeClient();
  }

  private async initializeClient(): Promise<void> {
    try {
      // TODO: Inicializar cliente de Gmail API
      // const { google } = require('googleapis');
      // const oauth2Client = new google.auth.OAuth2(
      //   this.config.clientId,
      //   this.config.clientSecret,
      //   this.config.redirectUri
      // );
      // oauth2Client.setCredentials({
      //   refresh_token: this.config.refreshToken,
      // });
      // this.client = google.gmail({ version: 'v1', auth: oauth2Client });
      logger.info("Gmail client initialized");
    } catch (error) {
      logger.error("Failed to initialize Gmail", error);
    }
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      // TODO: Implementar envío real con Gmail API
      // const message = [
      //   `To: ${Array.isArray(payload.to) ? payload.to.join(',') : payload.to}`,
      //   `Subject: ${payload.subject || 'Notificación'}`,
      //   'Content-Type: text/html; charset=utf-8',
      //   '',
      //   payload.message,
      // ].join('\n');
      //
      // const encodedMessage = Buffer.from(message)
      //   .toString('base64')
      //   .replace(/\+/g, '-')
      //   .replace(/\//g, '_')
      //   .replace(/=+$/, '');
      //
      // const response = await this.client.users.messages.send({
      //   userId: 'me',
      //   requestBody: {
      //     raw: encodedMessage,
      //   },
      // });

      logger.info("Sending email via Gmail", {
        to: payload.to,
        subject: payload.subject,
      });

      // Simulación de envío
      return {
        success: true,
        channel: NotificationChannel.EMAIL,
        messageId: `gmail-${Date.now()}`,
        provider: EmailProviderType.GMAIL,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error("Error sending email via Gmail", error);
      return {
        success: false,
        channel: NotificationChannel.EMAIL,
        error: error instanceof Error ? error.message : String(error),
        provider: EmailProviderType.GMAIL,
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
      !!this.config.clientId &&
      !!this.config.clientSecret &&
      !!this.config.refreshToken
    );
  }

  getProviderInfo() {
    return {
      type: EmailProviderType.GMAIL,
      name: "Gmail API (OAuth2)",
      version: "v1",
    };
  }
}
