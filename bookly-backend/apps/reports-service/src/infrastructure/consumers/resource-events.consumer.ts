import { EventPayload } from "@libs/common";
import { createLogger } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ResourceCache } from "../schemas/resource-cache.schema";

const logger = createLogger("ResourceEventsConsumer");

/**
 * Resource Events Consumer
 * Consume eventos de recursos desde resources-service para mantener cache local
 */
@Injectable()
export class ResourceEventsConsumer implements OnModuleInit {
  constructor(
    private readonly eventBus: EventBusService,
    @InjectModel(ResourceCache.name)
    private readonly resourceCacheModel: Model<ResourceCache>
  ) {}

  async onModuleInit() {
    // Consumir evento de recurso creado
    this.eventBus.subscribe(
      "resources.resource.created",
      "reports-resource-group",
      this.handleResourceCreated.bind(this)
    );

    // Consumir evento de recurso actualizado
    this.eventBus.subscribe(
      "resources.resource.updated",
      "reports-resource-group",
      this.handleResourceUpdated.bind(this)
    );

    // Consumir evento de recurso eliminado
    this.eventBus.subscribe(
      "resources.resource.deleted",
      "reports-resource-group",
      this.handleResourceDeleted.bind(this)
    );

    logger.info("ResourceEventsConsumer initialized and subscribed");
  }

  /**
   * Manejar evento de recurso creado
   */
  private async handleResourceCreated(event: EventPayload<any>): Promise<void> {
    try {
      logger.info("Processing resource.created event", {
        eventId: event.eventId,
        resourceId: event.data.resourceId || event.data.id,
      });

      const { id, resourceId, name, type, description, capacity, metadata } =
        event.data;
      const finalResourceId = resourceId || id;

      // Crear o actualizar cache del recurso
      await this.resourceCacheModel.findOneAndUpdate(
        { resourceId: finalResourceId },
        {
          resourceId: finalResourceId,
          name,
          type,
          description,
          capacity,
          metadata,
          isActive: true,
        },
        { upsert: true, new: true }
      );

      logger.info("Resource cache created/updated", {
        resourceId: finalResourceId,
        name,
      });
    } catch (error: any) {
      logger.error("Failed to process resource.created event", error, {
        eventId: event.eventId,
      });
    }
  }

  /**
   * Manejar evento de recurso actualizado
   */
  private async handleResourceUpdated(event: EventPayload<any>): Promise<void> {
    try {
      logger.info("Processing resource.updated event", {
        eventId: event.eventId,
        resourceId: event.data.resourceId || event.data.id,
      });

      const { id, resourceId, name, type, description, capacity, metadata } =
        event.data;
      const finalResourceId = resourceId || id;

      // Actualizar cache del recurso
      const updated = await this.resourceCacheModel.findOneAndUpdate(
        { resourceId: finalResourceId },
        {
          $set: {
            ...(name && { name }),
            ...(type && { type }),
            ...(description !== undefined && { description }),
            ...(capacity !== undefined && { capacity }),
            ...(metadata && { metadata }),
          },
        },
        { new: true }
      );

      if (updated) {
        logger.info("Resource cache updated", {
          resourceId: finalResourceId,
          name: updated.name,
        });
      } else {
        logger.warn("Resource not found in cache for update", {
          resourceId: finalResourceId,
        });
      }
    } catch (error: any) {
      logger.error("Failed to process resource.updated event", error, {
        eventId: event.eventId,
      });
    }
  }

  /**
   * Manejar evento de recurso eliminado
   */
  private async handleResourceDeleted(event: EventPayload<any>): Promise<void> {
    try {
      logger.info("Processing resource.deleted event", {
        eventId: event.eventId,
        resourceId: event.data.resourceId || event.data.id,
      });

      const finalResourceId = event.data.resourceId || event.data.id;

      // Marcar como inactivo en lugar de eliminar (soft delete)
      await this.resourceCacheModel.findOneAndUpdate(
        { resourceId: finalResourceId },
        { $set: { isActive: false } }
      );

      logger.info("Resource marked as inactive in cache", {
        resourceId: finalResourceId,
      });
    } catch (error: any) {
      logger.error("Failed to process resource.deleted event", error, {
        eventId: event.eventId,
      });
    }
  }
}
