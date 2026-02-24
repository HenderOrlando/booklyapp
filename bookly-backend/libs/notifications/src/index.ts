/**
 * Notifications Library
 * Librería centralizada para gestión de notificaciones multi-canal y multi-proveedor
 */

// Módulo principal
export { NotificationsModule } from "./notifications.module";

// Interfaces
export * from "./interfaces/notification.interface";

// DTOs
export * from "./dto/notification.dto";

// Eventos
export * from "./events/notification.events";

// Servicios
export { NotificationMetricsService } from "./services/notification-metrics.service";
export { NotificationService } from "./services/notification.service";

// Providers
export { EmailProviderService } from "./providers/email-provider.service";
export { AdapterFactory } from "./providers/factories/adapter.factory";
export { PushProviderService } from "./providers/push-provider.service";
export { SmsProviderService } from "./providers/sms-provider.service";
export { TenantNotificationConfigService } from "./providers/tenant-notification-config.service";
export { WhatsAppProviderService } from "./providers/whatsapp-provider.service";

// Adapter Interfaces
export { IEmailAdapter } from "./providers/adapters/email/base-email.adapter";
export {
  IPushAdapter,
  PushNotificationData,
} from "./providers/adapters/push/base-push.adapter";
export { ISmsAdapter } from "./providers/adapters/sms/base-sms.adapter";
export { IWhatsAppAdapter } from "./providers/adapters/whatsapp/base-whatsapp.adapter";

// Provider Configs
export {
  EmailProviderConfig,
  PushProviderConfig,
  SmsProviderConfig,
  TenantNotificationConfig,
  WhatsAppProviderConfig,
} from "./providers/config/tenant-notification.config";

// Domain Entities
export { TenantNotificationConfigEntity } from "./domain/entities/tenant-notification-config.entity";

// Infrastructure
export { TenantNotificationConfigRepository } from "./infrastructure/repositories/tenant-notification-config.repository";
export {
  TenantNotificationConfigSchema as TenantNotificationConfigMongooseSchema,
  TenantNotificationConfig as TenantNotificationConfigSchema,
} from "./infrastructure/schemas/tenant-notification-config.schema";

// Adapters base
export * from "./adapters/base/email-adapter.interface";
export * from "./adapters/base/push-adapter.interface";
export * from "./adapters/base/sms-adapter.interface";
export * from "./adapters/base/whatsapp-adapter.interface";

// Configuración
export * from "./config/notification.config";

// Enums
export * from "./enums/notification.enum";

// Webhooks
export { ChannelWebhookService } from "./webhooks/channel-webhook.service";
export { FirebaseWebhookHandler } from "./webhooks/handlers/firebase-webhook.handler";
export { MetaWhatsAppWebhookHandler } from "./webhooks/handlers/meta-whatsapp-webhook.handler";
export { SendGridWebhookHandler } from "./webhooks/handlers/sendgrid-webhook.handler";
export { TwilioWebhookHandler } from "./webhooks/handlers/twilio-webhook.handler";
export { IWebhookHandler, WebhookPayload } from "./webhooks/webhook.interface";
export { WebhookService } from "./webhooks/webhook.service";
