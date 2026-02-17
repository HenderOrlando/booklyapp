/**
 * Cliente HTTP Type-Safe para Resources Service
 *
 * Integración con backend Bookly Resources Service via API Gateway
 *
 * @example
 * ```typescript
 * // Obtener todos los recursos
 * const { data } = await ResourcesClient.getAll();
 *
 * // Buscar recursos por tipo
 * const classrooms = await ResourcesClient.search({ type: 'CLASSROOM' });
 * ```
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import type { ApiResponse } from "@/types/api/response";
import type {
  AcademicProgram,
  Category,
  Maintenance,
  Resource,
  ResourceStatus,
  ResourceType,
} from "@/types/entities/resource";
import { RESOURCES_ENDPOINTS, buildUrl } from "./endpoints";
import type { PaginatedResponse } from "./types";

/**
 * DTO para crear recurso
 */
export interface CreateResourceDto {
  code: string;
  name: string;
  description: string;
  type: ResourceType;
  categoryId: string;
  capacity: number;
  location: string;
  floor?: string;
  building?: string;
  attributes?: Record<string, any>;
  programIds?: string[];
  status?: ResourceStatus;
  imageUrl?: string;
}

/**
 * DTO para actualizar recurso
 */
export interface UpdateResourceDto extends Partial<CreateResourceDto> {}

/**
 * Filtros de búsqueda de recursos
 */
export interface ResourceSearchFilters {
  type?: ResourceType;
  categoryId?: string;
  status?: ResourceStatus;
  capacity?: number;
  minCapacity?: number;
  maxCapacity?: number;
  location?: string;
  building?: string;
  floor?: string;
  programId?: string;
  hasAttribute?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Cliente HTTP para operaciones de recursos
 */
export class ResourcesClient {
  // ============================================
  // RECURSOS (RESOURCES)
  // ============================================

  /**
   * Obtiene todos los recursos
   *
   * @returns Lista paginada de recursos
   */
  static async getAll(): Promise<ApiResponse<PaginatedResponse<Resource>>> {
    return httpClient.get<PaginatedResponse<Resource>>(
      RESOURCES_ENDPOINTS.BASE,
    );
  }

  /**
   * Obtiene un recurso por su ID
   *
   * @param id - ID del recurso
   * @returns Recurso encontrado
   */
  static async getById(id: string): Promise<ApiResponse<Resource>> {
    return httpClient.get<Resource>(RESOURCES_ENDPOINTS.BY_ID(id));
  }

  /**
   * Busca recursos con filtros avanzados
   *
   * @param filters - Filtros de búsqueda
   * @returns Lista filtrada de recursos
   * @example
   * ```typescript
   * const { data } = await ResourcesClient.search({
   *   type: 'CLASSROOM',
   *   status: 'AVAILABLE',
   *   minCapacity: 30,
   *   building: 'Edificio A'
   * });
   * ```
   */
  static async search(
    filters: ResourceSearchFilters,
  ): Promise<ApiResponse<PaginatedResponse<Resource>>> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });

    return httpClient.get<PaginatedResponse<Resource>>(
      buildUrl(RESOURCES_ENDPOINTS.BASE, filters as Record<string, any>),
    );
  }

  /**
   * Crea un nuevo recurso
   *
   * @param data - Datos del recurso
   * @returns Recurso creado
   */
  static async create(data: CreateResourceDto): Promise<ApiResponse<Resource>> {
    return httpClient.post<Resource>(RESOURCES_ENDPOINTS.BASE, data);
  }

  /**
   * Actualiza un recurso existente
   *
   * @param id - ID del recurso
   * @param data - Campos a actualizar
   * @returns Recurso actualizado
   */
  static async update(
    id: string,
    data: UpdateResourceDto,
  ): Promise<ApiResponse<Resource>> {
    return httpClient.patch<Resource>(RESOURCES_ENDPOINTS.BY_ID(id), data);
  }

  /**
   * Elimina un recurso (soft delete)
   *
   * @param id - ID del recurso
   * @returns Recurso eliminado
   */
  static async delete(id: string): Promise<ApiResponse<Resource>> {
    return httpClient.delete<Resource>(RESOURCES_ENDPOINTS.BY_ID(id));
  }

  // ============================================
  // IMPORTACIÓN Y EXPORTACIÓN
  // ============================================

  /**
   * Importa recursos desde CSV
   *
   * @param csvContent - Contenido del archivo CSV
   * @param mode - Modo de importación (create, update, upsert)
   * @param skipErrors - Si debe omitir errores y continuar
   * @returns Resultado de la importación
   */
  static async importResources(
    csvContent: string,
    mode: "create" | "update" | "upsert" = "create",
    skipErrors: boolean = false,
  ): Promise<
    ApiResponse<{
      successCount: number;
      updatedCount: number;
      errorCount: number;
      errors: string[];
    }>
  > {
    return httpClient.post<any>(`${RESOURCES_ENDPOINTS.BASE}/import`, {
      csvContent,
      mode,
      skipErrors,
    });
  }

  /**
   * Búsqueda avanzada de recursos
   *
   * @param filters - Filtros de búsqueda avanzada
   * @returns Recursos que coinciden con los filtros
   */
  static async advancedSearch(filters: {
    types?: ResourceType[];
    minCapacity?: number;
    maxCapacity?: number;
    categoryIds?: string[];
    programIds?: string[];
    hasEquipment?: boolean;
    location?: string;
    building?: string;
    status?: ResourceStatus;
    availableOn?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<ApiResponse<PaginatedResponse<Resource>>> {
    return httpClient.get<PaginatedResponse<Resource>>(
      `${RESOURCES_ENDPOINTS.BASE}/search/advanced`,
      { params: filters },
    );
  }

  // ============================================
  // GESTIÓN DE RECURSOS
  // ============================================

  /**
   * Restaura un recurso eliminado (soft delete)
   *
   * @param id - ID del recurso
   * @returns Recurso restaurado
   */
  static async restoreResource(id: string): Promise<ApiResponse<Resource>> {
    return httpClient.post<Resource>(
      `${RESOURCES_ENDPOINTS.BY_ID(id)}/restore`,
    );
  }

  /**
   * Obtiene las reglas de disponibilidad de un recurso
   *
   * @param id - ID del recurso
   * @returns Reglas de disponibilidad
   */
  static async getAvailabilityRules(id: string): Promise<
    ApiResponse<{
      resourceId: string;
      requiresApproval: boolean;
      maxAdvanceBookingDays: number;
      minBookingDurationMinutes: number;
      maxBookingDurationMinutes: number;
      allowRecurring: boolean;
      customRules: {
        businessHoursOnly: boolean;
        weekdaysOnly: boolean;
        maxConcurrentBookings: number;
      };
    }>
  > {
    return httpClient.get<any>(
      `${RESOURCES_ENDPOINTS.BY_ID(id)}/availability-rules`,
    );
  }

  /**
   * Obtiene la categoría de un recurso específico
   *
   * @param id - ID del recurso
   * @returns Categoría del recurso
   */
  static async getResourceCategory(id: string): Promise<
    ApiResponse<{
      id: string;
      name: string;
      code: string;
      color: string;
    }>
  > {
    return httpClient.get<any>(`${RESOURCES_ENDPOINTS.BY_ID(id)}/category`);
  }

  // ============================================
  // CATEGORÍAS (CATEGORIES)
  // ============================================

  /**
   * Obtiene todas las categorías
   *
   * @returns Lista de categorías
   */
  static async getCategories(): Promise<
    ApiResponse<PaginatedResponse<Category>>
  > {
    return httpClient.get<PaginatedResponse<Category>>(
      RESOURCES_ENDPOINTS.CATEGORIES,
    );
  }

  /**
   * Obtiene una categoría por ID
   *
   * @param id - ID de la categoría
   * @returns Categoría encontrada
   */
  static async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    return httpClient.get<Category>(RESOURCES_ENDPOINTS.CATEGORY_BY_ID(id));
  }

  // ============================================
  // MANTENIMIENTOS (MAINTENANCE)
  // ============================================

  /**
   * Obtiene el historial de mantenimiento de un recurso
   *
   * @param resourceId - ID del recurso
   * @returns Lista de mantenimientos
   */
  static async getMaintenanceHistory(
    resourceId: string,
  ): Promise<ApiResponse<PaginatedResponse<Maintenance>>> {
    return httpClient.get<PaginatedResponse<Maintenance>>(
      RESOURCES_ENDPOINTS.MAINTENANCE_HISTORY(resourceId),
    );
  }

  /**
   * Registra un nuevo mantenimiento
   *
   * @param resourceId - ID del recurso
   * @param data - Datos del mantenimiento
   * @returns Mantenimiento registrado
   */
  static async createMaintenance(
    resourceId: string,
    data: {
      type: string;
      description: string;
      scheduledDate: string;
      estimatedDuration?: number;
    },
  ): Promise<ApiResponse<Maintenance>> {
    return httpClient.post<Maintenance>(RESOURCES_ENDPOINTS.MAINTENANCE, {
      resourceId,
      ...data,
    });
  }

  // ============================================
  // PROGRAMAS ACADÉMICOS (ACADEMIC PROGRAMS)
  // ============================================

  /**
   * Obtiene todos los programas académicos
   *
   * @returns Lista de programas
   */
  static async getAcademicPrograms(): Promise<
    ApiResponse<PaginatedResponse<AcademicProgram>>
  > {
    return httpClient.get<PaginatedResponse<AcademicProgram>>(
      RESOURCES_ENDPOINTS.PROGRAMS,
    );
  }

  // ============================================
  // DISPONIBILIDAD (AVAILABILITY CHECKS)
  // ============================================

  /**
   * Verifica disponibilidad de un recurso
   *
   * @param resourceId - ID del recurso
   * @param startDate - Fecha/hora de inicio
   * @param endDate - Fecha/hora de fin
   * @returns true si está disponible
   * @future Implementar cuando backend esté disponible
   */
  static async checkAvailability(
    resourceId: string,
    startDate: string,
    endDate: string,
  ): Promise<ApiResponse<{ available: boolean; conflicts?: any[] }>> {
    return httpClient.get<{ available: boolean; conflicts?: any[] }>(
      buildUrl(RESOURCES_ENDPOINTS.AVAILABILITY_BY_ID(resourceId), {
        startDate,
        endDate,
      }),
    );
  }

  /**
   * Obtiene recursos similares
   *
   * @param resourceId - ID del recurso de referencia
   * @returns Lista de recursos similares
   * @future Implementar cuando backend esté disponible
   */
  static async getSimilarResources(
    resourceId: string,
  ): Promise<ApiResponse<PaginatedResponse<Resource>>> {
    return httpClient.get<PaginatedResponse<Resource>>(
      `${RESOURCES_ENDPOINTS.BY_ID(resourceId)}/similar`,
    );
  }
}
