import type { RecurringReservationResponseDto } from "@availability/infrastructure/dtos";
import { createLogger } from "@libs/common";
import { RedisService } from "@libs/redis";
import { Injectable } from "@nestjs/common";

const logger = createLogger("RecurringReservationCacheService");

/**
 * Servicio de caché para series recurrentes
 * Gestiona el almacenamiento en Redis de series y sus instancias
 */
@Injectable()
export class RecurringReservationCacheService {
  private readonly CACHE_TTL = 300; // 5 minutos
  private readonly CACHE_PREFIX = "recurring_series";
  private readonly USER_SERIES_PREFIX = "user_recurring_series";

  constructor(private readonly redisService: RedisService) {}

  /**
   * Obtiene una serie recurrente desde caché
   */
  async getSeriesFromCache(seriesId: string): Promise<any | null> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:${seriesId}`;
      const cached = await this.redisService.get(cacheKey);

      if (cached) {
        logger.debug("Series retrieved from cache", { seriesId });
        return JSON.parse(cached);
      }

      return null;
    } catch (error) {
      logger.error(
        `Error retrieving series from cache: ${seriesId}`,
        error as Error
      );
      return null;
    }
  }

  /**
   * Guarda una serie recurrente en caché
   */
  async setSeriesToCache(
    seriesId: string,
    data: RecurringReservationResponseDto | any,
    ttl: number = this.CACHE_TTL
  ): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:${seriesId}`;
      await this.redisService.set(cacheKey, data, { ttl, key: cacheKey });

      logger.debug("Series cached successfully", { seriesId, ttl });
    } catch (error) {
      logger.error(`Error caching series: ${seriesId}`, error as Error);
    }
  }

  /**
   * Invalida el caché de una serie específica
   */
  async invalidateSeries(seriesId: string): Promise<void> {
    try {
      const cacheKey = `${this.CACHE_PREFIX}:${seriesId}`;
      await this.redisService.del(cacheKey);

      logger.debug("Series cache invalidated", { seriesId });
    } catch (error) {
      logger.error(
        `Error invalidating series cache: ${seriesId}`,
        error as Error
      );
    }
  }

  /**
   * Obtiene las series de un usuario desde caché
   */
  async getUserSeriesFromCache(
    userId: string,
    filters: string
  ): Promise<any | null> {
    try {
      const cacheKey = `${this.USER_SERIES_PREFIX}:${userId}:${filters}`;
      const cached = await this.redisService.get(cacheKey);

      if (cached) {
        logger.debug("User series retrieved from cache", { userId });
        return JSON.parse(cached);
      }

      return null;
    } catch (error) {
      logger.error(
        `Error retrieving user series from cache: ${userId}`,
        error as Error
      );
      return null;
    }
  }

  /**
   * Guarda las series de un usuario en caché
   */
  async setUserSeriesToCache(
    userId: string,
    filters: string,
    data: any,
    ttl: number = this.CACHE_TTL
  ): Promise<void> {
    try {
      const cacheKey = `${this.USER_SERIES_PREFIX}:${userId}:${filters}`;
      await this.redisService.set(cacheKey, data, { ttl, key: cacheKey });

      logger.debug("User series cached successfully", { userId, ttl });
    } catch (error) {
      logger.error(`Error caching user series: ${userId}`, error as Error);
    }
  }

  /**
   * Invalida todas las series cacheadas de un usuario
   */
  async invalidateUserSeries(userId: string): Promise<void> {
    try {
      const pattern = `${this.USER_SERIES_PREFIX}:${userId}:*`;
      const keys = await this.redisService.keys(pattern);

      if (keys && keys.length > 0) {
        await Promise.all(keys.map((key) => this.redisService.del(key)));
        logger.debug("User series cache invalidated", {
          userId,
          keysDeleted: keys.length,
        });
      }
    } catch (error) {
      logger.error(
        `Error invalidating user series cache: ${userId}`,
        error as Error
      );
    }
  }

  /**
   * Guarda la disponibilidad validada de una serie en caché
   * Útil para evitar revalidaciones frecuentes
   */
  async cacheAvailabilityValidation(
    resourceId: string,
    dates: Date[],
    isAvailable: boolean,
    ttl: number = 60
  ): Promise<void> {
    try {
      const cacheKey = `availability:${resourceId}:${dates
        .map((d) => d.toISOString())
        .join("_")}`;
      await this.redisService.set(
        cacheKey,
        { isAvailable, validatedAt: new Date() },
        { ttl, key: cacheKey }
      );

      logger.debug("Availability validation cached", { resourceId, ttl });
    } catch (error) {
      logger.error(
        `Error caching availability validation: ${resourceId}`,
        error as Error
      );
    }
  }

  /**
   * Obtiene la validación de disponibilidad desde caché
   */
  async getCachedAvailabilityValidation(
    resourceId: string,
    dates: Date[]
  ): Promise<{ isAvailable: boolean; validatedAt: Date } | null> {
    try {
      const cacheKey = `availability:${resourceId}:${dates
        .map((d) => d.toISOString())
        .join("_")}`;
      const cached = await this.redisService.get(cacheKey);

      if (cached) {
        logger.debug("Availability validation retrieved from cache", {
          resourceId,
        });
        return JSON.parse(cached);
      }

      return null;
    } catch (error) {
      logger.error(
        `Error retrieving availability validation from cache: ${resourceId}`,
        error as Error
      );
      return null;
    }
  }

  /**
   * Invalida el caché de disponibilidad de un recurso
   */
  async invalidateAvailabilityCache(resourceId: string): Promise<void> {
    try {
      const pattern = `availability:${resourceId}:*`;
      const keys = await this.redisService.keys(pattern);

      if (keys && keys.length > 0) {
        await Promise.all(keys.map((key) => this.redisService.del(key)));
        logger.debug("Availability cache invalidated", {
          resourceId,
          keysDeleted: keys.length,
        });
      }
    } catch (error) {
      logger.error(
        `Error invalidating availability cache: ${resourceId}`,
        error as Error
      );
    }
  }

  /**
   * Limpia todo el caché de series recurrentes
   */
  async clearAllCache(): Promise<void> {
    try {
      const patterns = [
        `${this.CACHE_PREFIX}:*`,
        `${this.USER_SERIES_PREFIX}:*`,
        `availability:*`,
      ];

      for (const pattern of patterns) {
        const keys = await this.redisService.keys(pattern);
        if (keys && keys.length > 0) {
          await Promise.all(keys.map((key) => this.redisService.del(key)));
        }
      }

      logger.info("All recurring series cache cleared");
    } catch (error) {
      logger.error("Error clearing all cache", error as Error);
    }
  }
}
