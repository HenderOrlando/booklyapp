import {
  INotificationProvider,
  NotificationAdapterConfig,
} from "../../interfaces/notification.interface";

/**
 * Email Adapter Interface
 */
export interface IEmailAdapter extends INotificationProvider {
  initialize(config: NotificationAdapterConfig): Promise<void>;
}
