import { ResourceEvents } from "@libs/common/events";
import { RequestReplyService } from "@libs/event-bus";
import { Injectable, Logger } from "@nestjs/common";

/**
 * Resources Event Service
 *
 * Servicio para comunicación event-driven con resources-service
 * Reemplaza ResourcesClient (HTTP directo) por Request-Reply Pattern
 *
 * Sigue arquitectura EDA de Bookly
 */
@Injectable()
export class ResourcesEventService {
  private readonly logger = new Logger(ResourcesEventService.name);
  private readonly SERVICE_NAME = "availability-service";
  private readonly DEFAULT_TIMEOUT = 5000; // 5 segundos

  constructor(private readonly requestReply: RequestReplyService) {}

  /**
   * Obtener recurso por ID usando eventos
   *
   * @param resourceId - ID del recurso
   * @returns Datos del recurso o null si no existe
   */
  async getResourceById(
    resourceId: string
  ): Promise<ResourceEvents.ResourceData | null> {
    try {
      this.logger.debug(`Querying resource by ID: ${resourceId}`);

      const response = await this.requestReply.request<
        ResourceEvents.QueryResourceByIdRequest,
        ResourceEvents.QueryResourceByIdResponse
      >(
        ResourceEvents.QUERY_RESOURCE_BY_ID,
        { resourceId, correlationId: "" },
        ResourceEvents.QUERY_RESOURCE_BY_ID_RESPONSE,
        this.DEFAULT_TIMEOUT,
        this.SERVICE_NAME
      );

      if (!response.found) {
        this.logger.warn(`Resource ${resourceId} not found`);
        return null;
      }

      this.logger.debug(
        `Resource ${resourceId} found: ${response.resource?.name}`
      );
      return response.resource;
    } catch (error) {
      this.logger.error(
        `Error querying resource ${resourceId}: ${error.message}`,
        error.stack
      );
      return null;
    }
  }

  /**
   * Obtener recursos candidatos para reasignación
   *
   * @param resourceType - Tipo de recurso
   * @param excludeId - ID del recurso a excluir
   * @param filters - Filtros opcionales
   * @param limit - Límite de resultados
   * @returns Array de recursos candidatos
   */
  async getCandidateResources(
    resourceType: string,
    excludeId: string,
    filters?: ResourceEvents.ResourceFilters,
    limit = 10
  ): Promise<ResourceEvents.ResourceData[]> {
    try {
      this.logger.debug(
        `Querying candidate resources: type=${resourceType}, exclude=${excludeId}`
      );

      const response = await this.requestReply.request<
        ResourceEvents.QueryCandidateResourcesRequest,
        ResourceEvents.QueryCandidateResourcesResponse
      >(
        ResourceEvents.QUERY_CANDIDATE_RESOURCES,
        {
          resourceType,
          excludeId,
          filters,
          limit,
          correlationId: "",
        },
        ResourceEvents.QUERY_CANDIDATE_RESOURCES_RESPONSE,
        this.DEFAULT_TIMEOUT,
        this.SERVICE_NAME
      );

      this.logger.debug(
        `Found ${response.count} candidate resources for type ${resourceType}`
      );

      return response.resources;
    } catch (error) {
      this.logger.error(
        `Error querying candidate resources: ${error.message}`,
        error.stack
      );
      return [];
    }
  }

  /**
   * Obtener múltiples recursos por IDs
   *
   * @param resourceIds - Array de IDs de recursos
   * @returns Array de recursos encontrados
   */
  async getResourcesByIds(
    resourceIds: string[]
  ): Promise<ResourceEvents.ResourceData[]> {
    try {
      if (!resourceIds || resourceIds.length === 0) {
        return [];
      }

      this.logger.debug(`Querying ${resourceIds.length} resources by IDs`);

      const response = await this.requestReply.request<
        ResourceEvents.QueryResourcesByIdsRequest,
        ResourceEvents.QueryResourcesByIdsResponse
      >(
        ResourceEvents.QUERY_RESOURCES_BY_IDS,
        { resourceIds, correlationId: "" },
        ResourceEvents.QUERY_RESOURCES_BY_IDS_RESPONSE,
        this.DEFAULT_TIMEOUT,
        this.SERVICE_NAME
      );

      if (response.notFound.length > 0) {
        this.logger.warn(
          `Resources not found: ${response.notFound.join(", ")}`
        );
      }

      this.logger.debug(`Found ${response.resources.length} resources`);
      return response.resources;
    } catch (error) {
      this.logger.error(
        `Error querying resources by IDs: ${error.message}`,
        error.stack
      );
      return [];
    }
  }

  /**
   * Verificar disponibilidad de un recurso
   *
   * @param resourceId - ID del recurso
   * @param startDate - Fecha inicio
   * @param endDate - Fecha fin
   * @returns true si está disponible
   */
  async checkResourceAvailability(
    resourceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<boolean> {
    try {
      this.logger.debug(
        `Checking availability for resource ${resourceId}: ${startDate} - ${endDate}`
      );

      const response = await this.requestReply.request<
        ResourceEvents.CheckResourceAvailabilityRequest,
        ResourceEvents.CheckResourceAvailabilityResponse
      >(
        ResourceEvents.CHECK_RESOURCE_AVAILABILITY,
        {
          resourceId,
          startDate,
          endDate,
          correlationId: "",
        },
        ResourceEvents.CHECK_RESOURCE_AVAILABILITY_RESPONSE,
        this.DEFAULT_TIMEOUT,
        this.SERVICE_NAME
      );

      if (!response.available && response.conflicts) {
        this.logger.warn(
          `Resource ${resourceId} has ${response.conflicts.length} conflicts`
        );
      }

      return response.available;
    } catch (error) {
      this.logger.error(
        `Error checking availability for resource ${resourceId}: ${error.message}`,
        error.stack
      );
      // En caso de error, asumir no disponible por seguridad
      return false;
    }
  }

  /**
   * Health check del servicio de eventos
   *
   * @returns Estado del servicio
   */
  async healthCheck(): Promise<boolean> {
    try {
      const stats = this.requestReply.getStats();
      this.logger.debug(`Request-Reply stats: ${JSON.stringify(stats)}`);
      return true;
    } catch (error) {
      this.logger.error(`Health check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Convertir ResourceData a ResourceForScoring
   */
  toResourceForScoring(resource: ResourceEvents.ResourceData): any {
    return {
      id: resource.id,
      name: resource.name,
      type: resource.type,
      capacity: resource.capacity || 0,
      features: resource.features || [],
      location: resource.location || "",
      building: resource.building || "",
      floor: resource.floor,
      metadata: resource.metadata || {},
    };
  }
}
