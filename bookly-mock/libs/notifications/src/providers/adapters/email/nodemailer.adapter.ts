import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { EmailProviderType } from "../../../enums/notification.enum";
import {
  NotificationPayload,
  NotificationResult,
} from "../../../interfaces/notification.interface";
import { IEmailAdapter } from "./base-email.adapter";

const logger = createLogger("NodemailerAdapter");

/**
 * Nodemailer Email Adapter
 * Adapter para envío de emails usando Nodemailer
 */
@Injectable()
export class NodemailerAdapter implements IEmailAdapter {
  private transporter: any = null;

  constructor(private readonly config: Record<string, any>) {
    this.initializeTransporter();
  }

  private async initializeTransporter(): Promise<void> {
    try {
      // TODO: Inicializar transporter de Nodemailer
      // const nodemailer = require('nodemailer');
      // this.transporter = nodemailer.createTransport(this.config);
      logger.info("Nodemailer transporter initialized");
    } catch (error) {
      logger.error("Failed to initialize Nodemailer", error);
    }
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      // TODO: Implementar envío real con Nodemailer
      logger.info("Sending email via Nodemailer", {
        to: payload.to,
        subject: payload.subject,
      });

      // Simulación de envío
      return {
        success: true,
        channel: "EMAIL" as any,
        messageId: `nodemailer-${Date.now()}`,
        provider: EmailProviderType.NODEMAILER,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error("Error sending email via Nodemailer", error);
      return {
        success: false,
        channel: "EMAIL" as any,
        error: error instanceof Error ? error.message : String(error),
        provider: EmailProviderType.NODEMAILER,
        timestamp: new Date(),
      };
    }
  }

  validateRecipient(recipient: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(recipient);
  }

  async isAvailable(): Promise<boolean> {
    return this.transporter !== null;
  }

  getProviderInfo() {
    return {
      type: EmailProviderType.NODEMAILER,
      name: "Nodemailer",
      version: "6.9.0",
    };
  }
}
