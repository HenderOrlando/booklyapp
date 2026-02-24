import { EmailProviderType } from "../../../enums/notification.enum";
import {
  NotificationPayload,
  NotificationResult,
} from "../../../interfaces/notification.interface";

// Re-export for external consumers
export { EmailProviderType };

/**
 * Email Configuration
 */
export interface EmailConfig {
  provider: EmailProviderType;
  from: string;
  config: Record<string, any>;
}

/**
 * Base Email Adapter Interface
 * Todos los proveedores de email deben implementar esta interfaz
 */
export interface IEmailAdapter {
  /**
   * Enviar email
   */
  send(payload: NotificationPayload): Promise<NotificationResult>;

  /**
   * Validar destinatario
   */
  validateRecipient(recipient: string): boolean;

  /**
   * Verificar disponibilidad del proveedor
   */
  isAvailable(): Promise<boolean>;

  /**
   * Obtener información del proveedor
   */
  getProviderInfo(): {
    type: EmailProviderType;
    name: string;
    version?: string;
  };
}
