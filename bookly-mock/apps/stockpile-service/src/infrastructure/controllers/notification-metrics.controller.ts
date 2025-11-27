import { NotificationChannel } from "@libs/common/enums";
import { NotificationMetricsService } from "@libs/notifications";
import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

/**
 * Notification Metrics Controller
 * Endpoints para consultar métricas de notificaciones
 */
@ApiTags("Notification Metrics")
@Controller("notification-metrics")
export class NotificationMetricsController {
  constructor(private readonly metricsService: NotificationMetricsService) {}

  /**
   * Obtener métricas globales
   */
  @Get("global")
  @ApiOperation({ summary: "Obtener métricas globales de notificaciones" })
  @ApiQuery({
    name: "from",
    required: false,
    description: "Fecha inicio (ISO)",
  })
  @ApiQuery({ name: "to", required: false, description: "Fecha fin (ISO)" })
  @ApiResponse({ status: 200, description: "Métricas globales" })
  getGlobalMetrics(@Query("from") from?: string, @Query("to") to?: string) {
    const period =
      from && to ? { from: new Date(from), to: new Date(to) } : undefined;
    return this.metricsService.getGlobalMetrics(period);
  }

  /**
   * Obtener métricas por proveedor
   */
  @Get("provider/:provider")
  @ApiOperation({ summary: "Obtener métricas de un proveedor específico" })
  @ApiQuery({ name: "channel", required: false, enum: NotificationChannel })
  @ApiQuery({ name: "tenantId", required: false })
  @ApiQuery({
    name: "from",
    required: false,
    description: "Fecha inicio (ISO)",
  })
  @ApiQuery({ name: "to", required: false, description: "Fecha fin (ISO)" })
  @ApiResponse({ status: 200, description: "Métricas del proveedor" })
  getProviderMetrics(
    @Param("provider") provider: string,
    @Query("channel") channel?: NotificationChannel,
    @Query("tenantId") tenantId?: string,
    @Query("from") from?: string,
    @Query("to") to?: string
  ) {
    const period =
      from && to ? { from: new Date(from), to: new Date(to) } : undefined;
    return this.metricsService.getMetricsByProvider(
      provider,
      channel,
      tenantId,
      period
    );
  }

  /**
   * Obtener métricas por canal
   */
  @Get("channel/:channel")
  @ApiOperation({ summary: "Obtener métricas agregadas por canal" })
  @ApiQuery({
    name: "from",
    required: false,
    description: "Fecha inicio (ISO)",
  })
  @ApiQuery({ name: "to", required: false, description: "Fecha fin (ISO)" })
  @ApiResponse({ status: 200, description: "Métricas por canal" })
  getChannelMetrics(
    @Param("channel") channel: NotificationChannel,
    @Query("from") from?: string,
    @Query("to") to?: string
  ) {
    const period =
      from && to ? { from: new Date(from), to: new Date(to) } : undefined;
    const metrics = this.metricsService.getMetricsByChannel(channel, period);
    return Object.fromEntries(metrics);
  }

  /**
   * Obtener métricas por tenant
   */
  @Get("tenant/:tenantId")
  @ApiOperation({ summary: "Obtener métricas de un tenant" })
  @ApiQuery({
    name: "from",
    required: false,
    description: "Fecha inicio (ISO)",
  })
  @ApiQuery({ name: "to", required: false, description: "Fecha fin (ISO)" })
  @ApiResponse({ status: 200, description: "Métricas del tenant" })
  getTenantMetrics(
    @Param("tenantId") tenantId: string,
    @Query("from") from?: string,
    @Query("to") to?: string
  ) {
    const period =
      from && to ? { from: new Date(from), to: new Date(to) } : undefined;
    const metrics = this.metricsService.getMetricsByTenant(tenantId, period);
    return Object.fromEntries(metrics);
  }

  /**
   * Obtener eventos recientes
   */
  @Get("events/recent")
  @ApiOperation({ summary: "Obtener eventos recientes de notificaciones" })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 100 })
  @ApiQuery({ name: "provider", required: false })
  @ApiQuery({ name: "channel", required: false, enum: NotificationChannel })
  @ApiQuery({ name: "tenantId", required: false })
  @ApiResponse({ status: 200, description: "Lista de eventos recientes" })
  getRecentEvents(
    @Query("limit") limit?: number,
    @Query("provider") provider?: string,
    @Query("channel") channel?: NotificationChannel,
    @Query("tenantId") tenantId?: string
  ) {
    return this.metricsService.getRecentEvents(
      limit,
      provider,
      channel,
      tenantId
    );
  }

  /**
   * Obtener estadísticas de latencia
   */
  @Get("latency-stats")
  @ApiOperation({ summary: "Obtener estadísticas de latencia (percentiles)" })
  @ApiQuery({ name: "provider", required: false })
  @ApiQuery({ name: "channel", required: false, enum: NotificationChannel })
  @ApiResponse({
    status: 200,
    description: "Estadísticas de latencia (p50, p75, p95, p99)",
  })
  getLatencyStats(
    @Query("provider") provider?: string,
    @Query("channel") channel?: NotificationChannel
  ) {
    return this.metricsService.getLatencyStats(provider, channel);
  }
}
