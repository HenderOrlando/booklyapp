/**
 * Notification Configuration
 */
export interface NotificationConfig {
  brokerType?: "rabbitmq" | "kafka";
  eventBus?: {
    url: string;
    exchange: string;
    queues?: string[];
    queue?: string;
  };
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
  defaultTenant?: string;
  metricsEnabled?: boolean;
  enableEventStore?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

/**
 * Default Notification Configuration
 */
export const DEFAULT_NOTIFICATION_CONFIG: NotificationConfig = {
  brokerType: "rabbitmq",
  defaultTenant: "default",
  metricsEnabled: true,
  enableEventStore: false,
  retryAttempts: 3,
  retryDelay: 1000,
};
