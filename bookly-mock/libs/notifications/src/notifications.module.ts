import { EventBusModule } from "@libs/event-bus";
import { DynamicModule, Global, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  DEFAULT_NOTIFICATION_CONFIG,
  NotificationConfig,
} from "./config/notification.config";
import { TenantNotificationConfigRepository } from "./infrastructure/repositories/tenant-notification-config.repository";
import {
  TenantNotificationConfig,
  TenantNotificationConfigSchema,
} from "./infrastructure/schemas/tenant-notification-config.schema";
import { EmailProviderService } from "./providers/email-provider.service";
import { AdapterFactory } from "./providers/factories/adapter.factory";
import { PushProviderService } from "./providers/push-provider.service";
import { SmsProviderService } from "./providers/sms-provider.service";
import { TenantNotificationConfigService } from "./providers/tenant-notification-config.service";
import { WhatsAppProviderService } from "./providers/whatsapp-provider.service";
import { NotificationMetricsService } from "./services/notification-metrics.service";
import { NotificationService } from "./services/notification.service";
import { ChannelWebhookService } from "./webhooks/channel-webhook.service";
import { FirebaseWebhookHandler } from "./webhooks/handlers/firebase-webhook.handler";
import { MetaWhatsAppWebhookHandler } from "./webhooks/handlers/meta-whatsapp-webhook.handler";
import { SendGridWebhookHandler } from "./webhooks/handlers/sendgrid-webhook.handler";
import { TwilioWebhookHandler } from "./webhooks/handlers/twilio-webhook.handler";
import { WebhookService } from "./webhooks/webhook.service";

/**
 * Notifications Module
 * Módulo global para gestión de notificaciones usando Event Bus
 */
@Global()
@Module({})
export class NotificationsModule {
  static forRoot(config?: Partial<NotificationConfig>): DynamicModule {
    const finalConfig = { ...DEFAULT_NOTIFICATION_CONFIG, ...config };

    return {
      module: NotificationsModule,
      imports: [
        // Mongoose Schema para configuraciones de tenant
        MongooseModule.forFeature([
          {
            name: TenantNotificationConfig.name,
            schema: TenantNotificationConfigSchema,
          },
        ]),
        // Usar EventBusModule en lugar de ClientsModule directamente
        EventBusModule.forRoot({
          brokerType: finalConfig.brokerType || "rabbitmq",
          config: finalConfig.eventBus || {
            url: "amqp://localhost:5672",
            exchange: "notifications",
            queues: ["notifications_queue"],
          },
          topicPrefix: "bookly.notifications",
          enableEventStore: finalConfig.enableEventStore || false,
        }),
      ],
      providers: [
        {
          provide: "NOTIFICATION_CONFIG",
          useValue: finalConfig,
        },
        NotificationService,
        NotificationMetricsService,
        EmailProviderService,
        SmsProviderService,
        WhatsAppProviderService,
        PushProviderService,
        TenantNotificationConfigService,
        TenantNotificationConfigRepository,
        AdapterFactory,
        WebhookService,
        ChannelWebhookService,
        SendGridWebhookHandler,
        TwilioWebhookHandler,
        MetaWhatsAppWebhookHandler,
        FirebaseWebhookHandler,
      ],
      exports: [
        NotificationService,
        NotificationMetricsService,
        EmailProviderService,
        SmsProviderService,
        WhatsAppProviderService,
        PushProviderService,
        TenantNotificationConfigService,
        TenantNotificationConfigRepository,
        AdapterFactory,
        WebhookService,
        ChannelWebhookService,
        SendGridWebhookHandler,
        TwilioWebhookHandler,
        MetaWhatsAppWebhookHandler,
        FirebaseWebhookHandler,
        "NOTIFICATION_CONFIG",
        EventBusModule,
      ],
    };
  }
}
