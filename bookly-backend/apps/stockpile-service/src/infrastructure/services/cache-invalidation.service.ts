import { REDIS_PREFIXES } from "@libs/common/constants";
import { createLogger } from "@libs/common";
import { RedisService } from "@libs/redis";
import { Injectable } from "@nestjs/common";

const logger = createLogger("CacheInvalidationService");

/**
 * Cache Invalidation Service
 * Servicio para invalidar cache cuando hay cambios en las aprobaciones
 * RF-23: Invalidar cache al aprobar/rechazar
 */
@Injectable()
export class CacheInvalidationService {
  constructor(private readonly redisService: RedisService) {}

  /**
   * Invalida todas las entradas de cache relacionadas con aprobaciones activas
   * Se llama cuando se aprueba, rechaza o cancela una solicitud
   */
  async invalidateActiveApprovalsCache(): Promise<void> {
    try {
      logger.info("Invalidating active approvals cache");

      // Obtener todas las claves del cache con el patrón
      const pattern = `${REDIS_PREFIXES.CACHE}active-approvals:*`;
      const keys = await this.redisService.keys(pattern);

      if (keys.length > 0) {
        await this.redisService.delMany(keys);
      }

      logger.info("Active approvals cache invalidated", {
        keysRemoved: keys.length,
      });
    } catch (error) {
      logger.error(
        "Error invalidating active approvals cache",
        error as Error,
        {}
      );
    }
  }

  /**
   * Invalida el cache para una fecha específica
   */
  async invalidateCacheForDate(date: Date): Promise<void> {
    try {
      const dateStr = date.toISOString().split("T")[0];
      logger.info("Invalidating cache for specific date", { date: dateStr });

      const pattern = `${REDIS_PREFIXES.CACHE}active-approvals:${dateStr}:*`;
      const keys = await this.redisService.keys(pattern);

      if (keys.length > 0) {
        await this.redisService.delMany(keys);
      }

      logger.info("Cache invalidated for date", {
        date: dateStr,
        keysRemoved: keys.length,
      });
    } catch (error) {
      logger.error("Error invalidating cache for date", error as Error, {
        date: date.toISOString(),
      });
    }
  }
}
