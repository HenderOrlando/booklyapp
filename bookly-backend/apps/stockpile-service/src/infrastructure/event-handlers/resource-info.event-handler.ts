import { EventType } from "@libs/common/enums";
import { EventPayload } from "@libs/common";
import { createLogger } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import { RedisService } from "@libs/redis";
import { Injectable, OnModuleInit } from "@nestjs/common";

const logger = createLogger("ResourceInfoEventHandler");

/**
 * Resource Info Event Handler
 * Maneja eventos relacionados con recursos de resources-service
 * RF-23: Cachea información de recursos para enriquecimiento
 *
 * Eventos escuchados:
 * - resource.created: Cuando se crea un recurso
 * - resource.updated: Cuando se actualiza un recurso
 * - resource.deleted: Cuando se elimina un recurso
 * - resource.status.changed: Cuando cambia el estado de un recurso
 */
@Injectable()
export class ResourceInfoEventHandler implements OnModuleInit {
  private readonly RESOURCE_CACHE_TTL = 3600; // 1 hora

  constructor(
    private readonly redisService: RedisService,
    private readonly eventBus: EventBusService
  ) {}

  async onModuleInit() {
    await this.subscribeToEvents();
  }

  private async subscribeToEvents() {
    await this.eventBus.subscribe(
      EventType.RESOURCE_CREATED,
      EventType.STOCKPILE_GROUP,
      (event: EventPayload<any>) => this.handleResourceCreated(event)
    );

    await this.eventBus.subscribe(
      EventType.RESOURCE_UPDATED,
      EventType.STOCKPILE_GROUP,
      (event: EventPayload<any>) => this.handleResourceUpdated(event)
    );

    await this.eventBus.subscribe(
      EventType.RESOURCE_DELETED,
      EventType.STOCKPILE_GROUP,
      (event: EventPayload<any>) => this.handleResourceDeleted(event)
    );

    await this.eventBus.subscribe(
      EventType.RESOURCE_STATUS_CHANGED,
      EventType.STOCKPILE_GROUP,
      (event: EventPayload<any>) => this.handleResourceStatusChanged(event)
    );

    await this.eventBus.subscribe(
      EventType.RESERVATION_CREATED,
      EventType.STOCKPILE_GROUP,
      (event: EventPayload<any>) => this.handleReservationCreated(event)
    );

    logger.info("Resource Info Event Handler subscribed to events");
  }

  /**
   * Maneja el evento de recurso creado
   * Cachea la información del recurso en Redis
   */
  async handleResourceCreated(event: EventPayload<any>) {
    const data = event.data || event;
    try {
      logger.info(`Handling ${EventType.RESOURCE_CREATED} event`, {
        resourceId: data.resourceId || data.id,
      });

      await this.cacheResourceInfo({
        id: data.resourceId || data.id,
        name: data.name,
        type: data.type || data.resourceType,
        location: data.location,
        capacity: data.capacity,
      });

      logger.info("Resource info cached successfully", {
        resourceId: data.resourceId || data.id,
      });
    } catch (error) {
      logger.error(
        `Error handling ${EventType.RESOURCE_CREATED} event`,
        error as Error,
        {
          resourceId: data.resourceId || data.id,
        }
      );
    }
  }

  /**
   * Maneja el evento de recurso actualizado
   * Actualiza la información del recurso en cache
   */
  async handleResourceUpdated(event: EventPayload<any>) {
    const data = event.data || event;
    try {
      logger.info(`Handling ${EventType.RESOURCE_UPDATED} event`, {
        resourceId: data.resourceId || data.id,
      });

      await this.cacheResourceInfo({
        id: data.resourceId || data.id,
        name: data.name,
        type: data.type || data.resourceType,
        location: data.location,
        capacity: data.capacity,
      });

      logger.info("Resource info updated in cache", {
        resourceId: data.resourceId || data.id,
      });
    } catch (error) {
      logger.error(
        `Error handling ${EventType.RESOURCE_UPDATED} event`,
        error as Error,
        {
          resourceId: data.resourceId || data.id,
        }
      );
    }
  }

  /**
   * Maneja el evento de recurso eliminado
   * Invalida el cache del recurso
   */
  async handleResourceDeleted(event: EventPayload<any>) {
    const data = event.data || event;
    try {
      const resourceId = data.resourceId || data.id;
      logger.info(`Handling ${EventType.RESOURCE_DELETED} event`, {
        resourceId,
      });

      await this.redisService.deleteCachedWithPrefix(
        "CACHE",
        `resource:${resourceId}`
      );

      logger.info("Resource info removed from cache", { resourceId });
    } catch (error) {
      logger.error(
        `Error handling ${EventType.RESOURCE_DELETED} event`,
        error as Error,
        {
          resourceId: data.resourceId || data.id,
        }
      );
    }
  }

  /**
   * Maneja el evento de cambio de estado del recurso
   * Actualiza el estado en cache
   */
  async handleResourceStatusChanged(event: EventPayload<any>) {
    const data = event.data || event;
    try {
      const resourceId = data.resourceId || data.id;
      logger.info(`Handling ${EventType.RESOURCE_STATUS_CHANGED} event`, {
        resourceId,
        newStatus: data.status,
      });

      // Obtener info actual del cache
      const cached = await this.redisService.getCachedWithPrefix<any>(
        "CACHE",
        `resource:${resourceId}`
      );

      if (cached) {
        // Actualizar solo el estado
        cached.status = data.status;
        await this.redisService.cacheWithPrefix(
          "CACHE",
          `resource:${resourceId}`,
          cached,
          this.RESOURCE_CACHE_TTL
        );

        logger.info("Resource status updated in cache", {
          resourceId,
          status: data.status,
        });
      } else {
        logger.warn("Resource not found in cache for status update", {
          resourceId,
        });
      }
    } catch (error) {
      logger.error(
        `Error handling ${EventType.RESOURCE_STATUS_CHANGED} event`,
        error as Error,
        {
          resourceId: data.resourceId || data.id,
        }
      );
    }
  }

  /**
   * Maneja evento de reserva creada (contiene info de recurso)
   * Cachea información del recurso desde el evento de reserva
   */
  async handleReservationCreated(event: EventPayload<any>) {
    const data = event.data || event;
    try {
      const resourceId = data.resourceId;

      if (!resourceId) {
        logger.warn("Reservation created without resourceId", {
          reservationId: data.reservationId,
        });
        return;
      }

      logger.info(
        `Handling ${EventType.RESERVATION_CREATED} event for resource caching`,
        {
          resourceId,
          reservationId: data.reservationId,
        }
      );

      // Si el evento incluye información del recurso, cachearla
      if (data.resource) {
        await this.cacheResourceInfo({
          id: resourceId,
          name: data.resource.name,
          type: data.resource.type || data.resource.resourceType,
          location: data.resource.location,
          capacity: data.resource.capacity,
        });

        logger.info("Resource info cached from reservation event", {
          resourceId,
        });
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
   * Helper para cachear información de recurso
   */
  private async cacheResourceInfo(resourceInfo: {
    id: string;
    name?: string;
    type?: string;
    location?: string;
    capacity?: number;
  }): Promise<void> {
    await this.redisService.cacheWithPrefix(
      "CACHE",
      `resource:${resourceInfo.id}`,
      {
        id: resourceInfo.id,
        name: resourceInfo.name,
        type: resourceInfo.type,
        location: resourceInfo.location,
        capacity: resourceInfo.capacity,
      },
      this.RESOURCE_CACHE_TTL
    );

    logger.debug("Resource cached in Redis", {
      resourceId: resourceInfo.id,
      ttl: this.RESOURCE_CACHE_TTL,
    });
  }
}
