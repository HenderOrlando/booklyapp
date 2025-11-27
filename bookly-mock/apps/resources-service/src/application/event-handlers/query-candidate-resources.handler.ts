import { ResourceEvents } from "@libs/common/events";
import { EventBusService } from "@libs/event-bus";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import { GetResourcesQuery } from "../queries/get-resources.query";

/**
 * Handler para query de recursos candidatos
 * Encuentra recursos similares para reasignación
 */
@Injectable()
export class QueryCandidateResourcesHandler implements OnModuleInit {
  private readonly logger = new Logger(QueryCandidateResourcesHandler.name);

  constructor(
    private readonly eventBus: EventBusService,
    private readonly queryBus: QueryBus
  ) {}

  async onModuleInit() {
    await this.eventBus.subscribe(
      ResourceEvents.QUERY_CANDIDATE_RESOURCES,
      "resources-service",
      this.handle.bind(this)
    );

    this.logger.log(
      `Subscribed to ${ResourceEvents.QUERY_CANDIDATE_RESOURCES}`
    );
  }

  /**
   * Manejar query de recursos candidatos
   */
  async handle(event: any): Promise<void> {
    const { resourceType, excludeId, filters, limit, correlationId } =
      event.data;

    this.logger.debug(
      `Handling query for candidates: type=${resourceType}, exclude=${excludeId} (correlationId: ${correlationId})`
    );

    try {
      // Construir filtros para búsqueda
      const searchFilters: any = {
        type: resourceType,
        status: "AVAILABLE",
      };

      // Agregar filtros opcionales
      if (filters) {
        if (filters.capacity) {
          searchFilters.capacity = filters.capacity;
        }
        if (filters.features && filters.features.length > 0) {
          searchFilters.features = { $all: filters.features };
        }
        if (filters.location) {
          searchFilters.location = filters.location;
        }
        if (filters.building) {
          searchFilters.building = filters.building;
        }
        if (filters.floor !== undefined) {
          searchFilters.floor = filters.floor;
        }
      }

      // Buscar recursos usando CQRS Query
      const result = await this.queryBus.execute(
        new GetResourcesQuery(
          {
            page: 1,
            limit: limit || 10,
          },
          searchFilters
        )
      );
      const resources = result.resources || [];

      // Filtrar el recurso excluido
      const candidates = resources.filter((r) => r.id !== excludeId);

      // Construir response
      const response: ResourceEvents.QueryCandidateResourcesResponse = {
        correlationId,
        resources: candidates.map((r) => ({
          id: r.id,
          name: r.name,
          type: r.type,
          status: r.status,
          capacity: r.capacity,
          features: r.features || [],
          location: r.location,
          building: r.building,
          floor: r.floor,
          description: r.description,
          metadata: r.metadata || {},
        })),
        count: candidates.length,
      };

      // Publicar response
      await this.eventBus.publish(
        ResourceEvents.QUERY_CANDIDATE_RESOURCES_RESPONSE,
        {
          eventId: correlationId,
          eventType: ResourceEvents.QUERY_CANDIDATE_RESOURCES_RESPONSE,
          timestamp: new Date(),
          service: "resources-service",
          data: response,
        }
      );

      this.logger.debug(
        `Published ${response.count} candidate resources for type ${resourceType}`
      );
    } catch (error) {
      this.logger.error(
        `Error handling candidate resources query: ${error.message}`,
        error.stack
      );

      // Publicar response vacío en caso de error
      await this.eventBus.publish(
        ResourceEvents.QUERY_CANDIDATE_RESOURCES_RESPONSE,
        {
          eventId: correlationId,
          eventType: ResourceEvents.QUERY_CANDIDATE_RESOURCES_RESPONSE,
          timestamp: new Date(),
          service: "resources-service",
          data: {
            correlationId,
            resources: [],
            count: 0,
          },
        }
      );
    }
  }
}
