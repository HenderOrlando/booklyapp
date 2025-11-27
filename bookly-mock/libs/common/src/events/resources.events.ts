/**
 * Resource Events - Contratos de eventos para comunicación con Resources Service
 *
 * Implementa Request-Reply Pattern para queries síncronas usando correlationId
 */

/**
 * Namespace de eventos relacionados con recursos
 */
export namespace ResourceEvents {
  /**
   * Base para datos de request con correlationId
   */
  export interface BaseRequest {
    correlationId: string;
  }

  /**
   * Base para datos de response con correlationId
   */
  export interface BaseResponse {
    correlationId: string;
  }

  // ============================================================
  // Query: Obtener recurso por ID
  // ============================================================

  /**
   * Request para obtener un recurso por su ID
   */
  export interface QueryResourceByIdRequest extends BaseRequest {
    resourceId: string;
  }

  /**
   * Datos del recurso en respuesta
   */
  export interface ResourceData {
    id: string;
    name: string;
    type: string;
    status: string;
    capacity?: number;
    features?: string[];
    location?: string;
    building?: string;
    floor?: number;
    description?: string;
    metadata?: Record<string, any>;
  }

  /**
   * Response con recurso encontrado
   */
  export interface QueryResourceByIdResponse extends BaseResponse {
    resource: ResourceData | null;
    found: boolean;
  }

  /**
   * Event type constants
   */
  export const QUERY_RESOURCE_BY_ID = "resources.query.getById";
  export const QUERY_RESOURCE_BY_ID_RESPONSE =
    "resources.query.getById.response";

  // ============================================================
  // Query: Obtener recursos candidatos para reasignación
  // ============================================================

  /**
   * Filtros para búsqueda de recursos candidatos
   */
  export interface ResourceFilters {
    capacity?: {
      min?: number;
      max?: number;
    };
    features?: string[];
    location?: string;
    building?: string;
    floor?: number;
    status?: string;
  }

  /**
   * Request para obtener recursos candidatos
   */
  export interface QueryCandidateResourcesRequest extends BaseRequest {
    resourceType: string;
    excludeId: string;
    filters?: ResourceFilters;
    limit?: number;
  }

  /**
   * Response con recursos candidatos
   */
  export interface QueryCandidateResourcesResponse extends BaseResponse {
    resources: ResourceData[];
    count: number;
  }

  /**
   * Event type constants
   */
  export const QUERY_CANDIDATE_RESOURCES = "resources.query.getCandidates";
  export const QUERY_CANDIDATE_RESOURCES_RESPONSE =
    "resources.query.getCandidates.response";

  // ============================================================
  // Query: Obtener múltiples recursos por IDs
  // ============================================================

  /**
   * Request para obtener múltiples recursos
   */
  export interface QueryResourcesByIdsRequest extends BaseRequest {
    resourceIds: string[];
  }

  /**
   * Response con múltiples recursos
   */
  export interface QueryResourcesByIdsResponse extends BaseResponse {
    resources: ResourceData[];
    notFound: string[];
  }

  /**
   * Event type constants
   */
  export const QUERY_RESOURCES_BY_IDS = "resources.query.getByIds";
  export const QUERY_RESOURCES_BY_IDS_RESPONSE =
    "resources.query.getByIds.response";

  // ============================================================
  // Query: Verificar disponibilidad de recurso
  // ============================================================

  /**
   * Request para verificar disponibilidad
   */
  export interface CheckResourceAvailabilityRequest extends BaseRequest {
    resourceId: string;
    startDate: Date | string;
    endDate: Date | string;
  }

  /**
   * Response con disponibilidad
   */
  export interface CheckResourceAvailabilityResponse extends BaseResponse {
    available: boolean;
    conflicts?: Array<{
      reservationId: string;
      startDate: Date | string;
      endDate: Date | string;
    }>;
  }

  /**
   * Event type constants
   */
  export const CHECK_RESOURCE_AVAILABILITY =
    "resources.query.checkAvailability";
  export const CHECK_RESOURCE_AVAILABILITY_RESPONSE =
    "resources.query.checkAvailability.response";

  // ============================================================
  // Event: Recurso creado (Domain Event)
  // ============================================================

  /**
   * Evento de dominio: Recurso creado
   */
  export interface ResourceCreated {
    resourceId: string;
    name: string;
    type: string;
    createdAt: Date | string;
    createdBy: string;
  }

  export const RESOURCE_CREATED = "resources.domain.created";

  // ============================================================
  // Event: Recurso actualizado (Domain Event)
  // ============================================================

  /**
   * Evento de dominio: Recurso actualizado
   */
  export interface ResourceUpdated {
    resourceId: string;
    changes: Record<string, any>;
    updatedAt: Date | string;
    updatedBy: string;
  }

  export const RESOURCE_UPDATED = "resources.domain.updated";

  // ============================================================
  // Event: Recurso eliminado (Domain Event)
  // ============================================================

  /**
   * Evento de dominio: Recurso eliminado
   */
  export interface ResourceDeleted {
    resourceId: string;
    deletedAt: Date | string;
    deletedBy: string;
  }

  export const RESOURCE_DELETED = "resources.domain.deleted";

  // ============================================================
  // Event: Metadatos de recurso actualizados
  // ============================================================

  /**
   * Evento: Metadatos actualizados (para sincronización de cache)
   */
  export interface ResourceMetadataUpdated {
    resourceId: string;
    metadata: ResourceData;
    updatedAt: Date | string;
  }

  export const RESOURCE_METADATA_UPDATED = "resources.metadata.updated";
}
