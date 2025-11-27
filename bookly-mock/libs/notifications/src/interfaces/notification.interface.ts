import {
  NotificationChannel,
  NotificationPriority,
} from "@libs/common/enums";

/**
 * Notification Payload
 */
export interface NotificationPayload {
  to: string | string[];
  subject?: string;
  message: string;
  template?: string;
  templateData?: Record<string, any>;
  data?: Record<string, any>;
  priority?: NotificationPriority;
  metadata?: Record<string, any>;
  from?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

/**
 * Notification Result
 */
export interface NotificationResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
  channel: NotificationChannel;
  timestamp: Date;
  latency?: number;
}

/**
 * Notification Provider Interface
 */
export interface INotificationProvider {
  /**
   * Channel soportado por el provider
   */
  readonly channel: NotificationChannel;

  /**
   * Nombre del provider
   */
  readonly name: string;

  /**
   * Enviar notificación
   * @param payload - Datos de la notificación
   * @param tenantId - ID del tenant (opcional, usa default si no se especifica)
   */
  send(
    payload: NotificationPayload,
    tenantId?: string
  ): Promise<NotificationResult>;

  /**
   * Verificar si el provider está disponible
   * @param tenantId - ID del tenant (opcional)
   */
  isAvailable(tenantId?: string): Promise<boolean>;

  /**
   * Validar destinatario
   * @param recipient - Destinatario a validar
   * @param tenantId - ID del tenant (opcional)
   */
  validateRecipient(recipient: string, tenantId?: string): Promise<boolean>;
}

/**
 * Notification Adapter Config
 */
export interface NotificationAdapterConfig {
  provider: string;
  from: string;
  config: Record<string, any>;
}

/**
 * Tenant Notification Config
 */
export interface TenantNotificationConfig {
  tenantId: string;
  email?: NotificationAdapterConfig;
  sms?: NotificationAdapterConfig;
  whatsapp?: NotificationAdapterConfig;
  push?: NotificationAdapterConfig;
}
