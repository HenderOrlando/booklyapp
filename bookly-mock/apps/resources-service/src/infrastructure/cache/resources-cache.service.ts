import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@libs/redis';

/**
 * Cache Service para Resources Service
 * 
 * Gestiona cache de:
 * - Recursos (salas, equipos, etc.)
 * - Categorías
 * - Mantenimientos
 * - Estado de recursos
 */
@Injectable()
export class ResourcesCacheService {
  private readonly logger = new Logger(ResourcesCacheService.name);
  
  // Prefijos de cache
  private readonly PREFIXES = {
    RESOURCE: 'res:resource:',
    RESOURCE_LIST: 'res:list:',
    CATEGORY: 'res:category:',
    CATEGORY_LIST: 'res:categories',
    MAINTENANCE: 'res:maintenance:',
    RESOURCE_STATUS: 'res:status:',
    SEARCH_RESULTS: 'res:search:',
  };

  // TTL por tipo de dato (en segundos)
  private readonly TTL = {
    RESOURCE: 600, // 10 minutos
    RESOURCE_LIST: 300, // 5 minutos
    CATEGORY: 1800, // 30 minutos
    CATEGORY_LIST: 1800, // 30 minutos
    MAINTENANCE: 300, // 5 minutos
    RESOURCE_STATUS: 180, // 3 minutos
    SEARCH_RESULTS: 120, // 2 minutos
  };

  constructor(private readonly redis: RedisService) {}

  /**
   * Cache de recursos individuales
   */
  async cacheResource(resourceId: string, resource: any): Promise<void> {
    const key = `${this.PREFIXES.RESOURCE}${resourceId}`;
    await this.redis.set(key, resource, { key, ttl: this.TTL.RESOURCE });
    this.logger.debug(`Cached resource ${resourceId}`);
  }

  async getResource(resourceId: string): Promise<any | null> {
    const key = `${this.PREFIXES.RESOURCE}${resourceId}`;
    return await this.redis.get(key);
  }

  async invalidateResource(resourceId: string): Promise<void> {
    const key = `${this.PREFIXES.RESOURCE}${resourceId}`;
    await this.redis.del(key);
    this.logger.debug(`Invalidated resource cache ${resourceId}`);
  }

  /**
   * Cache de lista de recursos
   */
  async cacheResourceList(filters: string, resources: any[]): Promise<void> {
    const key = `${this.PREFIXES.RESOURCE_LIST}${filters}`;
    await this.redis.set(key, resources, { key, ttl: this.TTL.RESOURCE_LIST });
    this.logger.debug(`Cached resource list with filters: ${filters}`);
  }

  async getResourceList(filters: string): Promise<any[] | null> {
    const key = `${this.PREFIXES.RESOURCE_LIST}${filters}`;
    return await this.redis.get(key);
  }

  async invalidateResourceLists(): Promise<void> {
    const keys = await this.redis.keys(`${this.PREFIXES.RESOURCE_LIST}*`);
    if (keys.length > 0) {
      await this.redis.delMany(keys);
      this.logger.debug(`Invalidated ${keys.length} resource list caches`);
    }
  }

  /**
   * Cache de categorías
   */
  async cacheCategory(categoryId: string, category: any): Promise<void> {
    const key = `${this.PREFIXES.CATEGORY}${categoryId}`;
    await this.redis.set(key, category, { key, ttl: this.TTL.CATEGORY });
    this.logger.debug(`Cached category ${categoryId}`);
  }

  async getCategory(categoryId: string): Promise<any | null> {
    const key = `${this.PREFIXES.CATEGORY}${categoryId}`;
    return await this.redis.get(key);
  }

  async invalidateCategory(categoryId: string): Promise<void> {
    const key = `${this.PREFIXES.CATEGORY}${categoryId}`;
    await this.redis.del(key);
    this.logger.debug(`Invalidated category cache ${categoryId}`);
  }

  /**
   * Cache de lista de categorías
   */
  async cacheCategoryList(categories: any[]): Promise<void> {
    const key = this.PREFIXES.CATEGORY_LIST;
    await this.redis.set(key, categories, { key, ttl: this.TTL.CATEGORY_LIST });
    this.logger.debug('Cached category list');
  }

  async getCategoryList(): Promise<any[] | null> {
    const key = this.PREFIXES.CATEGORY_LIST;
    return await this.redis.get(key);
  }

  async invalidateCategoryList(): Promise<void> {
    const key = this.PREFIXES.CATEGORY_LIST;
    await this.redis.del(key);
    this.logger.debug('Invalidated category list cache');
  }

  /**
   * Cache de mantenimientos
   */
  async cacheMaintenance(maintenanceId: string, maintenance: any): Promise<void> {
    const key = `${this.PREFIXES.MAINTENANCE}${maintenanceId}`;
    await this.redis.set(key, maintenance, { key, ttl: this.TTL.MAINTENANCE });
    this.logger.debug(`Cached maintenance ${maintenanceId}`);
  }

  async getMaintenance(maintenanceId: string): Promise<any | null> {
    const key = `${this.PREFIXES.MAINTENANCE}${maintenanceId}`;
    return await this.redis.get(key);
  }

  async invalidateMaintenance(maintenanceId: string): Promise<void> {
    const key = `${this.PREFIXES.MAINTENANCE}${maintenanceId}`;
    await this.redis.del(key);
    this.logger.debug(`Invalidated maintenance cache ${maintenanceId}`);
  }

  /**
   * Cache de estado de recurso
   */
  async cacheResourceStatus(resourceId: string, status: any): Promise<void> {
    const key = `${this.PREFIXES.RESOURCE_STATUS}${resourceId}`;
    await this.redis.set(key, status, { key, ttl: this.TTL.RESOURCE_STATUS });
    this.logger.debug(`Cached status for resource ${resourceId}`);
  }

  async getResourceStatus(resourceId: string): Promise<any | null> {
    const key = `${this.PREFIXES.RESOURCE_STATUS}${resourceId}`;
    return await this.redis.get(key);
  }

  async invalidateResourceStatus(resourceId: string): Promise<void> {
    const key = `${this.PREFIXES.RESOURCE_STATUS}${resourceId}`;
    await this.redis.del(key);
    this.logger.debug(`Invalidated status cache for resource ${resourceId}`);
  }

  /**
   * Cache de resultados de búsqueda avanzada
   */
  async cacheSearchResults(searchHash: string, results: any[]): Promise<void> {
    const key = `${this.PREFIXES.SEARCH_RESULTS}${searchHash}`;
    await this.redis.set(key, results, { key, ttl: this.TTL.SEARCH_RESULTS });
    this.logger.debug(`Cached search results for hash ${searchHash}`);
  }

  async getSearchResults(searchHash: string): Promise<any[] | null> {
    const key = `${this.PREFIXES.SEARCH_RESULTS}${searchHash}`;
    return await this.redis.get(key);
  }

  /**
   * Invalidar todo el cache relacionado con un recurso
   */
  async invalidateAllResourceCache(resourceId: string): Promise<void> {
    const keysToDelete = [
      `${this.PREFIXES.RESOURCE}${resourceId}`,
      `${this.PREFIXES.RESOURCE_STATUS}${resourceId}`,
    ];

    await this.redis.delMany(keysToDelete);
    
    // También invalidar listas que puedan contener este recurso
    await this.invalidateResourceLists();

    this.logger.log(`Invalidated all cache for resource ${resourceId}`);
  }

  /**
   * Invalidar cache de categoría y sus recursos
   */
  async invalidateCategoryAndResources(categoryId: string): Promise<void> {
    await this.invalidateCategory(categoryId);
    await this.invalidateCategoryList();
    await this.invalidateResourceLists();
    
    this.logger.log(`Invalidated cache for category ${categoryId} and related resources`);
  }

  /**
   * Obtener estadísticas de cache
   */
  async getCacheStats(): Promise<any> {
    const stats = {
      resources: 0,
      resourceLists: 0,
      categories: 0,
      maintenances: 0,
      resourceStatuses: 0,
      searchResults: 0,
    };

    try {
      stats.resources = (await this.redis.keys(`${this.PREFIXES.RESOURCE}*`)).length;
      stats.resourceLists = (await this.redis.keys(`${this.PREFIXES.RESOURCE_LIST}*`)).length;
      stats.categories = (await this.redis.keys(`${this.PREFIXES.CATEGORY}*`)).length;
      stats.maintenances = (await this.redis.keys(`${this.PREFIXES.MAINTENANCE}*`)).length;
      stats.resourceStatuses = (await this.redis.keys(`${this.PREFIXES.RESOURCE_STATUS}*`)).length;
      stats.searchResults = (await this.redis.keys(`${this.PREFIXES.SEARCH_RESULTS}*`)).length;
    } catch (error) {
      this.logger.error('Error getting cache stats', error);
    }

    return stats;
  }

  /**
   * Limpiar todo el cache del servicio (usar con precaución)
   */
  async clearAllCache(): Promise<void> {
    const allPrefixes = Object.values(this.PREFIXES);
    
    for (const prefix of allPrefixes) {
      const keys = await this.redis.keys(`${prefix}*`);
      if (keys.length > 0) {
        await this.redis.delMany(keys);
      }
    }

    this.logger.warn('Cleared all resources cache');
  }
}
