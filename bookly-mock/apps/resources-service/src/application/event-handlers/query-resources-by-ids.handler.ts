import { ResourceEvents } from "@libs/common/events";
import { EventBusService } from "@libs/event-bus";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetResourceByIdQuery } from "../queries/get-resource-by-id.query";

/**
 * Handler para query de múltiples recursos por IDs
 * Batch query para eficiencia
 */
@Injectable()
export class QueryResourcesByIdsHandler implements OnModuleInit {
  private readonly logger = new Logger(QueryResourcesByIdsHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly queryBus: QueryBus
  ) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      ResourceEvents.QUERY_RESOURCES_BY_IDS,
      "resources-service",
      this.handle.bind(this)
    );

    this.logger.log(`Subscribed to ${ResourceEvents.QUERY_RESOURCES_BY_IDS}`);
  }

  /**
   * Manejar query de múltiples recursos
   */
  async handle(event: any): Promise<void> {
    const { resourceIds, correlationId } = event.data;

    this.logger.debug(
      `Handling query for ${resourceIds.length} resources (correlationId: ${correlationId})`
    );

    try {
      const foundResources: ResourceEvents.ResourceData[] = [];
      const notFoundIds: string[] = [];

      // Obtener cada recurso usando CQRS Query
      for (const id of resourceIds) {
        try {
          const resource = await this.queryBus.execute(
            new GetResourceByIdQuery(id)
          );

          if (resource) {
            foundResources.push({
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
            });
          } else {
            notFoundIds.push(id);
          }
        } catch (error) {
          // Si falla al obtener un recurso, agregarlo a no encontrados
          notFoundIds.push(id);
        }
      }

      // Construir response
      const response: ResourceEvents.QueryResourcesByIdsResponse = {
        correlationId,
        resources: foundResources,
        notFound: notFoundIds,
      };

      // Publicar response
      await this.eventBus.publish(
        ResourceEvents.QUERY_RESOURCES_BY_IDS_RESPONSE,
        {
          eventId: correlationId,
          eventType: ResourceEvents.QUERY_RESOURCES_BY_IDS_RESPONSE,
          timestamp: new Date(),
          service: "resources-service",
          data: response,
        }
      );

      this.logger.debug(
        `Published ${foundResources.length} resources, ${notFoundIds.length} not found`
      );
    } catch (error) {
      this.logger.error(
        `Error handling resources by IDs query: ${error.message}`,
        error.stack
      );

      // Publicar response vacío en caso de error
      await this.eventBus.publish(
        ResourceEvents.QUERY_RESOURCES_BY_IDS_RESPONSE,
        {
          eventId: correlationId,
          eventType: ResourceEvents.QUERY_RESOURCES_BY_IDS_RESPONSE,
          timestamp: new Date(),
          service: "resources-service",
          data: {
            correlationId,
            resources: [],
            notFound: resourceIds,
          },
        }
      );
    }
  }
}
