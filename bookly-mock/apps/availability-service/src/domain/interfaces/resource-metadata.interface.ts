/**
 * Resource Metadata Interface
 * Metadatos básicos de recursos sincronizados via eventos desde resources-service
 * Se usa para búsquedas avanzadas sin acoplamiento directo entre servicios
 */
export interface IResourceMetadata {
  id: string;
  name: string;
  type: string; // CLASSROOM, LABORATORY, AUDITORIUM, etc.
  capacity: number;
  location?: string;
  features?: string[]; // PROJECTOR, WHITEBOARD, AIR_CONDITIONING, etc.
  program?: string; // Código de programa académico
  status: string; // AVAILABLE, UNAVAILABLE, MAINTENANCE, etc.
  categoryId?: string;
  categoryCode?: string;
}

/**
 * Repository interface for resource metadata cache
 */
export interface IResourceMetadataRepository {
  /**
   * Guarda o actualiza metadatos de un recurso
   */
  upsert(metadata: IResourceMetadata): Promise<void>;

  /**
   * Busca metadatos por ID de recurso
   */
  findById(resourceId: string): Promise<IResourceMetadata | null>;

  /**
   * Busca metadatos por múltiples IDs
   */
  findByIds(resourceIds: string[]): Promise<IResourceMetadata[]>;

  /**
   * Busca recursos que cumplan con filtros
   */
  findByFilters(filters: {
    types?: string[];
    minCapacity?: number;
    maxCapacity?: number;
    features?: string[];
    program?: string;
    location?: string;
    status?: string;
  }): Promise<IResourceMetadata[]>;

  /**
   * Elimina metadatos de un recurso
   */
  delete(resourceId: string): Promise<boolean>;

  /**
   * Cuenta recursos que cumplen con filtros
   */
  count(filters?: { types?: string[]; status?: string }): Promise<number>;
}
