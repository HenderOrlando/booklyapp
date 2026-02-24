import { NotificationChannel } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import {
  INotificationProvider,
  NotificationPayload,
  NotificationResult,
} from "../interfaces/notification.interface";
import { ISmsAdapter } from "./adapters/sms/base-sms.adapter";
import { AdapterFactory } from "./factories/adapter.factory";
import { TenantNotificationConfigService } from "./tenant-notification-config.service";

const logger = createLogger("SmsProviderService");

/**
 * SMS Provider Service
 * Servicio agnóstico de proveedor para envío de SMS
 */
@Injectable()
export class SmsProviderService implements INotificationProvider {
  private adapters: Map<string, ISmsAdapter> = new Map();
  readonly channel = NotificationChannel.SMS;
  readonly name = "SmsProvider";

  constructor(
    private readonly configService: TenantNotificationConfigService,
    private readonly factory: AdapterFactory
  ) {}

  /**
   * Obtener o crear adapter para un tenant
   */
  private async getAdapter(tenantId: string = "default"): Promise<ISmsAdapter> {
    if (this.adapters.has(tenantId)) {
      return this.adapters.get(tenantId)!;
    }

    const config = await this.configService.getTenantConfig(tenantId);
    if (!config.sms) {
      throw new Error(`SMS not configured for tenant ${tenantId}`);
    }

    const adapter = this.factory.createSmsAdapter(config.sms);
    this.adapters.set(tenantId, adapter);
    return adapter;
  }

  async send(
    payload: NotificationPayload,
    tenantId?: string
  ): Promise<NotificationResult> {
    try {
      const adapter = await this.getAdapter(tenantId);
      return await adapter.send(payload);
    } catch (error) {
      logger.error("Error sending SMS notification", error);
      return {
        success: false,
        channel: NotificationChannel.SMS,
        error: error instanceof Error ? error.message : String(error),
        provider: "unknown",
        timestamp: new Date(),
      };
    }
  }

  async isAvailable(tenantId?: string): Promise<boolean> {
    try {
      const adapter = await this.getAdapter(tenantId);
      return await adapter.isAvailable();
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtener información del proveedor actual
   */
  async getProviderInfo(tenantId?: string) {
    try {
      const adapter = await this.getAdapter(tenantId);
      return adapter.getProviderInfo();
    } catch (error) {
      return null;
    }
  }

  /**
   * Limpiar cache de adapters
   */
  clearAdapters(): void {
    this.adapters.clear();
    logger.info("SMS adapters cache cleared");
  }

  async validateRecipient(
    recipient: string,
    tenantId?: string
  ): Promise<boolean> {
    try {
      const adapter = await this.getAdapter(tenantId);
      return adapter.validateRecipient(recipient);
    } catch (error) {
      return false;
    }
  }
}
