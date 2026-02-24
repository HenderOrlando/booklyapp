import {
  INotificationProvider,
  NotificationAdapterConfig,
} from "../../interfaces/notification.interface";

/**
 * SMS Adapter Interface
 */
export interface ISmsAdapter extends INotificationProvider {
  initialize(config: NotificationAdapterConfig): Promise<void>;
}
