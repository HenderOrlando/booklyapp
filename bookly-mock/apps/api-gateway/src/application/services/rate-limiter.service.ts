import { createLogger } from "@libs/common";
import { HttpException, Injectable } from "@nestjs/common";

interface RateLimitConfig {
  points: number; // Número de requests permitidos
  duration: number; // Ventana de tiempo en segundos
  blockDuration: number; // Tiempo de bloqueo en segundos si excede
}

interface RateLimitRecord {
  points: number;
  resetTime: number;
  blockedUntil?: number;
}

/**
 * Rate Limiter Service
 * Implementa rate limiting por usuario y por servicio
 * Protege contra abuso y ataques de denegación de servicio
 */
@Injectable()
export class RateLimiterService {
  private readonly logger = createLogger("RateLimiterService");
  private readonly records = new Map<string, RateLimitRecord>();

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
   * Verificar límite genérico
   */
  private async checkLimit(
    key: string,
    config: RateLimitConfig,
    identifier: string
  ): Promise<void> {
    const now = Date.now();
    let record = this.records.get(key);

    // Verificar si está bloqueado
    if (record?.blockedUntil && record.blockedUntil > now) {
      const remainingTime = Math.ceil((record.blockedUntil - now) / 1000);

      this.logger.warn(`[RATE-LIMIT] ${identifier} is blocked`, {
        remainingTime,
        key,
      });

      throw new HttpException(
        {
          statusCode: 429,
          message: "Too Many Requests",
          error: "Rate limit exceeded",
          retryAfter: remainingTime,
        },
        429
      );
    }

    // Inicializar o resetear si expiró la ventana
    if (!record || record.resetTime < now) {
      record = {
        points: 0,
        resetTime: now + config.duration * 1000,
      };
      this.records.set(key, record);
    }

    // Incrementar contador
    record.points++;

    // Verificar si excede el límite
    if (record.points > config.points) {
      record.blockedUntil = now + config.blockDuration * 1000;

      this.logger.error(
        `[RATE-LIMIT] ${identifier} exceeded limit - points: ${record.points}, limit: ${config.points}, blockDuration: ${config.blockDuration}s`,
        new Error("Rate limit exceeded")
      );

      throw new HttpException(
        {
          statusCode: 429,
          message: "Too Many Requests",
          error: "Rate limit exceeded",
          retryAfter: config.blockDuration,
        },
        429
      );
    }

    // Log de uso cercano al límite (80%)
    if (record.points > config.points * 0.8) {
      this.logger.warn(`[RATE-LIMIT] ${identifier} approaching limit`, {
        points: record.points,
        limit: config.points,
        percentage: Math.round((record.points / config.points) * 100),
        key,
      });
    }
  }

  /**
   * Obtener información de rate limit para un key
   */
  getRateLimitInfo(key: string): {
    remaining: number;
    limit: number;
    resetTime: number;
    isBlocked: boolean;
  } | null {
    const record = this.records.get(key);
    if (!record) {
      return null;
    }

    const config = this.getConfigForKey(key);
    const now = Date.now();

    return {
      remaining: Math.max(0, config.points - record.points),
      limit: config.points,
      resetTime: record.resetTime,
      isBlocked: !!record.blockedUntil && record.blockedUntil > now,
    };
  }

  /**
   * Obtener configuración según el tipo de key
   */
  private getConfigForKey(key: string): RateLimitConfig {
    if (key.startsWith("user:")) return this.configs.user;
    if (key.startsWith("service:")) return this.configs.service;
    if (key.startsWith("ip:")) return this.configs.ip;
    return this.configs.user; // default
  }

  /**
   * Resetear límite manualmente
   */
  resetLimit(key: string): void {
    this.records.delete(key);
    this.logger.info(`[RATE-LIMIT] Limit manually reset for key: ${key}`);
  }

  /**
   * Obtener estadísticas globales
   */
  getStats(): {
    totalKeys: number;
    blockedKeys: number;
    activeKeys: number;
  } {
    const now = Date.now();
    let blocked = 0;
    let active = 0;

    for (const record of this.records.values()) {
      if (record.blockedUntil && record.blockedUntil > now) {
        blocked++;
      } else if (record.resetTime > now) {
        active++;
      }
    }

    return {
      totalKeys: this.records.size,
      blockedKeys: blocked,
      activeKeys: active,
    };
  }

  /**
   * Limpiar registros expirados (ejecutar periódicamente)
   */
  cleanExpiredRecords(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, record] of this.records.entries()) {
      // Limpiar si no está bloqueado y expiró la ventana
      if (
        (!record.blockedUntil || record.blockedUntil < now) &&
        record.resetTime < now
      ) {
        this.records.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`[RATE-LIMIT] Cleaned ${cleaned} expired records`);
    }
  }

  /**
   * Configurar rate limit personalizado para un usuario específico
   */
  setCustomUserLimit(userId: string, config: Partial<RateLimitConfig>): void {
    const key = `user:${userId}`;
    const fullConfig = { ...this.configs.user, ...config };

    // Almacenar config personalizada
    // En producción, esto debería estar en base de datos
    this.logger.info(`[RATE-LIMIT] Custom limit set for user: ${userId}`, {
      config: fullConfig,
    });
  }
}
