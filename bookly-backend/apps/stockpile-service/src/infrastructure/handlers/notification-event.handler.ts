import { NotificationEventType } from "@libs/common/enums";
import { EventPayload } from "@libs/common";
import { createLogger } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import {
  EmailProviderService,
  SendNotificationEvent,
  SmsProviderService,
  WhatsAppProviderService,
} from "@libs/notifications";
import { Injectable, OnModuleInit } from "@nestjs/common";

const logger = createLogger("NotificationEventHandler");

/**
 * Notification Event Handler
 * Handler que consume eventos de notificaciones del Event Bus
 */
@Injectable()
export class NotificationEventHandler implements OnModuleInit {
  constructor(
    private readonly eventBus: EventBusService,
    private readonly emailService: EmailProviderService,
    private readonly smsService: SmsProviderService,
    private readonly whatsappService: WhatsAppProviderService
  ) {}

  async onModuleInit() {
    // Suscribirse a eventos de notificaciones
    await this.subscribeToEvents();
  }

  /**
   * Suscribirse a todos los eventos de notificaciones
   */
  private async subscribeToEvents() {
    const groupId = "stockpile-notification-handlers";

    // Email
    await this.eventBus.subscribe(
      NotificationEventType.SEND_EMAIL,
      groupId,
      this.handleSendEmail.bind(this)
    );

    // SMS
    await this.eventBus.subscribe(
      NotificationEventType.SEND_SMS,
      groupId,
      this.handleSendSms.bind(this)
    );

    // WhatsApp
    await this.eventBus.subscribe(
      NotificationEventType.SEND_WHATSAPP,
      groupId,
      this.handleSendWhatsApp.bind(this)
    );

    logger.info("Notification event handlers subscribed successfully");
  }

  /**
   * Manejar evento de envío de email
   */
  async handleSendEmail(event: EventPayload<SendNotificationEvent>) {
    const notificationEvent = event.data;

    logger.info(`Processing email notification: ${notificationEvent.eventId}`);

    try {
      await this.emailService.send(
        notificationEvent.payload,
        notificationEvent.tenantId
      );

      logger.info(`Email sent successfully: ${notificationEvent.eventId}`);

      // Publicar evento de éxito
      await this.publishNotificationSent(notificationEvent);
    } catch (error) {
      logger.error(
        `Error sending email: ${notificationEvent.eventId}`,
        error as Error
      );

      // Publicar evento de fallo
      await this.publishNotificationFailed(notificationEvent, error as Error);

      throw error;
    }
  }

  /**
   * Manejar evento de envío de SMS
   */
  async handleSendSms(event: EventPayload<SendNotificationEvent>) {
    const notificationEvent = event.data;

    logger.info(`Processing SMS notification: ${notificationEvent.eventId}`);

    try {
      await this.smsService.send(
        notificationEvent.payload,
        notificationEvent.tenantId
      );

      logger.info(`SMS sent successfully: ${notificationEvent.eventId}`);

      await this.publishNotificationSent(notificationEvent);
    } catch (error) {
      logger.error(
        `Error sending SMS: ${notificationEvent.eventId}`,
        error as Error
      );

      await this.publishNotificationFailed(notificationEvent, error as Error);

      throw error;
    }
  }

  /**
   * Manejar evento de envío de WhatsApp
   */
  async handleSendWhatsApp(event: EventPayload<SendNotificationEvent>) {
    const notificationEvent = event.data;

    logger.info(
      `Processing WhatsApp notification: ${notificationEvent.eventId}`
    );

    try {
      await this.whatsappService.send(
        notificationEvent.payload,
        notificationEvent.tenantId
      );

      logger.info(`WhatsApp sent successfully: ${notificationEvent.eventId}`);

      await this.publishNotificationSent(notificationEvent);
    } catch (error) {
      logger.error(
        `Error sending WhatsApp: ${notificationEvent.eventId}`,
        error as Error
      );

      await this.publishNotificationFailed(notificationEvent, error as Error);

      throw error;
    }
  }

  /**
   * Publicar evento de notificación enviada exitosamente
   */
  private async publishNotificationSent(event: SendNotificationEvent) {
    const sentEvent: EventPayload = {
      eventId: `${event.eventId}-sent`,
      eventType: NotificationEventType.NOTIFICATION_SENT,
      timestamp: new Date(),
      service: "stockpile",
      data: {
        originalEventId: event.eventId,
        channel: event.channel,
        tenantId: event.tenantId,
        sentAt: new Date(),
      },
    };

    await this.eventBus.publish(
      NotificationEventType.NOTIFICATION_SENT,
      sentEvent
    );
  }

  /**
   * Publicar evento de notificación fallida
   */
  private async publishNotificationFailed(
    event: SendNotificationEvent,
    error: Error
  ) {
    const failedEvent: EventPayload = {
      eventId: `${event.eventId}-failed`,
      eventType: NotificationEventType.NOTIFICATION_FAILED,
      timestamp: new Date(),
      service: "stockpile",
      data: {
        originalEventId: event.eventId,
        channel: event.channel,
        tenantId: event.tenantId,
        error: error.message,
        failedAt: new Date(),
      },
    };

    await this.eventBus.publish(
      NotificationEventType.NOTIFICATION_FAILED,
      failedEvent
    );
  }
}
