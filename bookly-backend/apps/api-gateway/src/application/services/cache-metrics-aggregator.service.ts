import { createLogger } from "@libs/common";
import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";

export interface ServiceCacheMetrics {
  serviceName: string;
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
  lastReset: Date;
  status: "healthy" | "error";
  error?: string;
}

export interface AggregatedCacheMetrics {
  timestamp: Date;
  services: ServiceCacheMetrics[];
  aggregated: {
    totalHits: number;
    totalMisses: number;
    averageHitRate: number;
    totalRequests: number;
  };
}

/**
 * Cache Metrics Aggregator Service
 * Servicio para agregar métricas de cache de todos los microservicios
 */
@Injectable()
export class CacheMetricsAggregatorService {
  private readonly logger = createLogger("CacheMetricsAggregatorService");

  private readonly serviceUrls: Map<string, string> = new Map();

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    // Configurar URLs de servicios
    this.serviceUrls.set(
      "resources-service",
      this.configService.get("RESOURCES_SERVICE_URL", "http://localhost:3002")
    );
    this.serviceUrls.set(
      "availability-service",
      this.configService.get(
        "AVAILABILITY_SERVICE_URL",
        "http://localhost:3003"
      )
    );
    this.serviceUrls.set(
      "stockpile-service",
      this.configService.get("STOCKPILE_SERVICE_URL", "http://localhost:3004")
    );
  }

  /**
   * Obtiene métricas agregadas de todos los servicios
   */
  async getAggregatedMetrics(): Promise<AggregatedCacheMetrics> {
    const timestamp = new Date();
    const services: ServiceCacheMetrics[] = [];

    // Fetch métricas de cada servicio en paralelo
    const promises = Array.from(this.serviceUrls.entries()).map(
      async ([serviceName, baseUrl]) => {
        try {
          const url = `${baseUrl}/metrics/cache`;
          this.logger.debug(`Fetching metrics from ${url}`);

          const response = await firstValueFrom(
            this.httpService.get(url, { timeout: 5000 })
          );

          if (response.data?.success && response.data?.data) {
            const metrics = response.data.data;
            services.push({
              serviceName: metrics.serviceName || serviceName,
              hits: metrics.hits || 0,
              misses: metrics.misses || 0,
              hitRate: metrics.hitRate || 0,
              totalRequests: metrics.totalRequests || 0,
              lastReset: new Date(metrics.lastReset),
              status: "healthy",
            });
          } else {
            throw new Error("Invalid response format");
          }
        } catch (error) {
          this.logger.warn(
            `Failed to fetch metrics from ${serviceName}`,
            error as Error
          );
          services.push({
            serviceName,
            hits: 0,
            misses: 0,
            hitRate: 0,
            totalRequests: 0,
            lastReset: timestamp,
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    );

    await Promise.all(promises);

    // Calcular métricas agregadas
    const aggregated = this.calculateAggregated(services);

    return {
      timestamp,
      services,
      aggregated,
    };
  }

  /**
   * Obtiene métricas de un servicio específico
   */
  async getServiceMetrics(serviceName: string): Promise<ServiceCacheMetrics> {
    const baseUrl = this.serviceUrls.get(serviceName);

    if (!baseUrl) {
      throw new Error(`Service ${serviceName} not found`);
    }

    try {
      const url = `${baseUrl}/metrics/cache`;
      const response = await firstValueFrom(
        this.httpService.get(url, { timeout: 5000 })
      );

      if (response.data?.success && response.data?.data) {
        const metrics = response.data.data;
        return {
          serviceName: metrics.serviceName || serviceName,
          hits: metrics.hits || 0,
          misses: metrics.misses || 0,
          hitRate: metrics.hitRate || 0,
          totalRequests: metrics.totalRequests || 0,
          lastReset: new Date(metrics.lastReset),
          status: "healthy",
        };
      }

      throw new Error("Invalid response format");
    } catch (error) {
      this.logger.error(
        `Failed to fetch metrics from ${serviceName}`,
        error as Error
      );
      return {
        serviceName,
        hits: 0,
        misses: 0,
        hitRate: 0,
        totalRequests: 0,
        lastReset: new Date(),
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Obtiene métricas en formato Prometheus de todos los servicios
   */
  async getPrometheusMetrics(): Promise<string> {
    const metrics = await this.getAggregatedMetrics();

    const lines: string[] = [
      "# HELP bookly_cache_hits_total Total number of cache hits per service",
      "# TYPE bookly_cache_hits_total counter",
    ];

    metrics.services.forEach((service) => {
      if (service.status === "healthy") {
        lines.push(
          `bookly_cache_hits_total{service="${service.serviceName}"} ${service.hits}`
        );
      }
    });

    lines.push("");
    lines.push(
      "# HELP bookly_cache_misses_total Total number of cache misses per service"
    );
    lines.push("# TYPE bookly_cache_misses_total counter");

    metrics.services.forEach((service) => {
      if (service.status === "healthy") {
        lines.push(
          `bookly_cache_misses_total{service="${service.serviceName}"} ${service.misses}`
        );
      }
    });

    lines.push("");
    lines.push(
      "# HELP bookly_cache_hit_rate Cache hit rate percentage per service"
    );
    lines.push("# TYPE bookly_cache_hit_rate gauge");

    metrics.services.forEach((service) => {
      if (service.status === "healthy") {
        lines.push(
          `bookly_cache_hit_rate{service="${service.serviceName}"} ${service.hitRate}`
        );
      }
    });

    lines.push("");
    lines.push(
      "# HELP bookly_cache_total_requests Total cache requests per service"
    );
    lines.push("# TYPE bookly_cache_total_requests counter");

    metrics.services.forEach((service) => {
      if (service.status === "healthy") {
        lines.push(
          `bookly_cache_total_requests{service="${service.serviceName}"} ${service.totalRequests}`
        );
      }
    });

    // Métricas agregadas
    lines.push("");
    lines.push(
      "# HELP bookly_cache_aggregated_hit_rate Aggregated hit rate across all services"
    );
    lines.push("# TYPE bookly_cache_aggregated_hit_rate gauge");
    lines.push(
      `bookly_cache_aggregated_hit_rate ${metrics.aggregated.averageHitRate}`
    );

    return lines.join("\n");
  }

  /**
   * Calcula métricas agregadas
   */
  private calculateAggregated(services: ServiceCacheMetrics[]) {
    const healthyServices = services.filter((s) => s.status === "healthy");

    const totalHits = healthyServices.reduce((sum, s) => sum + s.hits, 0);
    const totalMisses = healthyServices.reduce((sum, s) => sum + s.misses, 0);
    const totalRequests = totalHits + totalMisses;

    // Calcular hit rate ponderado por requests
    let weightedHitRateSum = 0;
    let totalWeight = 0;

    healthyServices.forEach((service) => {
      if (service.totalRequests > 0) {
        weightedHitRateSum += service.hitRate * service.totalRequests;
        totalWeight += service.totalRequests;
      }
    });

    const averageHitRate =
      totalWeight > 0
        ? Math.round((weightedHitRateSum / totalWeight) * 100) / 100
        : 0;

    return {
      totalHits,
      totalMisses,
      averageHitRate,
      totalRequests,
    };
  }

  /**
   * Lista de servicios disponibles
   */
  getAvailableServices(): string[] {
    return Array.from(this.serviceUrls.keys());
  }
}
