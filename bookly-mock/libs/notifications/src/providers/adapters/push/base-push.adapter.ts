import { PushProviderType } from "../../../enums/notification.enum";
import {
  NotificationPayload,
  NotificationResult,
} from "../../../interfaces/notification.interface";

/**
 * Push Notification Data
 */
export interface PushNotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
  icon?: string;
  image?: string;
  clickAction?: string;
  tag?: string;
  color?: string;
  priority?: "high" | "normal";
  ttl?: number; // Time to live in seconds
}

/**
 * Push Configuration
 */
export interface PushConfig {
  provider: PushProviderType;
  config: Record<string, any>;
}

/**
 * Base Push Adapter Interface
 * Todos los proveedores de push notifications deben implementar esta interfaz
 */
export interface IPushAdapter {
  /**
   * Enviar push notification
   */
  send(payload: NotificationPayload): Promise<NotificationResult>;

  /**
   * Enviar a múltiples dispositivos
   */
  sendMulticast(
    tokens: string[],
    notification: PushNotificationData
  ): Promise<NotificationResult>;

  /**
   * Enviar a un topic
   */
  sendToTopic(
    topic: string,
    notification: PushNotificationData
  ): Promise<NotificationResult>;

  /**
   * Suscribir tokens a un topic
   */
  subscribeToTopic(tokens: string[], topic: string): Promise<boolean>;

  /**
   * Desuscribir tokens de un topic
   */
  unsubscribeFromTopic(tokens: string[], topic: string): Promise<boolean>;

  /**
   * Validar token de dispositivo
   */
  validateToken(token: string): boolean;

  /**
   * Verificar disponibilidad del proveedor
   */
  isAvailable(): Promise<boolean>;

  /**
   * Obtener información del proveedor
   */
  getProviderInfo(): {
    type: PushProviderType;
    name: string;
    version?: string;
  };
}
