import {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from "@libs/common/enums";

/**
 * Notification Entity
 * Entidad que representa una notificación enviada a usuarios (RF-22, RF-28)
 */
export class NotificationEntity {
  constructor(
    public readonly id: string,
    public readonly recipientId: string,
    public readonly recipientName: string,
    public readonly type: NotificationType,
    public readonly channel: NotificationChannel,
    public readonly subject: string,
    public readonly message: string,
    public readonly status: NotificationStatus,
    public readonly relatedEntity: string, // 'approval_request', 'reservation', etc.
    public readonly relatedEntityId: string,
    public readonly sentAt?: Date,
    public readonly readAt?: Date,
    public readonly failedReason?: string,
    public readonly retryCount?: number,
    public readonly attachments?: Array<{
      name: string;
      url: string;
      type: string;
    }>,
    public readonly metadata?: Record<string, any>,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
    public readonly audit?: {
      createdBy: string;
    }
  ) {}

  /**
   * Verifica si la notificación está pendiente
   */
  isPending(): boolean {
    return this.status === NotificationStatus.PENDING;
  }

  /**
   * Verifica si la notificación fue enviada
   */
  isSent(): boolean {
    return this.status === NotificationStatus.SENT;
  }

  /**
   * Verifica si la notificación falló
   */
  hasFailed(): boolean {
    return this.status === NotificationStatus.FAILED;
  }

  /**
   * Verifica si la notificación fue leída
   */
  isRead(): boolean {
    return this.status === NotificationStatus.READ;
  }

  /**
   * Verifica si es una notificación de aprobación
   */
  isApprovalNotification(): boolean {
    return this.type === NotificationType.APPROVAL;
  }

  /**
   * Verifica si es una notificación de rechazo
   */
  isRejectionNotification(): boolean {
    return this.type === NotificationType.REJECTION;
  }

  /**
   * Verifica si es una notificación de recordatorio
   */
  isReminderNotification(): boolean {
    return this.type === NotificationType.REMINDER;
  }

  /**
   * Verifica si es notificación por email
   */
  isEmailChannel(): boolean {
    return this.channel === NotificationChannel.EMAIL;
  }

  /**
   * Verifica si es notificación por WhatsApp
   */
  isWhatsAppChannel(): boolean {
    return this.channel === NotificationChannel.WHATSAPP;
  }

  /**
   * Verifica si tiene adjuntos
   */
  hasAttachments(): boolean {
    return !!this.attachments && this.attachments.length > 0;
  }

  /**
   * Obtiene el número de adjuntos
   */
  getAttachmentsCount(): number {
    return this.attachments?.length || 0;
  }

  /**
   * Verifica si se puede reintentar el envío
   */
  canRetry(): boolean {
    const maxRetries = 3;
    return this.hasFailed() && (this.retryCount || 0) < maxRetries;
  }

  /**
   * Obtiene el tiempo transcurrido desde el envío
   */
  getTimeSinceSent(): number | null {
    if (!this.sentAt) return null;
    const now = new Date();
    return Math.floor((now.getTime() - this.sentAt.getTime()) / 1000); // segundos
  }

  /**
   * Marca como enviada
   */
  markAsSent(): NotificationEntity {
    return new NotificationEntity(
      this.id,
      this.recipientId,
      this.recipientName,
      this.type,
      this.channel,
      this.subject,
      this.message,
      NotificationStatus.SENT,
      this.relatedEntity,
      this.relatedEntityId,
      new Date(),
      this.readAt,
      this.failedReason,
      this.retryCount,
      this.attachments,
      this.metadata,
      this.createdAt,
      new Date(),
      this.audit
    );
  }

  /**
   * Marca como fallida
   */
  markAsFailed(reason: string): NotificationEntity {
    return new NotificationEntity(
      this.id,
      this.recipientId,
      this.recipientName,
      this.type,
      this.channel,
      this.subject,
      this.message,
      NotificationStatus.FAILED,
      this.relatedEntity,
      this.relatedEntityId,
      this.sentAt,
      this.readAt,
      reason,
      (this.retryCount || 0) + 1,
      this.attachments,
      this.metadata,
      this.createdAt,
      new Date(),
      this.audit
    );
  }

  /**
   * Marca como leída
   */
  markAsRead(): NotificationEntity {
    return new NotificationEntity(
      this.id,
      this.recipientId,
      this.recipientName,
      this.type,
      this.channel,
      this.subject,
      this.message,
      NotificationStatus.READ,
      this.relatedEntity,
      this.relatedEntityId,
      this.sentAt,
      new Date(),
      this.failedReason,
      this.retryCount,
      this.attachments,
      this.metadata,
      this.createdAt,
      new Date(),
      this.audit
    );
  }

  /**
   * Convierte la entidad a objeto plano
   */
  toObject(): any {
    return {
      id: this.id,
      recipientId: this.recipientId,
      recipientName: this.recipientName,
      type: this.type,
      channel: this.channel,
      subject: this.subject,
      message: this.message,
      status: this.status,
      relatedEntity: this.relatedEntity,
      relatedEntityId: this.relatedEntityId,
      sentAt: this.sentAt,
      readAt: this.readAt,
      failedReason: this.failedReason,
      retryCount: this.retryCount,
      attachments: this.attachments,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      audit: this.audit,
    };
  }

  /**
   * Crea una entidad desde un objeto plano
   */
  static fromObject(obj: any): NotificationEntity {
    return new NotificationEntity(
      obj.id || obj._id?.toString(),
      obj.recipientId,
      obj.recipientName,
      obj.type,
      obj.channel,
      obj.subject,
      obj.message,
      obj.status,
      obj.relatedEntity,
      obj.relatedEntityId,
      obj.sentAt,
      obj.readAt,
      obj.failedReason,
      obj.retryCount,
      obj.attachments,
      obj.metadata,
      obj.createdAt,
      obj.updatedAt,
      obj.audit
    );
  }
}
