import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";

export interface CacheMetrics {
  serviceName: string;
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
  lastReset: Date;
}

/**
 * CacheMetricsService
 * Servicio para rastrear métricas de cache (hit/miss ratio)
 * Reutilizable en todos los microservicios
 */
@Injectable()
export class CacheMetricsService {
  private readonly logger = createLogger("CacheMetricsService");
  private hits = 0;
  private misses = 0;
  private lastReset = new Date();

  constructor(private readonly serviceName: string) {
    this.logger.info(`Cache metrics initialized for ${serviceName}`);
  }

  /**
   * Registrar un cache hit
   */
  recordHit(): void {
    this.hits++;
    this.logMetrics();
  }

  /**
   * Registrar un cache miss
   */
  recordMiss(): void {
    this.misses++;
    this.logMetrics();
  }

  /**
   * Obtener métricas actuales
   */
  getMetrics(): CacheMetrics {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0;

    return {
      serviceName: this.serviceName,
      hits: this.hits,
      misses: this.misses,
      hitRate: Math.round(hitRate * 100) / 100, // 2 decimales
      totalRequests,
      lastReset: this.lastReset,
    };
  }

  /**
   * Resetear métricas
   */
  reset(): void {
    this.logger.info(`Resetting cache metrics for ${this.serviceName}`, {
      previousMetrics: this.getMetrics(),
    });
    this.hits = 0;
    this.misses = 0;
    this.lastReset = new Date();
  }

  /**
   * Log periódico de métricas (cada 100 requests)
   */
  private logMetrics(): void {
    const totalRequests = this.hits + this.misses;

    // Log cada 100 requests o cuando el ratio cambie significativamente
    if (totalRequests % 100 === 0) {
      const metrics = this.getMetrics();
      this.logger.info(`Cache metrics for ${this.serviceName}`, {
        ...metrics,
        message: `Hit Rate: ${metrics.hitRate}% (${metrics.hits}/${metrics.totalRequests})`,
      });
    }
  }

  /**
   * Obtener métricas formateadas para Prometheus/OpenTelemetry
   */
  getPrometheusMetrics(): string {
    const metrics = this.getMetrics();
    return [
      `# HELP cache_hits_total Total number of cache hits`,
      `# TYPE cache_hits_total counter`,
      `cache_hits_total{service="${this.serviceName}"} ${metrics.hits}`,
      ``,
      `# HELP cache_misses_total Total number of cache misses`,
      `# TYPE cache_misses_total counter`,
      `cache_misses_total{service="${this.serviceName}"} ${metrics.misses}`,
      ``,
      `# HELP cache_hit_rate Cache hit rate percentage`,
      `# TYPE cache_hit_rate gauge`,
      `cache_hit_rate{service="${this.serviceName}"} ${metrics.hitRate}`,
    ].join("\n");
  }
}
