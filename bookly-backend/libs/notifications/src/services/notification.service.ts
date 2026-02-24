import { createLogger, EventPayload } from "@libs/common";
import {
  NotificationChannel,
  NotificationEventType,
  NotificationPriority,
} from "@libs/common/enums";
import { EventBusService } from "@libs/event-bus";
import { IdempotencyService } from "@libs/idempotency";
import { Injectable, Optional } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { SendNotificationEvent } from "../events/notification.events";
import { NotificationPayload } from "../interfaces/notification.interface";

const logger = createLogger("NotificationService");

/**
 * Notification Service
 * Servicio centralizado para envío de notificaciones vía Event Bus
 * Supports idempotent dedupe when IdempotencyService is available.
 */
@Injectable()
export class NotificationService {
  constructor(
    private readonly eventBus: EventBusService,
    @Optional() private readonly idempotencyService?: IdempotencyService,
  ) {}

  /**
   * Enviar notificación vía evento
   */
  async sendNotification(
    channel: NotificationChannel,
    payload: NotificationPayload,
    tenantId?: string,
    priority: NotificationPriority = NotificationPriority.NORMAL,
    idempotencyKey?: string,
  ): Promise<{ eventId: string; status: string }> {
    const eventId = uuidv4();
    const correlationId = uuidv4();

    // Dedupe: if an idempotencyKey is provided and IdempotencyService is available,
    // check whether this notification was already sent.
    const dedupeKey = idempotencyKey
      ? `notif:${channel}:${idempotencyKey}`
      : null;

    if (dedupeKey && this.idempotencyService) {
      try {
        const status = await this.idempotencyService.startOperation(
          dedupeKey,
          correlationId,
          eventId,
          3600, // 1h TTL — same notification won't be re-sent within 1 hour
        );
        if (status === "duplicate") {
          logger.warn(`Notification deduplicated: ${dedupeKey}`, {
            channel,
            eventId,
          });
          return { eventId, status: "deduplicated" };
        }
      } catch {
        // Fail open — send the notification even if dedupe check fails
      }
    }

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
      const eventPayload: EventPayload<SendNotificationEvent> = {
        eventId,
        eventType: event.eventType,
        timestamp: event.timestamp,
        service: "notifications",
        data: event,
      };

      await this.eventBus.publish(event.eventType, eventPayload);

      // Mark operation as completed for dedupe
      if (dedupeKey && this.idempotencyService) {
        try {
          await this.idempotencyService.completeOperation(
            dedupeKey,
            { eventId, channel },
            3600,
          );
        } catch {
          // Non-critical — notification was already sent
        }
      }

      logger.info(`Notification event sent: ${eventId} - ${channel}`);

      return {
        eventId,
        status: "queued",
      };
    } catch (error) {
      // Mark operation as failed so it can be retried
      if (dedupeKey && this.idempotencyService) {
        try {
          await this.idempotencyService.failOperation(
            dedupeKey,
            error as Error,
          );
        } catch {
          // Non-critical
        }
      }
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
    }>,
  ): Promise<Array<{ eventId: string; status: string }>> {
    const results = await Promise.all(
      notifications.map((notification) =>
        this.sendNotification(
          notification.channel,
          notification.payload,
          notification.tenantId,
          notification.priority,
        ),
      ),
    );

    return results;
  }
}
