import { createLogger } from "@libs/common";
import { RedisService } from "@libs/redis";
import { HttpException, Injectable } from "@nestjs/common";

interface RateLimitConfig {
  points: number; // Número de requests permitidos
  duration: number; // Ventana de tiempo en segundos
  blockDuration: number; // Tiempo de bloqueo en segundos si excede
}

/**
 * Rate Limiter Service con Redis
 * Implementa rate limiting distribuido usando Redis
 * Permite que múltiples instancias del API Gateway compartan el estado
 */
@Injectable()
export class RateLimiterRedisService {
  private readonly logger = createLogger("RateLimiterRedis");

  // Configuraciones por tipo
  private readonly configs = {
    // Por usuario global
    user: {
      points: 100, // 100 requests
      duration: 60, // por minuto
      blockDuration: 300, // bloquear 5 minutos
    },
    // Por servicio
    service: {
      points: 1000, // 1000 requests
      duration: 60, // por minuto
      blockDuration: 60, // bloquear 1 minuto
    },
    // Por IP (sin autenticación)
    ip: {
      points: 20, // 20 requests
      duration: 60, // por minuto
      blockDuration: 600, // bloquear 10 minutos
    },
  };

  constructor(private readonly redis: RedisService) {}

  /**
   * Verificar rate limit para un usuario
   */
  async checkUserLimit(userId: string): Promise<void> {
    const key = `user:${userId}`;
    await this.checkLimit(key, this.configs.user, `User ${userId}`);
  }

  /**
   * Verificar rate limit para un servicio
   */
  async checkServiceLimit(userId: string, service: string): Promise<void> {
    const key = `service:${userId}:${service}`;
    await this.checkLimit(
      key,
      this.configs.service,
      `User ${userId} on service ${service}`
    );
  }

  /**
   * Verificar rate limit por IP (para requests sin autenticación)
   */
  async checkIpLimit(ip: string): Promise<void> {
    const key = `ip:${ip}`;
    await this.checkLimit(key, this.configs.ip, `IP ${ip}`);
  }

  /**
   * Verificar límite genérico usando Redis
   */
  private async checkLimit(
    key: string,
    config: RateLimitConfig,
    identifier: string
  ): Promise<void> {
    try {
      const rateLimitKey = `rate-limit:${key}`;
      const blockKey = `rate-limit:block:${key}`;

      // 1. Verificar si está bloqueado
      const isBlocked = await this.redis.exists(blockKey);
      if (isBlocked) {
        const ttl = await this.redis.ttl(blockKey);
        this.logger.warn(
          `${identifier} is blocked (remainingTime: ${ttl}s)`
        );
        throw new HttpException(
          {
            statusCode: 429,
            message: "Too many requests",
            error: "Rate limit exceeded",
            retryAfter: ttl,
          },
          429
        );
      }

      // 2. Incrementar contador en Redis
      const count = await this.redis.incr(rateLimitKey);

      // Si es el primer incremento, establecer TTL
      if (count === 1) {
        await this.redis.expire(rateLimitKey, config.duration);
      }

      // Obtener TTL restante
      const ttl = await this.redis.ttl(rateLimitKey);

      // 3. Verificar si excede el límite
      if (count > config.points) {
        // Bloquear la clave
        await this.redis.set(blockKey, "1", {
          key: blockKey,
          ttl: config.blockDuration,
        });

        this.logger.error(
          `${identifier} exceeded limit - points: ${count}, limit: ${config.points}, blockDuration: ${config.blockDuration}s`
        );

        throw new HttpException(
          {
            statusCode: 429,
            message: "Too many requests",
            error: "Rate limit exceeded",
            retryAfter: config.blockDuration,
          },
          429
        );
      }

      // 4. Warning si se acerca al límite (>80%)
      if (count > config.points * 0.8) {
        this.logger.warn(
          `${identifier} approaching limit (${count}/${config.points})`
        );
      }

      // Log de debug para monitoreo
      this.logger.debug(
        `${identifier} rate limit check passed (${count}/${config.points}, resetIn: ${ttl}s)`
      );
    } catch (error) {
      // Si es un HttpException (429), propagarlo
      if (error instanceof HttpException) {
        throw error;
      }

      // Si es error de Redis, loguear pero permitir el request (fail-open)
      this.logger.error(
        `Redis error in rate limiter for ${identifier}, allowing request`,
        error
      );
    }
  }

  /**
   * Configurar límite personalizado para un usuario (usuarios VIP)
   */
  async setCustomLimit(
    userId: string,
    points: number,
    duration: number
  ): Promise<void> {
    const key = `custom:user:${userId}`;
    const config = { points, duration };

    await this.redis.set(key, config, { key, ttl: 86400 }); // 24 horas
    this.logger.info(
      `Custom limit set for user ${userId}: ${points} requests per ${duration}s`
    );
  }

  /**
   * Obtener información del rate limit actual
   */
  async getRateLimitInfo(key: string): Promise<{
    points: number;
    limit: number;
    remaining: number;
    resetTime: number;
  } | null> {
    try {
      const rateLimitKey = `rate-limit:${key}`;
      const value = await this.redis.get<string>(rateLimitKey);
      const count = value ? parseInt(value, 10) : 0;
      const config = this.getConfigForKey(key);
      const ttl = await this.redis.ttl(rateLimitKey);

      return {
        points: count,
        limit: config.points,
        remaining: Math.max(0, config.points - count),
        resetTime: Date.now() + ttl * 1000,
      };
    } catch {
      return null;
    }
  }

  /**
   * Obtener configuración según el tipo de key
   */
  private getConfigForKey(key: string): RateLimitConfig {
    if (key.startsWith("user:")) return this.configs.user;
    if (key.startsWith("service:")) return this.configs.service;
    if (key.startsWith("ip:")) return this.configs.ip;
    return this.configs.user; // Default
  }

  /**
   * Limpiar registros expirados (no necesario con Redis, se auto-limpia con TTL)
   */
  async cleanExpiredRecords(): Promise<void> {
    // Redis maneja esto automáticamente con TTL
    this.logger.debug("Redis handles expiration automatically via TTL");
  }

  /**
   * Obtener estadísticas generales
   */
  async getStats(): Promise<{
    totalKeys: number;
    blockedKeys: number;
  }> {
    try {
      const allKeys = await this.redis.keys("rate-limit:*");
      const blockKeys = await this.redis.keys("rate-limit:block:*");

      return {
        totalKeys: allKeys.length,
        blockedKeys: blockKeys.length,
      };
    } catch (error) {
      this.logger.error("Error getting rate limiter stats", error);
      return { totalKeys: 0, blockedKeys: 0 };
    }
  }

  /**
   * Resetear límite para un usuario (admin function)
   */
  async resetLimit(key: string): Promise<void> {
    await this.redis.del(`rate-limit:${key}`);
    await this.redis.del(`rate-limit:block:${key}`);
    this.logger.info(`Rate limit reset for key: ${key}`);
  }
}
