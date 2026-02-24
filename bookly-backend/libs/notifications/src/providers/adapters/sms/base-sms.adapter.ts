import { SmsProviderType } from "../../../enums/notification.enum";
import {
  NotificationPayload,
  NotificationResult,
} from "../../../interfaces/notification.interface";

/**
 * SMS Configuration
 */
export interface SmsConfig {
  provider: SmsProviderType;
  from: string;
  config: Record<string, any>;
}

/**
 * Base SMS Adapter Interface
 * Todos los proveedores de SMS deben implementar esta interfaz
 */
export interface ISmsAdapter {
  /**
   * Enviar SMS
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
    type: SmsProviderType;
    name: string;
    version?: string;
  };
}
