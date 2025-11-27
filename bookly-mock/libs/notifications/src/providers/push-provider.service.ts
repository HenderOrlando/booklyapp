import { NotificationChannel } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import {
  INotificationProvider,
  NotificationPayload,
  NotificationResult,
} from "../interfaces/notification.interface";
import {
  IPushAdapter,
  PushNotificationData,
} from "./adapters/push/base-push.adapter";
import { AdapterFactory } from "./factories/adapter.factory";
import { TenantNotificationConfigService } from "./tenant-notification-config.service";

const logger = createLogger("PushProviderService");

/**
 * Push Provider Service
 * Servicio agnóstico de proveedor para envío de push notifications
 */
@Injectable()
export class PushProviderService implements INotificationProvider {
  private adapters: Map<string, IPushAdapter> = new Map();
  readonly channel = NotificationChannel.PUSH;
  readonly name = "PushProvider";

  constructor(
    private readonly configService: TenantNotificationConfigService,
    private readonly factory: AdapterFactory
  ) {}

  /**
   * Obtener adapter para un tenant
   */
  private async getAdapter(tenantId?: string): Promise<IPushAdapter> {
    const effectiveTenantId = tenantId || "default";

    // Revisar cache
    if (this.adapters.has(effectiveTenantId)) {
      return this.adapters.get(effectiveTenantId)!;
    }

    // Obtener configuración del tenant
    const config = await this.configService.getTenantConfig(effectiveTenantId);

    if (!config.push) {
      throw new Error(
        `No push configuration found for tenant ${effectiveTenantId}`
      );
    }

    // Crear adapter
    const adapter = this.factory.createPushAdapter(config.push);
    this.adapters.set(effectiveTenantId, adapter);

    return adapter;
  }

  /**
   * Enviar push notification
   */
  async send(
    payload: NotificationPayload,
    tenantId?: string
  ): Promise<NotificationResult> {
    try {
      const adapter = await this.getAdapter(tenantId);

      logger.info("Sending push notification", {
        tenantId,
        to: Array.isArray(payload.to) ? payload.to.length : 1,
        subject: payload.subject,
      });

      return await adapter.send(payload);
    } catch (error) {
      logger.error("Error sending push notification", error);
      return {
        success: false,
        channel: this.channel,
        error: error instanceof Error ? error.message : String(error),
        provider: "unknown",
        timestamp: new Date(),
      };
    }
  }

  /**
   * Enviar a múltiples dispositivos
   */
  async sendMulticast(
    tokens: string[],
    notification: PushNotificationData,
    tenantId?: string
  ): Promise<NotificationResult> {
    try {
      const adapter = await this.getAdapter(tenantId);
      return await adapter.sendMulticast(tokens, notification);
    } catch (error) {
      logger.error("Error sending multicast", error);
      return {
        success: false,
        channel: this.channel,
        error: error instanceof Error ? error.message : String(error),
        provider: "unknown",
        timestamp: new Date(),
      };
    }
  }

  /**
   * Enviar a un topic
   */
  async sendToTopic(
    topic: string,
    notification: PushNotificationData,
    tenantId?: string
  ): Promise<NotificationResult> {
    try {
      const adapter = await this.getAdapter(tenantId);
      return await adapter.sendToTopic(topic, notification);
    } catch (error) {
      logger.error("Error sending to topic", error);
      return {
        success: false,
        channel: this.channel,
        error: error instanceof Error ? error.message : String(error),
        provider: "unknown",
        timestamp: new Date(),
      };
    }
  }

  /**
   * Verificar disponibilidad
   */
  async isAvailable(tenantId?: string): Promise<boolean> {
    try {
      const adapter = await this.getAdapter(tenantId);
      return await adapter.isAvailable();
    } catch (error) {
      logger.warn(`Push adapter not available for tenant ${tenantId}`, error);
      return false;
    }
  }

  /**
   * Validar destinatario (token)
   */
  async validateRecipient(
    recipient: string,
    tenantId?: string
  ): Promise<boolean> {
    try {
      const adapter = await this.getAdapter(tenantId);
      return adapter.validateToken(recipient);
    } catch (error) {
      return false;
    }
  }
}
