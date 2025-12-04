import {
  EventType,
  ResourceStatus,
  ResourceType,
} from "@libs/common/enums";
import { PaginationMeta, PaginationQuery } from "@libs/common";
import { createLogger } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ResourceEntity } from '@resources/domain/entities/resource.entity';
import { IResourceRepository } from '@resources/domain/repositories/resource.repository.interface';
import { AvailabilityRulesUpdatedEvent } from "../events/availability-rules-updated.event";
import { ResourceCategoryChangedEvent } from "../events/resource-category-changed.event";
import { ResourceStatusChangedEvent } from "../events/resource-status-changed.event";
import { AttributeValidationService } from "./attribute-validation.service";

/**
 * Resource Service
 * Servicio para gestión de recursos
 */
@Injectable()
export class ResourceService {
  private readonly logger = createLogger("ResourceService");
  private readonly CACHE_TTL = 600; // 10 minutos para recursos
  private readonly CACHE_PREFIX = "resource";

  constructor(
    private readonly resourceRepository: IResourceRepository,
    private readonly eventBusService: EventBusService,
    private readonly attributeValidationService: AttributeValidationService,
    private readonly redisService?: any // RedisService opcional para no romper tests
  ) {}

  /**
   * Crear un nuevo recurso
   */
  async createResource(data: Partial<ResourceEntity>): Promise<ResourceEntity> {
    // Verificar que no exista un recurso con el mismo código
    if (data.code) {
      const exists = await this.resourceRepository.existsByCode(data.code);
      if (exists) {
        throw new ConflictException(
          `Resource with code ${data.code} already exists`
        );
      }
    }

    // Validar atributos JSON según el tipo de recurso
    if (data.attributes && data.type) {
      this.attributeValidationService.validateOrThrow(
        data.type,
        data.attributes
      );
    }

    const resource = new ResourceEntity(
      "",
      data.code!,
      data.name!,
      data.description!,
      data.type!,
      data.categoryId!,
      data.capacity!,
      data.location!,
      data.floor,
      data.building,
      data.attributes || {},
      data.programIds || [],
      data.status || ResourceStatus.AVAILABLE,
      data.isActive ?? true,
      data.maintenanceSchedule,
      data.availabilityRules,
      undefined,
      undefined,
      data.audit
    );

    const createdResource = await this.resourceRepository.create(resource);

    // Publicar evento de recurso creado
    await this.eventBusService.publish(EventType.RESOURCE_CREATED, {
      eventId: `resource-created-${createdResource.id}-${Date.now()}`,
      eventType: EventType.RESOURCE_CREATED,
      service: "resources-service",
      timestamp: new Date(),
      data: {
        resourceId: createdResource.id,
        code: createdResource.code,
        name: createdResource.name,
        type: createdResource.type,
        categoryId: createdResource.categoryId,
        status: createdResource.status,
      },
      metadata: {
        aggregateId: createdResource.id,
        aggregateType: "Resource",
        version: 1,
      },
    });

    this.logger.info("Resource created", {
      resourceId: createdResource.id,
      code: createdResource.code,
    });

    return createdResource;
  }

  /**
   * Obtener recurso por ID
   */
  async getResourceById(id: string): Promise<ResourceEntity> {
    // Intentar obtener desde cache
    if (this.redisService) {
      try {
        const cached = await this.redisService.getCachedWithPrefix(
          "cache",
          `${this.CACHE_PREFIX}:${id}`
        );
        if (cached) {
          this.logger.debug(`Resource ${id} found in cache`);
          return cached;
        }
      } catch (error) {
        this.logger.warn("Cache read error, fetching from DB", error as Error);
      }
    }

    const resource = await this.resourceRepository.findById(id);

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    // Cachear el resultado
    if (this.redisService) {
      try {
        await this.redisService.cacheWithPrefix(
          "cache",
          `${this.CACHE_PREFIX}:${id}`,
          resource,
          this.CACHE_TTL
        );
      } catch (error) {
        this.logger.warn("Cache write error", error as Error);
      }
    }

    return resource;
  }

  /**
   * Obtener recurso por código
   */
  async getResourceByCode(code: string): Promise<ResourceEntity> {
    const resource = await this.resourceRepository.findByCode(code);
    if (!resource) {
      throw new NotFoundException(`Resource with code ${code} not found`);
    }
    return resource;
  }

  /**
   * Obtener lista de recursos con paginación y filtros
   */
  async getResources(
    query: PaginationQuery,
    filters?: {
      type?: ResourceType;
      categoryId?: string;
      programId?: string;
      status?: ResourceStatus;
      isActive?: boolean;
      location?: string;
      building?: string;
    }
  ): Promise<{ resources: ResourceEntity[]; meta: PaginationMeta }> {
    return await this.resourceRepository.findMany(query, filters);
  }

  /**
   * Obtener recursos por tipo
   */
  async getResourcesByType(
    type: ResourceType,
    query: PaginationQuery
  ): Promise<{ resources: ResourceEntity[]; meta: PaginationMeta }> {
    return await this.resourceRepository.findByType(type, query);
  }

  /**
   * Obtener recursos por categoría
   */
  async getResourcesByCategory(
    categoryId: string,
    query: PaginationQuery
  ): Promise<{ resources: ResourceEntity[]; meta: PaginationMeta }> {
    return await this.resourceRepository.findByCategory(categoryId, query);
  }

  /**
   * Obtener recursos por programa académico
   */
  async getResourcesByProgram(
    programId: string,
    query: PaginationQuery
  ): Promise<{ resources: ResourceEntity[]; meta: PaginationMeta }> {
    return await this.resourceRepository.findByProgram(programId, query);
  }

  /**
   * Obtener recursos disponibles
   */
  async getAvailableResources(query: PaginationQuery): Promise<{
    resources: ResourceEntity[];
    meta: PaginationMeta;
  }> {
    return await this.resourceRepository.findAvailable(query);
  }

  /**
   * Obtener recursos que necesitan mantenimiento
   */
  async getResourcesNeedingMaintenance(): Promise<ResourceEntity[]> {
    return await this.resourceRepository.findNeedingMaintenance();
  }

  /**
   * Actualizar recurso
   */
  async updateResource(
    id: string,
    data: Partial<ResourceEntity>
  ): Promise<ResourceEntity> {
    // Verificar que el recurso existe
    const resource = await this.getResourceById(id);

    // Invalidar cache
    if (this.redisService) {
      try {
        await this.redisService.deleteCachedWithPrefix(
          "cache",
          `${this.CACHE_PREFIX}:${id}`
        );
      } catch (error) {
        this.logger.warn("Cache invalidation error", error as Error);
      }
    }

    // Si se está actualizando el código, verificar que no exista otro recurso con ese código
    if (data.code && data.code !== resource.code) {
      const exists = await this.resourceRepository.existsByCode(data.code);
      if (exists) {
        throw new ConflictException(
          `Resource with code ${data.code} already exists`
        );
      }
    }

    // Validar atributos JSON si se están actualizando
    if (data.attributes) {
      const resourceType = data.type || resource.type;
      this.attributeValidationService.validateOrThrow(
        resourceType,
        data.attributes
      );
    }

    const updatedResource = await this.resourceRepository.update(id, data);

    // Publicar evento si se cambió la categoría
    if (data.categoryId && data.categoryId !== resource.categoryId) {
      await this.publishResourceCategoryChanged(
        id,
        resource.categoryId,
        data.categoryId,
        data.audit?.updatedBy || "system",
        "Resource category changed"
      );
    }

    // Publicar evento si se actualizaron las reglas de disponibilidad
    if (data.availabilityRules && updatedResource.availabilityRules) {
      await this.publishAvailabilityRulesUpdated(
        id,
        updatedResource.availabilityRules,
        data.audit?.updatedBy || "system",
        "Resource availability rules updated"
      );
    }

    this.logger.info("Resource updated", { resourceId: id });

    return updatedResource;
  }

  /**
   * Publicar evento de cambio de categoría de recurso
   */
  private async publishResourceCategoryChanged(
    resourceId: string,
    previousCategoryId: string,
    newCategoryId: string,
    updatedBy: string,
    reason?: string
  ): Promise<void> {
    try {
      const event = ResourceCategoryChangedEvent.create({
        resourceId,
        previousCategoryId,
        newCategoryId,
        updatedBy,
        reason,
      });

      await this.eventBusService.publish(EventType.RESOURCE_CATEGORY_CHANGED, {
        ...event,
        metadata: {
          ...event.metadata,
          aggregateId: resourceId,
          aggregateType: "Resource",
          version: 1,
        },
      });

      this.logger.info("Resource category changed event published", {
        resourceId,
        previousCategoryId,
        newCategoryId,
        eventId: event.eventId,
      });
    } catch (error) {
      this.logger.error(
        "Error publishing resource category changed event",
        error as Error,
        { resourceId }
      );
      // No lanzar error para no afectar la actualización del recurso
    }
  }

  /**
   * Publicar evento de actualización de reglas de disponibilidad
   */
  private async publishAvailabilityRulesUpdated(
    resourceId: string,
    rules: any,
    updatedBy: string,
    reason?: string
  ): Promise<void> {
    try {
      const event = AvailabilityRulesUpdatedEvent.create({
        resourceId,
        rules,
        updatedBy,
        reason,
      });

      await this.eventBusService.publish(EventType.AVAILABILITY_RULES_UPDATED, {
        ...event,
        metadata: {
          ...event.metadata,
          aggregateId: resourceId,
          aggregateType: "Resource",
          version: 1,
        },
      });

      this.logger.info("Availability rules updated event published", {
        resourceId,
        eventId: event.eventId,
      });
    } catch (error) {
      this.logger.error(
        "Error publishing availability rules updated event",
        error as Error,
        { resourceId }
      );
      // No lanzar error para no afectar la actualización del recurso
    }
  }

  /**
   * Publicar evento de cambio de estado de recurso
   */
  private async publishResourceStatusChanged(
    resourceId: string,
    previousStatus: ResourceStatus,
    newStatus: ResourceStatus,
    updatedBy: string,
    reason?: string
  ): Promise<void> {
    try {
      const event = ResourceStatusChangedEvent.create({
        resourceId,
        previousStatus,
        newStatus,
        updatedBy,
        reason,
      });

      await this.eventBusService.publish(EventType.RESOURCE_STATUS_CHANGED, {
        ...event,
        metadata: {
          ...event.metadata,
          aggregateId: resourceId,
          aggregateType: "Resource",
          version: 1,
        },
      });

      this.logger.info("Resource status changed event published", {
        resourceId,
        previousStatus,
        newStatus,
        eventId: event.eventId,
      });
    } catch (error) {
      this.logger.error(
        "Error publishing resource status changed event",
        error as Error,
        { resourceId }
      );
      // No lanzar error para no afectar la actualización del recurso
    }
  }

  /**
   * Publicar evento de recurso eliminado
   */
  private async publishResourceDeleted(
    resourceId: string,
    previousStatus: ResourceStatus,
    deletedBy: string,
    reason?: string
  ): Promise<void> {
    try {
      // Usar el evento de cambio de estado, pero indicando que fue eliminado
      const event = ResourceStatusChangedEvent.create({
        resourceId,
        previousStatus,
        newStatus: ResourceStatus.UNAVAILABLE,
        updatedBy: deletedBy,
        reason: reason || "Resource deleted",
      });

      await this.eventBusService.publish(EventType.RESOURCE_DELETED, {
        ...event,
        metadata: {
          ...event.metadata,
          aggregateId: resourceId,
          aggregateType: "Resource",
          version: 1,
        },
      });

      this.logger.info("Resource deleted event published", {
        resourceId,
        eventId: event.eventId,
      });
    } catch (error) {
      this.logger.error(
        "Error publishing resource deleted event",
        error as Error,
        { resourceId }
      );
      // No lanzar error para no afectar la eliminación del recurso
    }
  }

  /**
   * Publicar evento de recurso restaurado
   */
  private async publishResourceRestored(
    resourceId: string,
    previousStatus: ResourceStatus,
    restoredBy: string,
    reason?: string
  ): Promise<void> {
    try {
      // Usar el evento de cambio de estado, pero indicando que fue restaurado
      const event = ResourceStatusChangedEvent.create({
        resourceId,
        previousStatus,
        newStatus: ResourceStatus.AVAILABLE,
        updatedBy: restoredBy,
        reason: reason || "Resource restored",
      });

      await this.eventBusService.publish(EventType.RESOURCE_RESTORED, {
        ...event,
        metadata: {
          ...event.metadata,
          aggregateId: resourceId,
          aggregateType: "Resource",
          version: 1,
        },
      });

      this.logger.info("Resource restored event published", {
        resourceId,
        eventId: event.eventId,
      });
    } catch (error) {
      this.logger.error(
        "Error publishing resource restored event",
        error as Error,
        { resourceId }
      );
      // No lanzar error para no afectar la restauración del recurso
    }
  }

  /**
   * Eliminar recurso (soft delete)
   */
  async deleteResource(id: string, deletedBy?: string): Promise<boolean> {
    const resource = await this.getResourceById(id);

    // Invalidar cache
    if (this.redisService) {
      try {
        await this.redisService.deleteCachedWithPrefix(
          "cache",
          `${this.CACHE_PREFIX}:${id}`
        );
      } catch (error) {
        this.logger.warn("Cache invalidation error", error as Error);
      }
    }

    const deleted = await this.resourceRepository.delete(id);

    if (deleted) {
      // Publicar evento de eliminación
      await this.publishResourceDeleted(
        id,
        resource.status,
        deletedBy || "system",
        "Resource deleted"
      );

      this.logger.info("Resource deleted", { resourceId: id });
    }

    return deleted;
  }

  /**
   * Restaurar recurso eliminado
   */
  async restoreResource(id: string, restoredBy?: string): Promise<boolean> {
    // Verificar que el recurso existe
    const resource = await this.getResourceById(id);

    if (resource.isActive) {
      throw new ConflictException(
        `Resource with ID ${id} is already active and not deleted`
      );
    }

    const restored = await this.resourceRepository.restore(id);

    if (restored) {
      // Publicar evento de restauración
      await this.publishResourceRestored(
        id,
        resource.status,
        restoredBy || "system",
        "Resource restored"
      );

      this.logger.info("Resource restored", { resourceId: id });
    }

    return restored;
  }

  /**
   * Actualizar estado de recurso
   */
  async updateResourceStatus(
    id: string,
    status: ResourceStatus,
    updatedBy?: string,
    reason?: string
  ): Promise<void> {
    // Verificar que el recurso existe
    const resource = await this.getResourceById(id);
    const previousStatus = resource.status;

    await this.resourceRepository.updateStatus(id, status);

    // Publicar evento de cambio de estado
    await this.publishResourceStatusChanged(
      id,
      previousStatus,
      status,
      updatedBy || "system",
      reason
    );

    this.logger.info("Resource status updated", { resourceId: id, status });
  }

  /**
   * Activar recurso
   */
  async activateResource(id: string): Promise<ResourceEntity> {
    const resource = await this.getResourceById(id);
    resource.activate();
    return await this.resourceRepository.update(id, {
      isActive: true,
      status: ResourceStatus.AVAILABLE,
    });
  }

  /**
   * Desactivar recurso
   */
  async deactivateResource(id: string): Promise<ResourceEntity> {
    const resource = await this.getResourceById(id);
    resource.deactivate();
    return await this.resourceRepository.update(id, {
      isActive: false,
      status: ResourceStatus.UNAVAILABLE,
    });
  }

  /**
   * Marcar recurso en mantenimiento
   */
  async setResourceMaintenance(id: string): Promise<ResourceEntity> {
    const resource = await this.getResourceById(id);
    resource.setMaintenance();
    return await this.resourceRepository.update(id, {
      status: ResourceStatus.MAINTENANCE,
    });
  }

  /**
   * Contar recursos
   */
  async countResources(filters?: {
    isActive?: boolean;
    status?: ResourceStatus;
  }): Promise<number> {
    return await this.resourceRepository.count(filters);
  }

  /**
   * Buscar recursos por ubicación
   */
  async getResourcesByLocation(
    location: string,
    query: PaginationQuery
  ): Promise<{ resources: ResourceEntity[]; meta: PaginationMeta }> {
    return await this.resourceRepository.findByLocation(location, query);
  }

  /**
   * Búsqueda avanzada de recursos
   */
  async searchResourcesAdvanced(filters: {
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
  }): Promise<{ resources: ResourceEntity[]; meta: PaginationMeta }> {
    this.logger.info("Advanced search requested", {
      filters: {
        types: filters.types,
        minCapacity: filters.minCapacity,
        maxCapacity: filters.maxCapacity,
        hasEquipment: filters.hasEquipment,
      },
    });

    return await this.resourceRepository.searchAdvanced(filters);
  }
}
