import { WhatsAppProviderType } from "../../../enums/notification.enum";
import {
  NotificationPayload,
  NotificationResult,
} from "../../../interfaces/notification.interface";

/**
 * WhatsApp Configuration
 */
export interface WhatsAppConfig {
  provider: WhatsAppProviderType;
  from: string;
  config: Record<string, any>;
}

/**
 * Base WhatsApp Adapter Interface
 * Todos los proveedores de WhatsApp deben implementar esta interfaz
 */
export interface IWhatsAppAdapter {
  /**
   * Enviar mensaje de WhatsApp
   */
  send(payload: NotificationPayload): Promise<NotificationResult>;

  /**
   * Validar destinatario (número de teléfono)
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
    type: WhatsAppProviderType;
    name: string;
    version?: string;
  };
}
