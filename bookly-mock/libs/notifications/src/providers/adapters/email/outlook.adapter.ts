import { NotificationChannel } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { EmailProviderType } from "../../../enums/notification.enum";
import {
  NotificationPayload,
  NotificationResult,
} from "../../../interfaces/notification.interface";
import { IEmailAdapter } from "./base-email.adapter";

const logger = createLogger("OutlookAdapter");

/**
 * Outlook Adapter
 * Adapter para envío de emails usando Microsoft Graph API (OAuth2)
 */
@Injectable()
export class OutlookAdapter implements IEmailAdapter {
  private client: any = null;

  constructor(private readonly config: Record<string, any>) {
    this.initializeClient();
  }

  private async initializeClient(): Promise<void> {
    try {
      // TODO: Inicializar cliente de Microsoft Graph
      // const { Client } = require('@microsoft/microsoft-graph-client');
      // const { ClientSecretCredential } = require('@azure/identity');
      //
      // const credential = new ClientSecretCredential(
      //   this.config.tenantId,
      //   this.config.clientId,
      //   this.config.clientSecret
      // );
      //
      // this.client = Client.initWithMiddleware({
      //   authProvider: {
      //     getAccessToken: async () => {
      //       const token = await credential.getToken('https://graph.microsoft.com/.default');
      //       return token.token;
      //     },
      //   },
      // });
      logger.info("Outlook client initialized");
    } catch (error) {
      logger.error("Failed to initialize Outlook", error);
    }
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      // TODO: Implementar envío real con Microsoft Graph API
      // const sendMail = {
      //   message: {
      //     subject: payload.subject || 'Notificación',
      //     body: {
      //       contentType: 'HTML',
      //       content: payload.message,
      //     },
      //     toRecipients: (Array.isArray(payload.to) ? payload.to : [payload.to]).map(
      //       (email) => ({
      //         emailAddress: {
      //           address: email,
      //         },
      //       })
      //     ),
      //   },
      //   saveToSentItems: true,
      // };
      //
      // await this.client.api('/me/sendMail').post(sendMail);

      logger.info("Sending email via Outlook", {
        to: payload.to,
        subject: payload.subject,
      });

      // Simulación de envío
      return {
        success: true,
        channel: NotificationChannel.EMAIL,
        messageId: `outlook-${Date.now()}`,
        provider: EmailProviderType.OUTLOOK,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error("Error sending email via Outlook", error);
      return {
        success: false,
        channel: NotificationChannel.EMAIL,
        error: error instanceof Error ? error.message : String(error),
        provider: EmailProviderType.OUTLOOK,
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
      !!this.config.tenantId
    );
  }

  getProviderInfo() {
    return {
      type: EmailProviderType.OUTLOOK,
      name: "Microsoft Outlook (Graph API)",
      version: "v1.0",
    };
  }
}
