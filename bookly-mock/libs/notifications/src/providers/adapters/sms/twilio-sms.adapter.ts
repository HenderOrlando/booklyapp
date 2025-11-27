import { NotificationChannel } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { SmsProviderType } from "../../../enums/notification.enum";
import {
  NotificationPayload,
  NotificationResult,
} from "../../../interfaces/notification.interface";
import { ISmsAdapter } from "./base-sms.adapter";

const logger = createLogger("TwilioSmsAdapter");

/**
 * Twilio SMS Adapter
 * Adapter para envío de SMS usando Twilio
 */
@Injectable()
export class TwilioSmsAdapter implements ISmsAdapter {
  private client: any = null;

  constructor(private readonly config: Record<string, any>) {
    this.initializeClient();
  }

  private async initializeClient(): Promise<void> {
    try {
      // TODO: Inicializar cliente de Twilio
      // const twilio = require('twilio');
      // this.client = twilio(this.config.accountSid, this.config.authToken);
      logger.info("Twilio SMS client initialized");
    } catch (error) {
      logger.error("Failed to initialize Twilio SMS", error);
    }
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      // TODO: Implementar envío real con Twilio
      logger.info("Sending SMS via Twilio", {
        to: payload.to,
        from: this.config.from,
      });

      // Simulación de envío
      return {
        success: true,
        channel: NotificationChannel.SMS,
        messageId: `twilio-sms-${Date.now()}`,
        provider: SmsProviderType.TWILIO,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error("Error sending SMS via Twilio", error);
      return {
        success: false,
        channel: NotificationChannel.SMS,
        error: error instanceof Error ? error.message : String(error),
        provider: SmsProviderType.TWILIO,
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
    return (
      this.client !== null &&
      !!this.config.accountSid &&
      !!this.config.authToken
    );
  }

  getProviderInfo() {
    return {
      type: SmsProviderType.TWILIO,
      name: "Twilio SMS",
      version: "4.0.0",
    };
  }
}
