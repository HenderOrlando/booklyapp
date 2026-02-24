import { ResponseUtil } from "@libs/common";
import { Controller, Get, Param } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CacheMetricsAggregatorService } from '@gateway/application/services/cache-metrics-aggregator.service';

/**
 * Cache Metrics Controller
 * Controller para métricas de cache agregadas de todos los microservicios
 */
@ApiTags("Cache Metrics")
@Controller("api/v1/metrics/cache")
export class CacheMetricsController {
  constructor(
    private readonly metricsAggregator: CacheMetricsAggregatorService
  ) {}

  @Get("all")
  @ApiOperation({
    summary: "Obtener métricas de cache agregadas",
    description:
      "Consolida métricas de cache de todos los microservicios (resources, availability, stockpile)",
  })
  @ApiResponse({
    status: 200,
    description: "Métricas agregadas obtenidas exitosamente",
    schema: {
      example: {
        success: true,
        data: {
          timestamp: "2025-11-08T15:30:00.000Z",
          services: [
            {
              serviceName: "resources-service",
              hits: 1200,
              misses: 300,
              hitRate: 80.0,
              totalRequests: 1500,
              lastReset: "2025-11-08T10:00:00.000Z",
              status: "healthy",
            },
            {
              serviceName: "availability-service",
              hits: 850,
              misses: 150,
              hitRate: 85.0,
              totalRequests: 1000,
              lastReset: "2025-11-08T10:00:00.000Z",
              status: "healthy",
            },
            {
              serviceName: "stockpile-service",
              hits: 450,
              misses: 50,
              hitRate: 90.0,
              totalRequests: 500,
              lastReset: "2025-11-08T10:00:00.000Z",
              status: "healthy",
            },
          ],
          aggregated: {
            totalHits: 2500,
            totalMisses: 500,
            averageHitRate: 83.33,
            totalRequests: 3000,
          },
        },
        message: "Aggregated cache metrics retrieved successfully",
      },
    },
  })
  async getAllMetrics() {
    const metrics = await this.metricsAggregator.getAggregatedMetrics();
    return ResponseUtil.success(
      metrics,
      "Aggregated cache metrics retrieved successfully"
    );
  }

  @Get("services")
  @ApiOperation({
    summary: "Listar servicios disponibles",
    description: "Retorna la lista de servicios que proveen métricas de cache",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de servicios",
    schema: {
      example: {
        success: true,
        data: {
          services: [
            "resources-service",
            "availability-service",
            "stockpile-service",
          ],
        },
        message: "Available services retrieved successfully",
      },
    },
  })
  getAvailableServices() {
    const services = this.metricsAggregator.getAvailableServices();
    return ResponseUtil.success(
      { services },
      "Available services retrieved successfully"
    );
  }

  @Get("service/:serviceName")
  @ApiOperation({
    summary: "Obtener métricas de un servicio específico",
    description: "Retorna métricas de cache de un microservicio específico",
  })
  @ApiParam({
    name: "serviceName",
    description: "Nombre del servicio",
    enum: ["resources-service", "availability-service", "stockpile-service"],
  })
  @ApiResponse({
    status: 200,
    description: "Métricas del servicio obtenidas exitosamente",
    schema: {
      example: {
        success: true,
        data: {
          serviceName: "resources-service",
          hits: 1200,
          misses: 300,
          hitRate: 80.0,
          totalRequests: 1500,
          lastReset: "2025-11-08T10:00:00.000Z",
          status: "healthy",
        },
        message: "Service cache metrics retrieved successfully",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Servicio no encontrado",
  })
  async getServiceMetrics(@Param("serviceName") serviceName: string) {
    const metrics = await this.metricsAggregator.getServiceMetrics(serviceName);
    return ResponseUtil.success(
      metrics,
      `Service cache metrics retrieved successfully for ${serviceName}`
    );
  }

  @Get("prometheus")
  @ApiOperation({
    summary: "Obtener métricas en formato Prometheus",
    description:
      "Retorna métricas agregadas en formato Prometheus para scraping",
  })
  @ApiResponse({
    status: 200,
    description: "Métricas en formato Prometheus",
    content: {
      "text/plain": {
        example: `# HELP bookly_cache_hits_total Total number of cache hits per service
# TYPE bookly_cache_hits_total counter
bookly_cache_hits_total{service="resources-service"} 1200
bookly_cache_hits_total{service="availability-service"} 850
bookly_cache_hits_total{service="stockpile-service"} 450

# HELP bookly_cache_misses_total Total number of cache misses per service
# TYPE bookly_cache_misses_total counter
bookly_cache_misses_total{service="resources-service"} 300
bookly_cache_misses_total{service="availability-service"} 150
bookly_cache_misses_total{service="stockpile-service"} 50

# HELP bookly_cache_hit_rate Cache hit rate percentage per service
# TYPE bookly_cache_hit_rate gauge
bookly_cache_hit_rate{service="resources-service"} 80.0
bookly_cache_hit_rate{service="availability-service"} 85.0
bookly_cache_hit_rate{service="stockpile-service"} 90.0

# HELP bookly_cache_aggregated_hit_rate Aggregated hit rate across all services
# TYPE bookly_cache_aggregated_hit_rate gauge
bookly_cache_aggregated_hit_rate 83.33`,
      },
    },
  })
  async getPrometheusMetrics() {
    return await this.metricsAggregator.getPrometheusMetrics();
  }
}
