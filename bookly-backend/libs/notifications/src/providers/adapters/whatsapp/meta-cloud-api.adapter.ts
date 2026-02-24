import { NotificationChannel } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { WhatsAppProviderType } from "../../../enums/notification.enum";
import {
  NotificationPayload,
  NotificationResult,
} from "../../../interfaces/notification.interface";
import { IWhatsAppAdapter } from "./base-whatsapp.adapter";

const logger = createLogger("MetaCloudApiAdapter");

/**
 * Meta Cloud API WhatsApp Adapter
 * Adapter para envío de mensajes de WhatsApp usando Meta Cloud API (oficial)
 */
@Injectable()
export class MetaCloudApiAdapter implements IWhatsAppAdapter {
  private readonly apiUrl: string = "https://graph.facebook.com/v18.0";

  constructor(private readonly config: Record<string, any>) {
    logger.info("Meta Cloud API WhatsApp adapter initialized");
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      // TODO: Implementar envío real con Meta Cloud API
      logger.info("Sending WhatsApp via Meta Cloud API", {
        to: payload.to,
        phoneNumberId: this.config.phoneNumberId,
      });

      // Simulación de envío
      return {
        success: true,
        channel: NotificationChannel.WHATSAPP,
        messageId: `meta-wa-${Date.now()}`,
        provider: WhatsAppProviderType.META_CLOUD_API,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error("Error sending WhatsApp via Meta Cloud API", error);
      return {
        success: false,
        channel: NotificationChannel.WHATSAPP,
        error: error instanceof Error ? error.message : String(error),
        provider: WhatsAppProviderType.META_CLOUD_API,
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
    return !!this.config.accessToken && !!this.config.phoneNumberId;
  }

  getProviderInfo() {
    return {
      type: WhatsAppProviderType.META_CLOUD_API,
      name: "Meta Cloud API (WhatsApp Business)",
      version: "v18.0",
    };
  }
}
