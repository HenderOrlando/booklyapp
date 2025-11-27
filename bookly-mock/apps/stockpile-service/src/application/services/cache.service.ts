import { createLogger } from "@libs/common";
import { RedisService } from "@libs/redis";
import { Injectable } from "@nestjs/common";
import { UserData } from "../../infrastructure/clients/auth-service.client";

/**
 * Resource Data for caching
 */
export interface ResourceData {
  id: string;
  name: string;
  type: string;
  location?: string;
  capacity?: number;
  metadata?: Record<string, any>;
}

/**
 * Cache Service
 * Servicio para gestión de caché Redis de usuarios y recursos
 */
@Injectable()
export class CacheService {
  private readonly userTTL = 3600; // 1 hora en segundos
  private readonly resourceTTL = 1800; // 30 minutos en segundos
  private readonly logger = createLogger("CacheService");

  constructor(private readonly redisService: RedisService) {}

  /**
   * Caché de Usuario
   */

  async cacheUser(userId: string, userData: UserData): Promise<void> {
    try {
      const key = this.getUserCacheKey(userId);
      await this.redisService.set(key, userData, { key, ttl: this.userTTL });
      this.logger.debug("User cached in Redis", { userId, ttl: this.userTTL });
    } catch (error) {
      this.logger.error("Error caching user", error as Error, { userId });
    }
  }

  async getCachedUser(userId: string): Promise<UserData | null> {
    try {
      const key = this.getUserCacheKey(userId);
      const cached = await this.redisService.get<UserData>(key);

      if (cached) {
        this.logger.debug("User cache hit (Redis)", { userId });
        return cached;
      }

      this.logger.debug("User cache miss (Redis)", { userId });
      return null;
    } catch (error) {
      this.logger.error("Error getting cached user", error as Error, {
        userId,
      });
      return null;
    }
  }

  async invalidateUser(userId: string): Promise<void> {
    try {
      const key = this.getUserCacheKey(userId);
      await this.redisService.del(key);
      this.logger.debug("User cache invalidated (Redis)", { userId });
    } catch (error) {
      this.logger.error("Error invalidating user cache", error as Error, {
        userId,
      });
    }
  }

  /**
   * Caché de Recurso
   */

  async cacheResource(
    resourceId: string,
    resourceData: ResourceData
  ): Promise<void> {
    try {
      const key = this.getResourceCacheKey(resourceId);
      await this.redisService.set(key, resourceData, {
        key,
        ttl: this.resourceTTL,
      });
      this.logger.debug("Resource cached in Redis", {
        resourceId,
        ttl: this.resourceTTL,
      });
    } catch (error) {
      this.logger.error("Error caching resource", error as Error, {
        resourceId,
      });
    }
  }

  async getCachedResource(resourceId: string): Promise<ResourceData | null> {
    try {
      const key = this.getResourceCacheKey(resourceId);
      const cached = await this.redisService.get<ResourceData>(key);

      if (cached) {
        this.logger.debug("Resource cache hit (Redis)", { resourceId });
        return cached;
      }

      this.logger.debug("Resource cache miss (Redis)", { resourceId });
      return null;
    } catch (error) {
      this.logger.error("Error getting cached resource", error as Error, {
        resourceId,
      });
      return null;
    }
  }

  async invalidateResource(resourceId: string): Promise<void> {
    try {
      const key = this.getResourceCacheKey(resourceId);
      await this.redisService.del(key);
      this.logger.debug("Resource cache invalidated (Redis)", { resourceId });
    } catch (error) {
      this.logger.error("Error invalidating resource cache", error as Error, {
        resourceId,
      });
    }
  }

  /**
   * Batch operations
   */

  async cacheUsers(users: Map<string, UserData>): Promise<void> {
    const promises = Array.from(users.entries()).map(([userId, userData]) =>
      this.cacheUser(userId, userData)
    );

    await Promise.all(promises);
    this.logger.info("Batch users cached in Redis", { count: users.size });
  }

  async getCachedUsers(userIds: string[]): Promise<Map<string, UserData>> {
    const results = new Map<string, UserData>();

    const promises = userIds.map(async (userId) => {
      const userData = await this.getCachedUser(userId);
      if (userData) {
        results.set(userId, userData);
      }
    });

    await Promise.all(promises);
    this.logger.info("Batch users retrieved from Redis cache", {
      requested: userIds.length,
      found: results.size,
    });

    return results;
  }

  /**
   * Utilidades
   */

  private getUserCacheKey(userId: string): string {
    return `stockpile:user:${userId}`;
  }

  private getResourceCacheKey(resourceId: string): string {
    return `stockpile:resource:${resourceId}`;
  }

  /**
   * Estadísticas de caché
   */

  async getCacheStats(): Promise<{
    users: { total: number };
    resources: { total: number };
    isHealthy: boolean;
  }> {
    try {
      const userKeys = await this.redisService.keys("stockpile:user:*");
      const resourceKeys = await this.redisService.keys("stockpile:resource:*");
      const isHealthy = await this.redisService.isHealthy();

      return {
        users: { total: userKeys.length },
        resources: { total: resourceKeys.length },
        isHealthy,
      };
    } catch (error) {
      this.logger.error("Error getting cache stats", error as Error);
      return {
        users: { total: 0 },
        resources: { total: 0 },
        isHealthy: false,
      };
    }
  }

  /**
   * Limpiar todo el caché de stockpile
   */

  async clearAll(): Promise<void> {
    try {
      const keys = await this.redisService.keys("stockpile:*");

      if (keys.length > 0) {
        await this.redisService.delMany(keys);
        this.logger.info("All stockpile cache cleared from Redis", {
          keysDeleted: keys.length,
        });
      }
    } catch (error) {
      this.logger.error("Error clearing cache", error as Error);
    }
  }
}
