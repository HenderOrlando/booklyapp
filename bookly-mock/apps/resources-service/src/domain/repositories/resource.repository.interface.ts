import { ResourceStatus, ResourceType } from "@libs/common/enums";
import { PaginationMeta, PaginationQuery } from "@libs/common";
import { ResourceEntity } from "../entities/resource.entity";

/**
 * Resource Repository Interface
 * Define los métodos para acceder y persistir recursos
 */
export interface IResourceRepository {
  /**
   * Crear un nuevo recurso
   */
  create(resource: ResourceEntity): Promise<ResourceEntity>;

  /**
   * Buscar recurso por ID
   */
  findById(id: string): Promise<ResourceEntity | null>;

  /**
   * Buscar recurso por código
   */
  findByCode(code: string): Promise<ResourceEntity | null>;

  /**
   * Buscar múltiples recursos
   */
  findMany(
    query: PaginationQuery,
    filters?: {
      type?: ResourceType;
      categoryId?: string;
      programId?: string;
      status?: ResourceStatus;
      isActive?: boolean;
      location?: string;
      building?: string;
      minCapacity?: number;
      maxCapacity?: number;
      search?: string;
    }
  ): Promise<{
    resources: ResourceEntity[];
    meta: PaginationMeta;
  }>;

  /**
   * Buscar recursos por tipo
   */
  findByType(
    type: ResourceType,
    query: PaginationQuery
  ): Promise<{
    resources: ResourceEntity[];
    meta: PaginationMeta;
  }>;

  /**
   * Buscar recursos por categoría
   */
  findByCategory(
    categoryId: string,
    query: PaginationQuery
  ): Promise<{
    resources: ResourceEntity[];
    meta: PaginationMeta;
  }>;

  /**
   * Buscar recursos por programa académico
   */
  findByProgram(
    programId: string,
    query: PaginationQuery
  ): Promise<{
    resources: ResourceEntity[];
    meta: PaginationMeta;
  }>;

  /**
   * Buscar recursos disponibles
   */
  findAvailable(query: PaginationQuery): Promise<{
    resources: ResourceEntity[];
    meta: PaginationMeta;
  }>;

  /**
   * Buscar recursos que necesitan mantenimiento
   */
  findNeedingMaintenance(): Promise<ResourceEntity[]>;

  /**
   * Actualizar recurso
   */
  update(id: string, data: Partial<ResourceEntity>): Promise<ResourceEntity>;

  /**
   * Eliminar recurso
   */
  delete(id: string): Promise<boolean>;

  /**
   * Restaurar recurso eliminado
   */
  restore(id: string): Promise<boolean>;

  /**
   * Verificar si existe un recurso con el código
   */
  existsByCode(code: string): Promise<boolean>;

  /**
   * Contar recursos
   */
  count(filters?: {
    isActive?: boolean;
    status?: ResourceStatus;
  }): Promise<number>;

  /**
   * Actualizar estado de recurso
   */
  updateStatus(id: string, status: ResourceStatus): Promise<void>;

  /**
   * Buscar recursos por ubicación
   */
  findByLocation(
    location: string,
    query: PaginationQuery
  ): Promise<{
    resources: ResourceEntity[];
    meta: PaginationMeta;
  }>;

  /**
   * Búsqueda avanzada de recursos con filtros complejos
   */
  searchAdvanced(filters: {
    types?: ResourceType[];
    minCapacity?: number;
    maxCapacity?: number;
    categoryIds?: string[];
    programIds?: string[];
    hasEquipment?: string[];
    location?: string;
    building?: string;
    status?: ResourceStatus;
    availableOn?: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
  }): Promise<{
    resources: ResourceEntity[];
    meta: PaginationMeta;
  }>;
}
