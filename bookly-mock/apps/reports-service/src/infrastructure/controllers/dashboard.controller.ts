import { ReportTrendPeriod } from "@libs/common/enums";
import { Permissions } from "@libs/decorators/permissions.decorator";
import { JwtAuthGuard } from "@libs/guards";
import { PermissionsGuard } from "@libs/guards/permissions.guard";
import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  GetDashboardOverviewQuery,
  GetMainKPIsQuery,
  GetOccupancyMetricsQuery,
  GetResourceComparisonQuery,
  GetTrendAnalysisQuery,
} from "../../application/queries/dashboard.queries";

/**
 * Dashboard Controller
 * Endpoints para métricas y análisis del dashboard (RF-36)
 */
@ApiTags("Dashboard")
@ApiBearerAuth()
@Controller("dashboard")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DashboardController {
  constructor(private readonly queryBus: QueryBus) {}

  /**
   * GET /api/v1/dashboard/overview
   * Obtener vista general del dashboard con KPIs principales
   */
  @Get("overview")
  @Permissions("dashboard:view")
  @ApiOperation({
    summary: "Vista general del dashboard",
    description: "Obtener KPIs principales y actividad reciente",
  })
  @ApiResponse({
    status: 200,
    description: "Vista general obtenida exitosamente",
  })
  async getOverview(): Promise<any> {
    const query = new GetDashboardOverviewQuery();
    return await this.queryBus.execute(query);
  }

  /**
   * GET /api/v1/dashboard/occupancy
   * Obtener métricas de ocupación de recursos
   */
  @Get("occupancy")
  @Permissions("dashboard:view")
  @ApiOperation({
    summary: "Métricas de ocupación",
    description: "Obtener estadísticas de ocupación de todos los recursos",
  })
  @ApiResponse({
    status: 200,
    description: "Métricas de ocupación obtenidas exitosamente",
  })
  async getOccupancy(): Promise<any> {
    const query = new GetOccupancyMetricsQuery();
    return await this.queryBus.execute(query);
  }

  /**
   * GET /api/v1/dashboard/trends
   * Analizar tendencias de uso por período
   */
  @Get("trends")
  @Permissions("dashboard:view")
  @ApiOperation({
    summary: "Análisis de tendencias",
    description: "Analizar tendencias de ocupación y uso por período",
  })
  @ApiQuery({
    name: "period",
    enum: ReportTrendPeriod,
    required: true,
  })
  @ApiQuery({ name: "startDate", type: String, required: true })
  @ApiQuery({ name: "endDate", type: String, required: true })
  @ApiResponse({
    status: 200,
    description: "Análisis de tendencias obtenido exitosamente",
  })
  async getTrends(
    @Query("period") period: ReportTrendPeriod,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string
  ): Promise<any> {
    const query = new GetTrendAnalysisQuery(
      period,
      new Date(startDate),
      new Date(endDate)
    );
    return await this.queryBus.execute(query);
  }

  /**
   * POST /api/v1/dashboard/comparison
   * Comparar múltiples recursos
   */
  @Post("comparison")
  @Permissions("dashboard:view")
  @ApiOperation({
    summary: "Comparar recursos",
    description: "Comparar métricas de múltiples recursos",
  })
  @ApiResponse({
    status: 200,
    description: "Comparación realizada exitosamente",
  })
  async compareResources(
    @Body() body: { resourceIds: string[] }
  ): Promise<any> {
    const query = new GetResourceComparisonQuery(body.resourceIds);
    return await this.queryBus.execute(query);
  }

  /**
   * GET /api/v1/dashboard/kpis
   * Obtener KPIs principales consolidados
   */
  @Get("kpis")
  @Permissions("dashboard:view")
  @ApiOperation({
    summary: "KPIs principales",
    description:
      "Obtener todos los KPIs principales consolidados con patrones de uso",
  })
  @ApiResponse({
    status: 200,
    description: "KPIs obtenidos exitosamente",
  })
  async getKPIs(): Promise<any> {
    const query = new GetMainKPIsQuery();
    return await this.queryBus.execute(query);
  }
}
