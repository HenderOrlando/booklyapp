import {
  NotificationChannel,
  NotificationEventType,
  NotificationPriority,
} from "@libs/common/enums";
import { EventPayload } from "@libs/common";
import { createLogger } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import { Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { SendNotificationEvent } from "../events/notification.events";
import { NotificationPayload } from "../interfaces/notification.interface";

const logger = createLogger("NotificationService");

/**
 * Notification Service
 * Servicio centralizado para envío de notificaciones vía Event Bus
 */
@Injectable()
export class NotificationService {
  constructor(private readonly eventBus: EventBusService) {}

  /**
   * Enviar notificación vía evento
   */
  async sendNotification(
    channel: NotificationChannel,
    payload: NotificationPayload,
    tenantId?: string,
    priority: NotificationPriority = NotificationPriority.NORMAL
  ): Promise<{ eventId: string; status: string }> {
    const eventId = uuidv4();
    const correlationId = uuidv4();

    const event: SendNotificationEvent = {
      eventId,
      eventType: this.getEventType(channel),
      timestamp: new Date(),
      tenantId,
      correlationId,
      channel,
      payload,
      priority,
    };

    try {
      // Convertir SendNotificationEvent a EventPayload
      const eventPayload: EventPayload<SendNotificationEvent> = {
        eventId,
        eventType: event.eventType,
        timestamp: event.timestamp,
        service: "notifications",
        data: event,
      };

      // Publicar evento usando EventBusService
      await this.eventBus.publish(event.eventType, eventPayload);

      logger.info(`Notification event sent: ${eventId} - ${channel}`);

      return {
        eventId,
        status: "queued",
      };
    } catch (error) {
      logger.error(`Error sending notification event: ${eventId}`, error);
      throw error;
    }
  }

  /**
   * Obtener tipo de evento según canal
   */
  private getEventType(channel: NotificationChannel): NotificationEventType {
    switch (channel) {
      case NotificationChannel.EMAIL:
        return NotificationEventType.SEND_EMAIL;
      case NotificationChannel.SMS:
        return NotificationEventType.SEND_SMS;
      case NotificationChannel.WHATSAPP:
        return NotificationEventType.SEND_WHATSAPP;
      case NotificationChannel.PUSH:
        return NotificationEventType.SEND_PUSH;
      default:
        throw new Error(`Unsupported notification channel: ${channel}`);
    }
  }

  /**
   * Enviar múltiples notificaciones
   */
  async sendBatch(
    notifications: Array<{
      channel: NotificationChannel;
      payload: NotificationPayload;
      tenantId?: string;
      priority?: NotificationPriority;
    }>
  ): Promise<Array<{ eventId: string; status: string }>> {
    const results = await Promise.all(
      notifications.map((notification) =>
        this.sendNotification(
          notification.channel,
          notification.payload,
          notification.tenantId,
          notification.priority
        )
      )
    );

    return results;
  }
}
