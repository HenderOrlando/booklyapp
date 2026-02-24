import {
  INotificationProvider,
  NotificationAdapterConfig,
} from "../../interfaces/notification.interface";

/**
 * WhatsApp Adapter Interface
 */
export interface IWhatsAppAdapter extends INotificationProvider {
  initialize(config: NotificationAdapterConfig): Promise<void>;
}
