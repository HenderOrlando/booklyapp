import { NotificationChannel } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { NotificationProviderService } from "@stockpile/infrastructure/services/notification-provider.service";
import {
  NotificationTemplateService,
  NotificationTemplateType,
  TemplateChannel,
  TemplateData,
} from "./notification-template.service";
import { DocumentGenerationService, DocumentType } from "./document-generation.service";
import { DocumentStorageService } from "./document-storage.service";

const logger = createLogger("EnhancedNotificationService");

/**
 * Opciones de notificación
 */
export interface NotificationOptions {
  channels: NotificationChannel[];
  priority?: "low" | "normal" | "high";
  includeDocument?: boolean;
  documentType?: DocumentType;
  retryOnFailure?: boolean;
  maxRetries?: number;
}

/**
 * Resultado de notificación
 */
export interface EnhancedNotificationResult {
  success: boolean;
  channels: {
    channel: NotificationChannel;
    success: boolean;
    messageId?: string;
    error?: string;
  }[];
  documentGenerated?: boolean;
  documentUrl?: string;
  timestamp: Date;
}

/**
 * Enhanced Notification Service
 * Servicio mejorado de notificaciones con soporte para:
 * - Plantillas multi-canal
 * - Generación automática de documentos
 * - Almacenamiento de documentos
 * - Adjuntos en emails
 * - Reintentos automáticos
 */
@Injectable()
export class EnhancedNotificationService {
  constructor(
    private readonly notificationProvider: NotificationProviderService,
    private readonly templateService: NotificationTemplateService,
    private readonly documentService: DocumentGenerationService,
    private readonly storageService: DocumentStorageService
  ) {}

  /**
   * Enviar notificación de aprobación aprobada
   */
  async sendApprovalApprovedNotification(
    data: TemplateData,
    options: NotificationOptions
  ): Promise<EnhancedNotificationResult> {
    logger.info("Sending approval approved notification", {
      userName: data.userName,
      resourceName: data.resourceName,
      channels: options.channels,
    });

    return this.sendTemplatedNotification(
      NotificationTemplateType.APPROVAL_APPROVED,
      data,
      options
    );
  }

  /**
   * Enviar notificación de aprobación rechazada
   */
  async sendApprovalRejectedNotification(
    data: TemplateData,
    options: NotificationOptions
  ): Promise<EnhancedNotificationResult> {
    logger.info("Sending approval rejected notification", {
      userName: data.userName,
      resourceName: data.resourceName,
      channels: options.channels,
    });

    return this.sendTemplatedNotification(
      NotificationTemplateType.APPROVAL_REJECTED,
      data,
      options
    );
  }

  /**
   * Enviar notificación de reserva confirmada
   */
  async sendReservationConfirmedNotification(
    data: TemplateData,
    options: NotificationOptions
  ): Promise<EnhancedNotificationResult> {
    logger.info("Sending reservation confirmed notification", {
      userName: data.userName,
      resourceName: data.resourceName,
      channels: options.channels,
    });

    return this.sendTemplatedNotification(
      NotificationTemplateType.RESERVATION_CONFIRMED,
      data,
      options
    );
  }

  /**
   * Enviar recordatorio de reserva
   */
  async sendReservationReminderNotification(
    data: TemplateData,
    options: NotificationOptions
  ): Promise<EnhancedNotificationResult> {
    logger.info("Sending reservation reminder notification", {
      userName: data.userName,
      resourceName: data.resourceName,
      channels: options.channels,
    });

    return this.sendTemplatedNotification(
      NotificationTemplateType.RESERVATION_REMINDER,
      data,
      options
    );
  }

  /**
   * Enviar notificación con plantilla
   */
  private async sendTemplatedNotification(
    templateType: NotificationTemplateType,
    data: TemplateData,
    options: NotificationOptions
  ): Promise<EnhancedNotificationResult> {
    const result: EnhancedNotificationResult = {
      success: false,
      channels: [],
      timestamp: new Date(),
    };

    try {
      // Generar documento si se solicita
      let documentUrl: string | undefined;
      let documentBuffer: Buffer | undefined;

      if (options.includeDocument && options.documentType) {
        const docResult = await this.generateAndStoreDocument(
          options.documentType,
          data
        );

        if (docResult.success) {
          documentUrl = docResult.url;
          documentBuffer = docResult.buffer;
          result.documentGenerated = true;
          result.documentUrl = documentUrl;

          // Agregar URL del documento a los datos de la plantilla
          data.documentUrl = documentUrl;
        }
      }

      // Enviar notificaciones por cada canal
      for (const channel of options.channels) {
        const channelResult = await this.sendToChannel(
          templateType,
          channel,
          data,
          documentBuffer
        );

        result.channels.push(channelResult);
      }

      // Determinar éxito general
      result.success = result.channels.some((c) => c.success);

      logger.info("Templated notification sent", {
        templateType,
        success: result.success,
        channelsSuccess: result.channels.filter((c) => c.success).length,
        channelsTotal: result.channels.length,
      });

      return result;
    } catch (error) {
      logger.error("Error sending templated notification", error as Error, {
        templateType,
        channels: options.channels,
      });

      throw error;
    }
  }

  /**
   * Enviar a un canal específico
   */
  private async sendToChannel(
    templateType: NotificationTemplateType,
    channel: NotificationChannel,
    data: TemplateData,
    documentBuffer?: Buffer
  ): Promise<{
    channel: NotificationChannel;
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      // Mapear NotificationChannel a TemplateChannel
      const templateChannel = this.mapToTemplateChannel(channel);

      // Renderizar plantilla
      const rendered = await this.templateService.render(
        templateType,
        templateChannel,
        data
      );

      // Preparar payload
      const payload: any = {
        to: data.userEmail || data.userName,
        message: rendered.body,
      };

      // Agregar subject si es email
      if (channel === NotificationChannel.EMAIL && rendered.subject) {
        payload.subject = rendered.subject;
      }

      // Agregar adjunto si hay documento y es email
      if (
        channel === NotificationChannel.EMAIL &&
        documentBuffer &&
        data.documentUrl
      ) {
        payload.attachments = [
          {
            filename: `documento_${data.approvalRequestId || "reserva"}.pdf`,
            content: documentBuffer,
            contentType: "application/pdf",
          },
        ];
      }

      // Enviar notificación
      const sendResult = await this.notificationProvider.send(channel, payload);

      return {
        channel,
        success: sendResult.success,
        messageId: sendResult.messageId,
        error: sendResult.error,
      };
    } catch (error) {
      logger.error(`Error sending to channel ${channel}`, error as Error);

      return {
        channel,
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Generar y almacenar documento
   */
  private async generateAndStoreDocument(
    documentType: DocumentType,
    data: TemplateData
  ): Promise<{
    success: boolean;
    url?: string;
    buffer?: Buffer;
  }> {
    try {
      // Generar documento
      let docResult;

      switch (documentType) {
        case DocumentType.APPROVAL_LETTER:
          docResult = await this.documentService.generateApprovalLetter({
            approvalRequestId: data.approvalRequestId || "",
            userName: data.userName,
            userEmail: data.userEmail || "",
            resourceName: data.resourceName,
            resourceLocation: data.resourceLocation || "",
            reservationDate: data.reservationDate || new Date(),
            reservationStartTime: data.reservationStartTime || "",
            reservationEndTime: data.reservationEndTime || "",
            approvedBy: data.approvedBy || "",
            approvedAt: new Date(),
            approvalComments: data.comment,
          });
          break;

        case DocumentType.REJECTION_LETTER:
          docResult = await this.documentService.generateRejectionLetter({
            approvalRequestId: data.approvalRequestId || "",
            userName: data.userName,
            userEmail: data.userEmail || "",
            resourceName: data.resourceName,
            reservationDate: data.reservationDate || new Date(),
            rejectedBy: data.rejectedBy || "",
            rejectedAt: new Date(),
            rejectionReason: data.rejectionReason || "",
          });
          break;

        case DocumentType.CONFIRMATION:
          docResult = await this.documentService.generateConfirmation({
            reservationId: data.approvalRequestId || "",
            userName: data.userName,
            userEmail: data.userEmail || "",
            resourceName: data.resourceName,
            resourceLocation: data.resourceLocation || "",
            reservationDate: data.reservationDate || new Date(),
            reservationStartTime: data.reservationStartTime || "",
            reservationEndTime: data.reservationEndTime || "",
            qrCode: data.qrCode || "",
            instructions: [],
          });
          break;

        default:
          throw new Error(`Unsupported document type: ${documentType}`);
      }

      // Almacenar documento
      const storageResult = await this.storageService.store(docResult.buffer, {
        documentId: docResult.documentId,
        fileName: docResult.fileName,
        mimeType: "application/pdf",
        size: docResult.size,
        userId: data.userEmail || data.userName,
        approvalRequestId: data.approvalRequestId,
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 horas
      });

      // Generar URL de descarga
      const downloadUrl = await this.storageService.generateDownloadUrl(
        storageResult.storageId,
        48 * 60 // 48 horas
      );

      logger.info("Document generated and stored", {
        documentId: docResult.documentId,
        storageId: storageResult.storageId,
        strategy: storageResult.strategy,
      });

      return {
        success: true,
        url: downloadUrl || undefined,
        buffer: docResult.buffer,
      };
    } catch (error) {
      logger.error("Error generating and storing document", error as Error);

      return {
        success: false,
      };
    }
  }

  /**
   * Mapear NotificationChannel a TemplateChannel
   */
  private mapToTemplateChannel(
    channel: NotificationChannel
  ): TemplateChannel {
    switch (channel) {
      case NotificationChannel.EMAIL:
        return TemplateChannel.EMAIL;
      case NotificationChannel.SMS:
        return TemplateChannel.SMS;
      case NotificationChannel.WHATSAPP:
        return TemplateChannel.WHATSAPP;
      case NotificationChannel.PUSH:
        return TemplateChannel.PUSH;
      default:
        return TemplateChannel.EMAIL;
    }
  }

  /**
   * Enviar notificación con reintentos
   */
  async sendWithRetry(
    templateType: NotificationTemplateType,
    data: TemplateData,
    options: NotificationOptions
  ): Promise<EnhancedNotificationResult> {
    const maxRetries = options.maxRetries || 3;
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`Sending notification (attempt ${attempt}/${maxRetries})`);

        const result = await this.sendTemplatedNotification(
          templateType,
          data,
          options
        );

        if (result.success) {
          return result;
        }

        lastError = new Error(
          `Notification failed: ${result.channels.map((c) => c.error).join(", ")}`
        );
      } catch (error) {
        lastError = error as Error;
        logger.warn(`Notification attempt ${attempt} failed`, {
          error: lastError.message,
        });
      }

      // Esperar antes del siguiente intento (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    logger.error("All notification attempts failed", lastError);
    throw lastError || new Error("Notification failed after all retries");
  }
}
