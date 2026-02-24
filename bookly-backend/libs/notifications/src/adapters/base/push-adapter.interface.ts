import {
  INotificationProvider,
  NotificationAdapterConfig,
} from "../../interfaces/notification.interface";

/**
 * Push Adapter Interface
 */
export interface IPushAdapter extends INotificationProvider {
  initialize(config: NotificationAdapterConfig): Promise<void>;
}
