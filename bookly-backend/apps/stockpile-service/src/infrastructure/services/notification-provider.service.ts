import { NotificationChannel } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import {
  EmailProviderService,
  INotificationProvider,
  NotificationPayload,
  NotificationResult,
  SmsProviderService,
  WhatsAppProviderService,
} from "@libs/notifications";
import { Injectable } from "@nestjs/common";

const logger = createLogger("NotificationProviderService");

/**
 * Notification Provider Service
 * Servicio principal que orquesta todos los providers de notificación
 */
@Injectable()
export class NotificationProviderService {
  private providers: Map<NotificationChannel, INotificationProvider>;

  constructor(
    private readonly emailProvider: EmailProviderService,
    private readonly whatsappProvider: WhatsAppProviderService,
    private readonly smsProvider: SmsProviderService
  ) {
    this.providers = new Map();
    this.providers.set(NotificationChannel.EMAIL, this.emailProvider);
    this.providers.set(NotificationChannel.WHATSAPP, this.whatsappProvider);
    this.providers.set(NotificationChannel.SMS, this.smsProvider);
  }

  /**
   * Enviar notificación por un canal específico
   */
  async send(
    channel: NotificationChannel,
    payload: NotificationPayload
  ): Promise<NotificationResult> {
    const provider = this.providers.get(channel);

    if (!provider) {
      logger.error(`Provider not found for channel: ${channel}`);
      return {
        success: false,
        error: `Provider not found for channel: ${channel}`,
        provider: "unknown",
        channel,
        timestamp: new Date(),
      };
    }

    // Validar disponibilidad
    const isAvailable = await provider.isAvailable();
    if (!isAvailable) {
      logger.error(`Provider ${provider.name} is not available`);
      return {
        success: false,
        error: `Provider ${provider.name} is not available`,
        provider: provider.name,
        channel,
        timestamp: new Date(),
      };
    }

    // Validar destinatarios
    const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];
    const invalidRecipients = recipients.filter(
      (r) => !provider.validateRecipient(r)
    );

    if (invalidRecipients.length > 0) {
      logger.error("Invalid recipients", new Error("Invalid recipients"), {
        invalidRecipients: invalidRecipients.join(", "),
      });
      return {
        success: false,
        error: `Invalid recipients: ${invalidRecipients.join(", ")}`,
        provider: provider.name,
        channel,
        timestamp: new Date(),
      };
    }

    // Enviar notificación
    return provider.send(payload);
  }

  /**
   * Enviar notificación a múltiples canales
   */
  async sendMultiChannel(
    channels: NotificationChannel[],
    payload: NotificationPayload
  ): Promise<NotificationResult[]> {
    const results = await Promise.all(
      channels.map((channel) => this.send(channel, payload))
    );

    const successCount = results.filter((r) => r.success).length;
    logger.info(`Multi-channel notification sent`, {
      total: channels.length,
      success: successCount,
      failed: channels.length - successCount,
    });

    return results;
  }

  /**
   * Enviar notificación con fallback
   * Si el canal principal falla, intenta con el secundario
   */
  async sendWithFallback(
    primaryChannel: NotificationChannel,
    fallbackChannel: NotificationChannel,
    payload: NotificationPayload
  ): Promise<NotificationResult> {
    const primaryResult = await this.send(primaryChannel, payload);

    if (primaryResult.success) {
      return primaryResult;
    }

    logger.warn(
      `Primary channel ${primaryChannel} failed, trying fallback ${fallbackChannel}`
    );

    return this.send(fallbackChannel, payload);
  }

  /**
   * Obtener estado de todos los providers
   */
  async getProvidersStatus(): Promise<
    Record<NotificationChannel, { available: boolean; provider: string }>
  > {
    const statuses = {} as any;

    for (const [channel, provider] of this.providers.entries()) {
      statuses[channel] = {
        available: await provider.isAvailable(),
        provider: provider.name,
      };
    }

    return statuses;
  }

  /**
   * Enviar notificación de aprobación
   */
  async sendApprovalNotification(
    userId: string,
    userEmail: string,
    approvalData: {
      requestId: string;
      status: string;
      resourceName: string;
      comment?: string;
    }
  ): Promise<NotificationResult> {
    return this.send(NotificationChannel.EMAIL, {
      to: userEmail,
      subject: `Solicitud de Aprobación - ${approvalData.status}`,
      message: `
        Tu solicitud de aprobación ha sido ${approvalData.status}.
        
        Recurso: ${approvalData.resourceName}
        ID de Solicitud: ${approvalData.requestId}
        ${approvalData.comment ? `Comentario: ${approvalData.comment}` : ""}
      `,
      metadata: {
        userId,
        ...approvalData,
      },
    });
  }

  /**
   * Enviar recordatorio
   */
  async sendReminder(
    channel: NotificationChannel,
    recipient: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<NotificationResult> {
    return this.send(channel, {
      to: recipient,
      subject: "Recordatorio - Bookly",
      message,
      metadata,
    });
  }
}
