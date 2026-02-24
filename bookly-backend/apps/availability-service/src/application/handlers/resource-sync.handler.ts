import { EventType } from "@libs/common/enums";
import { EventPayload } from "@libs/common";
import { createLogger } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { IResourceMetadataRepository } from '@availability/domain/interfaces/resource-metadata.interface';

const logger = createLogger("ResourceSyncHandler");

/**
 * Payload de evento de recurso creado/actualizado
 */
export interface ResourceEventPayload {
  id: string;
  name: string;
  type: string;
  capacity: number;
  location?: string;
  features?: string[];
  program?: string;
  status: string;
  categoryId?: string;
  categoryCode?: string;
}

/**
 * Handler para sincronizar metadatos de recursos via eventos Kafka
 * Escucha: RESOURCE_CREATED, RESOURCE_UPDATED, RESOURCE_DELETED
 * Mantiene cache local para búsquedas avanzadas sin acoplar servicios
 */
@Injectable()
export class ResourceSyncHandler implements OnModuleInit {
  private readonly GROUP_ID = "availability-service-resource-sync";

  constructor(
    private readonly eventBusService: EventBusService,
    @Inject("IResourceMetadataRepository")
    private readonly resourceMetadataRepository: IResourceMetadataRepository
  ) {}

  async onModuleInit() {
    try {
      // Suscribirse a eventos de recursos usando EventBusService
      await this.eventBusService.subscribe(
        EventType.RESOURCE_CREATED,
        this.GROUP_ID,
        this.handleResourceCreated.bind(this)
      );

      await this.eventBusService.subscribe(
        EventType.RESOURCE_UPDATED,
        this.GROUP_ID,
        this.handleResourceUpdated.bind(this)
      );

      await this.eventBusService.subscribe(
        EventType.RESOURCE_DELETED,
        this.GROUP_ID,
        this.handleResourceDeleted.bind(this)
      );

      logger.info("ResourceSyncHandler: Subscribed to resource events", {
        groupId: this.GROUP_ID,
        topics: [
          EventType.RESOURCE_CREATED,
          EventType.RESOURCE_UPDATED,
          EventType.RESOURCE_DELETED,
        ],
      });
    } catch (error) {
      logger.error("Error subscribing to resource events", error as Error);
    }
  }

  /**
   * Maneja evento de recurso creado
   */
  private async handleResourceCreated(
    event: EventPayload<ResourceEventPayload>
  ): Promise<void> {
    try {
      logger.info("Resource created event received", {
        eventId: event.eventId,
        resourceId: event.data.id,
      });

      await this.resourceMetadataRepository.upsert({
        id: event.data.id,
        name: event.data.name,
        type: event.data.type,
        capacity: event.data.capacity,
        location: event.data.location,
        features: event.data.features,
        program: event.data.program,
        status: event.data.status,
        categoryId: event.data.categoryId,
        categoryCode: event.data.categoryCode,
      });

      logger.info("Resource metadata cached successfully", {
        resourceId: event.data.id,
      });
    } catch (error) {
      logger.error("Error handling resource created event", error as Error, {
        eventId: event.eventId,
      });
    }
  }

  /**
   * Maneja evento de recurso actualizado
   */
  private async handleResourceUpdated(
    event: EventPayload<ResourceEventPayload>
  ): Promise<void> {
    try {
      logger.info("Resource updated event received", {
        eventId: event.eventId,
        resourceId: event.data.id,
      });

      await this.resourceMetadataRepository.upsert({
        id: event.data.id,
        name: event.data.name,
        type: event.data.type,
        capacity: event.data.capacity,
        location: event.data.location,
        features: event.data.features,
        program: event.data.program,
        status: event.data.status,
        categoryId: event.data.categoryId,
        categoryCode: event.data.categoryCode,
      });

      logger.info("Resource metadata updated in cache", {
        resourceId: event.data.id,
      });
    } catch (error) {
      logger.error("Error handling resource updated event", error as Error, {
        eventId: event.eventId,
      });
    }
  }

  /**
   * Maneja evento de recurso eliminado
   */
  private async handleResourceDeleted(
    event: EventPayload<{ resourceId: string }>
  ): Promise<void> {
    try {
      logger.info("Resource deleted event received", {
        eventId: event.eventId,
        resourceId: event.data.resourceId,
      });

      await this.resourceMetadataRepository.delete(event.data.resourceId);

      logger.info("Resource metadata removed from cache", {
        resourceId: event.data.resourceId,
      });
    } catch (error) {
      logger.error("Error handling resource deleted event", error as Error, {
        eventId: event.eventId,
      });
    }
  }
}
