import {
  NotificationChannel,
  NotificationEventType,
  NotificationPriority,
} from "@libs/common/enums";

/**
 * Base Notification Event
 */
export interface NotificationEvent {
  eventId: string;
  eventType: NotificationEventType;
  timestamp: Date;
  tenantId?: string;
  correlationId?: string;
}

/**
 * Send Notification Event
 * Evento para solicitar envío de notificación
 */
export interface SendNotificationEvent extends NotificationEvent {
  channel: NotificationChannel;
  payload: {
    to: string | string[];
    subject?: string;
    message: string;
    data?: Record<string, any>;
    from?: string;
    template?: string;
    attachments?: Array<{
      filename: string;
      content: string | Buffer;
      contentType?: string;
    }>;
  };
  priority?: NotificationPriority;
  scheduledAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * Notification Sent Event
 * Evento cuando se envía exitosamente
 */
export interface NotificationSentEvent extends NotificationEvent {
  notificationId: string;
  channel: NotificationChannel;
  provider: string;
  recipient: string;
  latency: number;
  messageId?: string;
}

/**
 * Notification Failed Event
 * Evento cuando falla el envío
 */
export interface NotificationFailedEvent extends NotificationEvent {
  notificationId?: string;
  channel: NotificationChannel;
  provider: string;
  recipient: string;
  error: string;
  errorCode?: string;
  retryable: boolean;
  retryCount?: number;
}

/**
 * Notification Delivered Event
 * Evento cuando se confirma entrega (webhook de proveedor)
 */
export interface NotificationDeliveredEvent extends NotificationEvent {
  notificationId: string;
  channel: NotificationChannel;
  provider: string;
  recipient: string;
  deliveredAt: Date;
  webhookData?: Record<string, any>;
}
