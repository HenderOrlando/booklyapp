import { JwtAuthGuard } from "@libs/guards";
import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AuditAlertService } from '@reports/application/services/audit-alert.service';
import { AuditAnalyticsService } from '@reports/application/services/audit-analytics.service';

/**
 * Controller para dashboard de auditoría en tiempo real
 */
@ApiTags("Audit Dashboard")
@ApiBearerAuth()
@Controller("audit-dashboard")
@UseGuards(JwtAuthGuard)
export class AuditDashboardController {
  constructor(
    private readonly auditAnalyticsService: AuditAnalyticsService,
    private readonly auditAlertService: AuditAlertService
  ) {}

  /**
   * Obtener estadísticas generales de auditoría
   */
  @Get("statistics")
  @ApiOperation({ summary: "Obtener estadísticas generales de auditoría" })
  @ApiQuery({
    name: "startDate",
    required: false,
    type: String,
    description: "Fecha de inicio (ISO 8601)",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    type: String,
    description: "Fecha de fin (ISO 8601)",
  })
  @ApiResponse({
    status: 200,
    description: "Estadísticas de auditoría obtenidas exitosamente",
  })
  async getStatistics(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const statistics = await this.auditAnalyticsService.getStatistics(
      start,
      end
    );

    return {
      success: true,
      data: statistics,
      timestamp: new Date(),
    };
  }

  /**
   * Obtener datos de serie temporal para gráficos
   */
  @Get("time-series")
  @ApiOperation({
    summary: "Obtener datos de serie temporal para gráficos de auditoría",
  })
  @ApiQuery({
    name: "startDate",
    required: true,
    type: String,
    description: "Fecha de inicio (ISO 8601)",
  })
  @ApiQuery({
    name: "endDate",
    required: true,
    type: String,
    description: "Fecha de fin (ISO 8601)",
  })
  @ApiQuery({
    name: "interval",
    required: false,
    enum: ["hour", "day"],
    description: "Intervalo de agregación",
  })
  @ApiResponse({
    status: 200,
    description: "Datos de serie temporal obtenidos exitosamente",
  })
  async getTimeSeriesData(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("interval") interval: "hour" | "day" = "hour"
  ) {
    const timeSeriesData = await this.auditAnalyticsService.getTimeSeriesData(
      new Date(startDate),
      new Date(endDate),
      interval
    );

    return {
      success: true,
      data: timeSeriesData,
      timestamp: new Date(),
    };
  }

  /**
   * Obtener intentos no autorizados recientes
   */
  @Get("unauthorized-attempts")
  @ApiOperation({ summary: "Obtener intentos de acceso no autorizado" })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Límite de resultados",
  })
  @ApiQuery({
    name: "onlyUnalerted",
    required: false,
    type: Boolean,
    description: "Solo mostrar intentos sin alertar",
  })
  @ApiResponse({
    status: 200,
    description: "Intentos no autorizados obtenidos exitosamente",
  })
  async getUnauthorizedAttempts(
    @Query("limit") limit = 50,
    @Query("onlyUnalerted") onlyUnalerted?: string | boolean
  ) {
    const onlyUnalertedBool =
      onlyUnalerted === true ||
      onlyUnalerted === "true" ||
      onlyUnalerted === "1";

    const attempts = await this.auditAnalyticsService.getUnauthorizedAttempts(
      Number(limit),
      onlyUnalertedBool
    );

    return {
      success: true,
      data: attempts,
      count: attempts.length,
      timestamp: new Date(),
    };
  }

  /**
   * Obtener actividad de un usuario específico
   */
  @Get("user-activity")
  @ApiOperation({ summary: "Obtener actividad de un usuario específico" })
  @ApiQuery({
    name: "userId",
    required: true,
    type: String,
    description: "ID del usuario",
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    type: String,
    description: "Fecha de inicio (ISO 8601)",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    type: String,
    description: "Fecha de fin (ISO 8601)",
  })
  @ApiResponse({
    status: 200,
    description: "Actividad del usuario obtenida exitosamente",
  })
  async getUserActivity(
    @Query("userId") userId: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    const activity = await this.auditAnalyticsService.getUserActivity(
      userId,
      start,
      end
    );

    return {
      success: true,
      data: activity,
      count: activity.length,
      userId,
      timestamp: new Date(),
    };
  }

  /**
   * Detectar patrones sospechosos
   */
  @Get("suspicious-patterns")
  @ApiOperation({
    summary: "Detectar patrones sospechosos en eventos de auditoría",
  })
  @ApiResponse({
    status: 200,
    description: "Patrones sospechosos detectados",
  })
  async detectSuspiciousPatterns() {
    const patterns =
      await this.auditAnalyticsService.detectSuspiciousPatterns();

    return {
      success: true,
      data: patterns,
      count: patterns.length,
      timestamp: new Date(),
    };
  }

  /**
   * Obtener alertas recientes
   */
  @Get("alerts")
  @ApiOperation({ summary: "Obtener alertas recientes del sistema" })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Límite de resultados",
  })
  @ApiResponse({
    status: 200,
    description: "Alertas obtenidas exitosamente",
  })
  getRecentAlerts(@Query("limit") limit = 50) {
    const alerts = this.auditAlertService.getRecentAlerts(Number(limit));

    return {
      success: true,
      data: alerts,
      count: alerts.length,
      timestamp: new Date(),
    };
  }

  /**
   * Obtener estadísticas de alertas
   */
  @Get("alerts/statistics")
  @ApiOperation({ summary: "Obtener estadísticas de alertas" })
  @ApiResponse({
    status: 200,
    description: "Estadísticas de alertas obtenidas exitosamente",
  })
  getAlertStatistics() {
    const statistics = this.auditAlertService.getAlertStatistics();

    return {
      success: true,
      data: statistics,
      timestamp: new Date(),
    };
  }

  /**
   * Endpoint para monitoreo manual de patrones sospechosos
   */
  @Get("monitor")
  @ApiOperation({
    summary: "Ejecutar monitoreo manual de patrones sospechosos",
  })
  @ApiResponse({
    status: 200,
    description: "Monitoreo ejecutado exitosamente",
  })
  async monitorSuspiciousPatterns() {
    await this.auditAlertService.monitorSuspiciousPatterns();

    return {
      success: true,
      message: "Monitoreo de patrones sospechosos ejecutado",
      timestamp: new Date(),
    };
  }
}
