import { EventType } from "@libs/common/enums";
import { EventPayload } from "@libs/common";
import { createLogger } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import { RedisService } from "@libs/redis";
import { Injectable, OnModuleInit } from "@nestjs/common";

const logger = createLogger("UserInfoEventHandler");

/**
 * User Info Event Handler
 * Maneja eventos relacionados con usuarios de availability-service
 * RF-23: Cachea información de usuarios para enriquecimiento
 *
 * Eventos escuchados:
 * - user.created: Cuando se crea un usuario
 * - user.updated: Cuando se actualiza un usuario
 * - user.deleted: Cuando se elimina un usuario
 */
@Injectable()
export class UserInfoEventHandler implements OnModuleInit {
  private readonly USER_CACHE_TTL = 1800; // 30 minutos

  constructor(
    private readonly redisService: RedisService,
    private readonly eventBus: EventBusService
  ) {}

  async onModuleInit() {
    // Subscribe to user events
    await this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    await this.eventBus.subscribe(
      EventType.USER_CREATED,
      EventType.STOCKPILE_GROUP,
      this.handleUserCreated.bind(this)
    );

    await this.eventBus.subscribe(
      EventType.USER_UPDATED,
      EventType.STOCKPILE_GROUP,
      this.handleUserUpdated.bind(this)
    );

    await this.eventBus.subscribe(
      EventType.USER_DELETED,
      EventType.STOCKPILE_GROUP,
      this.handleUserDeleted.bind(this)
    );

    await this.eventBus.subscribe(
      EventType.RESERVATION_CREATED,
      EventType.STOCKPILE_GROUP,
      this.handleReservationCreated.bind(this)
    );

    logger.info("User Info Event Handler subscribed to events");
  }

  /**
   * Maneja el evento de usuario creado
   * Cachea la información del usuario en Redis
   */
  async handleUserCreated(event: EventPayload<any>) {
    const data = event.data || event;
    try {
      logger.info(`Handling ${EventType.USER_CREATED} event`, {
        userId: data.userId,
      });

      await this.cacheUserInfo({
        id: data.userId,
        name: data.name,
        email: data.email,
        program: data.program || data.academicProgram,
      });

      logger.info("User info cached successfully", { userId: data.userId });
    } catch (error) {
      logger.error(
        `Error handling ${EventType.USER_CREATED} event`,
        error as Error,
        {
          userId: data.userId,
        }
      );
    }
  }

  /**
   * Maneja el evento de usuario actualizado
   * Actualiza la información del usuario en cache
   */
  async handleUserUpdated(event: EventPayload<any>) {
    const data = event.data || event;
    try {
      logger.info(`Handling ${EventType.USER_UPDATED} event`, {
        userId: data.userId,
      });

      await this.cacheUserInfo({
        id: data.userId,
        name: data.name,
        email: data.email,
        program: data.program || data.academicProgram,
      });

      logger.info("User info updated in cache", { userId: data.userId });
    } catch (error) {
      logger.error(
        `Error handling ${EventType.USER_UPDATED} event`,
        error as Error,
        {
          userId: data.userId,
        }
      );
    }
  }

  /**
   * Maneja el evento de usuario eliminado
   * Invalida el cache del usuario
   */
  async handleUserDeleted(event: EventPayload<any>) {
    const data = event.data || event;
    try {
      logger.info(`Handling ${EventType.USER_DELETED} event`, {
        userId: data.userId,
      });

      await this.redisService.deleteCachedWithPrefix(
        "CACHE",
        `user:${data.userId}`
      );

      logger.info("User info removed from cache", { userId: data.userId });
    } catch (error) {
      logger.error(
        `Error handling ${EventType.USER_DELETED} event`,
        error as Error,
        {
          userId: data.userId,
        }
      );
    }
  }

  /**
   * Maneja evento de reserva creada (contiene info de usuario)
   * Cachea información del solicitante desde el evento de reserva
   */
  async handleReservationCreated(event: EventPayload<any>) {
    const data = event.data || event;
    try {
      const userId = data.userId || data.requesterId;

      if (!userId) {
        logger.warn("Reservation created without userId", {
          reservationId: data.reservationId,
        });
        return;
      }

      logger.info(
        `Handling ${EventType.RESERVATION_CREATED} event for user caching`,
        {
          userId,
          reservationId: data.reservationId,
        }
      );

      // Si el evento incluye información del usuario, cachearla
      if (data.user || data.requester) {
        const userInfo = data.user || data.requester;

        await this.cacheUserInfo({
          id: userId,
          name: userInfo.name || userInfo.fullName,
          email: userInfo.email,
          program: userInfo.program || userInfo.academicProgram,
        });

        logger.info("User info cached from reservation event", { userId });
      }
    } catch (error) {
      logger.error(
        `Error handling ${EventType.RESERVATION_CREATED} event`,
        error as Error,
        {
          reservationId: data.reservationId,
        }
      );
    }
  }

  /**
   * Helper para cachear información de usuario
   */
  private async cacheUserInfo(userInfo: {
    id: string;
    name?: string;
    email?: string;
    program?: string;
  }): Promise<void> {
    await this.redisService.cacheWithPrefix(
      "CACHE",
      `user:${userInfo.id}`,
      {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        program: userInfo.program,
      },
      this.USER_CACHE_TTL
    );

    logger.debug("User cached in Redis", {
      userId: userInfo.id,
      ttl: this.USER_CACHE_TTL,
    });
  }
}
