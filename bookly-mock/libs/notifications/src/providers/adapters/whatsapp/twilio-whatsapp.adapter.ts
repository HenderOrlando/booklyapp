import { NotificationChannel } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { WhatsAppProviderType } from "../../../enums/notification.enum";
import {
  NotificationPayload,
  NotificationResult,
} from "../../../interfaces/notification.interface";
import { IWhatsAppAdapter } from "./base-whatsapp.adapter";

const logger = createLogger("TwilioWhatsAppAdapter");

/**
 * Twilio WhatsApp Adapter
 * Adapter para envío de mensajes de WhatsApp usando Twilio
 */
@Injectable()
export class TwilioWhatsAppAdapter implements IWhatsAppAdapter {
  private client: any = null;

  constructor(private readonly config: Record<string, any>) {
    this.initializeClient();
  }

  private async initializeClient(): Promise<void> {
    try {
      // TODO: Inicializar cliente de Twilio
      // const twilio = require('twilio');
      // this.client = twilio(this.config.accountSid, this.config.authToken);
      logger.info("Twilio WhatsApp client initialized");
    } catch (error) {
      logger.error("Failed to initialize Twilio WhatsApp", error);
    }
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      // TODO: Implementar envío real con Twilio WhatsApp
      logger.info("Sending WhatsApp via Twilio", {
        to: payload.to,
        from: this.config.from,
      });

      // Simulación de envío
      return {
        success: true,
        channel: NotificationChannel.WHATSAPP,
        messageId: `twilio-wa-${Date.now()}`,
        provider: WhatsAppProviderType.TWILIO,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error("Error sending WhatsApp via Twilio", error);
      return {
        success: false,
        channel: NotificationChannel.WHATSAPP,
        error: error instanceof Error ? error.message : String(error),
        provider: WhatsAppProviderType.TWILIO,
        timestamp: new Date(),
      };
    }
  }

  validateRecipient(recipient: string): boolean {
    // WhatsApp usa formato E.164: +[country code][number]
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(recipient);
  }

  async isAvailable(): Promise<boolean> {
    return (
      this.client !== null &&
      !!this.config.accountSid &&
      !!this.config.authToken
    );
  }

  getProviderInfo() {
    return {
      type: WhatsAppProviderType.TWILIO,
      name: "Twilio WhatsApp",
      version: "4.0.0",
    };
  }
}
