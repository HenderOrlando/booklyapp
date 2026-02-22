import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { EventBusService } from "@libs/event-bus";
import { EventType } from "@libs/common/enums";
import { EventPayload } from "@libs/common";
import { RedisService } from "@libs/redis";
import { randomBytes } from "crypto";

/**
 * Handler para evento RESERVATION_CONFIRMED
 * 
 * Propósito: Preparar el check-in para la reserva confirmada
 */
@Injectable()
export class ReservationConfirmedHandler implements OnModuleInit {
  private readonly logger = new Logger(ReservationConfirmedHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly redis: RedisService,
  ) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      EventType.RESERVATION_CONFIRMED,
      'stockpile-service-reservations-group',
      this.handle.bind(this),
    );

    this.logger.log(`Subscribed to ${EventType.RESERVATION_CONFIRMED}`);
  }

  /**
   * Manejar evento de reserva confirmada
   * Prepara el sistema para el check-in
   */
  async handle(event: EventPayload<any>): Promise<void> {
    const { reservationId, resourceId, userId, confirmedAt } = event.data;

    this.logger.debug(
      `Handling RESERVATION_CONFIRMED for reservation ${reservationId}`,
    );

    try {
      const qrToken = randomBytes(16).toString("hex");
      const tokenKey = `checkin:token:${reservationId}`;
      const TTL_24H = 86400;

      await this.redis.set(tokenKey, JSON.stringify({
        reservationId,
        resourceId,
        userId,
        token: qrToken,
        createdAt: new Date().toISOString(),
        used: false,
      }), { key: tokenKey, ttl: TTL_24H });

      this.logger.log(
        `Check-in token generated for reservation ${reservationId}`,
      );

      await this.eventBus.publish(EventType.DOCUMENT_GENERATED, {
        eventId: `doc-${reservationId}-${Date.now()}`,
        eventType: EventType.DOCUMENT_GENERATED,
        service: 'stockpile-service',
        timestamp: new Date(),
        data: {
          reservationId,
          resourceId,
          userId,
          documentType: 'confirmation',
          qrToken,
          confirmedAt: confirmedAt || new Date().toISOString(),
        },
        metadata: {
          correlationId: event.metadata?.correlationId,
        },
      });

      await this.eventBus.publish(EventType.NOTIFICATION_SENT, {
        eventId: `notif-${reservationId}-${Date.now()}`,
        eventType: EventType.NOTIFICATION_SENT,
        service: 'stockpile-service',
        timestamp: new Date(),
        data: {
          userId,
          channel: 'email',
          template: 'reservation_confirmed',
          context: {
            reservationId,
            resourceId,
            qrToken,
          },
        },
        metadata: {
          correlationId: event.metadata?.correlationId,
        },
      });

      this.logger.log(
        `Reservation ${reservationId} confirmed. Check-in prepared, document generated, notifications queued.`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling RESERVATION_CONFIRMED: ${error.message}`,
        error.stack,
      );
    }
  }
}
