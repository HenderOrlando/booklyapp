import { ResourceEvents } from "@libs/common/events";
import { EventBusService } from "@libs/event-bus";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetResourceByIdQuery } from "../queries/get-resource-by-id.query";

/**
 * Handler para query de recurso por ID
 * Responde a availability-service con datos del recurso
 */
@Injectable()
export class QueryResourceByIdHandler implements OnModuleInit {
  private readonly logger = new Logger(QueryResourceByIdHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly queryBus: QueryBus
  ) {}

  async onModuleInit() {
    // Suscribirse al topic de query
    await this.eventBus.subscribe(
      ResourceEvents.QUERY_RESOURCE_BY_ID,
      "resources-service",
      this.handle.bind(this)
    );

    this.logger.log(`Subscribed to ${ResourceEvents.QUERY_RESOURCE_BY_ID}`);
  }

  /**
   * Manejar query de recurso por ID
   */
  async handle(event: any): Promise<void> {
    const { resourceId, correlationId } = event.data;

    this.logger.debug(
      `Handling query for resource ${resourceId} (correlationId: ${correlationId})`
    );

    try {
      // Obtener recurso usando CQRS Query
      const resource = await this.queryBus.execute(
        new GetResourceByIdQuery(resourceId)
      );

      // Construir response
      const response: ResourceEvents.QueryResourceByIdResponse = {
        correlationId,
        resource: resource
          ? {
              id: resource.id,
              name: resource.name,
              type: resource.type,
              status: resource.status,
              capacity: resource.capacity,
              features: resource.features || [],
              location: resource.location,
              building: resource.building,
              floor: resource.floor,
              description: resource.description,
              metadata: resource.metadata || {},
            }
          : null,
        found: !!resource,
      };

      // Publicar response
      await this.eventBus.publish(
        ResourceEvents.QUERY_RESOURCE_BY_ID_RESPONSE,
        {
          eventId: correlationId,
          eventType: ResourceEvents.QUERY_RESOURCE_BY_ID_RESPONSE,
          timestamp: new Date(),
          service: "resources-service",
          data: response,
        }
      );

      this.logger.debug(
        `Published response for resource ${resourceId} (found: ${response.found})`
      );
    } catch (error) {
      this.logger.error(
        `Error handling query for resource ${resourceId}: ${error.message}`,
        error.stack
      );

      // Publicar response con error
      await this.eventBus.publish(
        ResourceEvents.QUERY_RESOURCE_BY_ID_RESPONSE,
        {
          eventId: correlationId,
          eventType: ResourceEvents.QUERY_RESOURCE_BY_ID_RESPONSE,
          timestamp: new Date(),
          service: "resources-service",
          data: {
            correlationId,
            resource: null,
            found: false,
          },
        }
      );
    }
  }
}
