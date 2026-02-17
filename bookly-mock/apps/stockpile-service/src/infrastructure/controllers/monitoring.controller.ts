import { ResponseUtil } from "@libs/common";
import { CurrentUser, Roles } from "@libs/decorators";
import { JwtAuthGuard, RolesGuard } from "@libs/guards";
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  MonitoringFilters,
  MonitoringService,
} from "@stockpile/application/services/monitoring.service";
import { IncidentSeverity } from "@stockpile/domain/entities/incident.entity";

/**
 * DTO para reportar incidencia
 */
export class ReportIncidentDto {
  checkInOutId?: string;
  resourceId: string;
  severity: IncidentSeverity;
  description: string;
  location?: string;
  metadata?: Record<string, any>;
}

/**
 * DTO para resolver incidencia
 */
export class ResolveIncidentDto {
  resolution: string;
}

/**
 * DTO para filtros de monitoreo
 */
export class MonitoringFiltersDto {
  resourceId?: string;
  userId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  includeIncidents?: boolean;
}

/**
 * Controlador de Monitoreo para Dashboard de Vigilancia
 * Implementa RF-23: Pantalla de Control - Vigilancia
 *
 * Endpoints para el personal de vigilancia:
 * - Ver check-ins activos
 * - Ver check-ins vencidos
 * - Ver historial de recursos
 * - Reportar y gestionar incidencias
 * - Ver estadísticas y alertas
 */
@ApiTags("Monitoring")
@Controller("monitoring")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  /**
   * Obtiene todos los check-ins activos
   * Para mostrar en el dashboard de vigilancia
   */
  @Get("active")
  @Roles("SECURITY", "GENERAL_ADMIN", "PROGRAM_ADMIN")
  @ApiOperation({
    summary: "Obtener check-ins activos",
    description:
      "Lista todos los check-ins activos sin check-out para el dashboard de vigilancia",
  })
  @ApiResponse({
    status: 200,
    description: "Check-ins activos obtenidos exitosamente",
  })
  async getActiveCheckIns(@Query() filtersDto: MonitoringFiltersDto) {
    const filters: MonitoringFilters = {
      resourceId: filtersDto.resourceId,
      userId: filtersDto.userId,
      startDate: filtersDto.startDate
        ? new Date(filtersDto.startDate)
        : undefined,
      endDate: filtersDto.endDate ? new Date(filtersDto.endDate) : undefined,
      includeIncidents: filtersDto.includeIncidents === true,
    };

    const checkIns = await this.monitoringService.getActiveCheckIns(filters);

    return ResponseUtil.success({
      data: checkIns,
      message: "Check-ins activos obtenidos exitosamente",
    });
  }

  /**
   * Obtiene check-ins vencidos (sin check-out después de la hora esperada)
   */
  @Get("overdue")
  @Roles("SECURITY", "GENERAL_ADMIN", "PROGRAM_ADMIN")
  @ApiOperation({
    summary: "Obtener check-ins vencidos",
    description:
      "Lista check-ins que no han hecho check-out después de la hora esperada",
  })
  @ApiResponse({
    status: 200,
    description: "Check-ins vencidos obtenidos exitosamente",
  })
  async getOverdueCheckIns() {
    const checkIns = await this.monitoringService.getOverdueCheckIns();

    return ResponseUtil.success({
      data: checkIns,
      message: "Check-ins vencidos obtenidos exitosamente",
    });
  }

  /**
   * Obtiene el historial de check-ins de un recurso específico
   */
  @Get("history/:resourceId")
  @Roles("SECURITY", "GENERAL_ADMIN", "PROGRAM_ADMIN")
  @ApiOperation({
    summary: "Obtener historial de un recurso",
    description: "Lista el historial de check-ins de un recurso específico",
  })
  @ApiResponse({
    status: 200,
    description: "Historial obtenido exitosamente",
  })
  async getResourceHistory(
    @Param("resourceId") resourceId: string,
    @Query("limit") limit?: number,
  ) {
    const history = await this.monitoringService.getResourceHistory(
      resourceId,
      limit ? parseInt(limit.toString()) : 50,
    );

    return ResponseUtil.success({
      data: history,
      message: "Historial del recurso obtenido exitosamente",
    });
  }

  /**
   * Obtiene estadísticas generales del dashboard
   */
  @Get("statistics")
  @Roles("SECURITY", "GENERAL_ADMIN", "PROGRAM_ADMIN")
  @ApiOperation({
    summary: "Obtener estadísticas del dashboard",
    description:
      "Obtiene métricas y estadísticas generales para el dashboard de vigilancia",
  })
  @ApiResponse({
    status: 200,
    description: "Estadísticas obtenidas exitosamente",
  })
  async getStatistics(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    const stats = await this.monitoringService.getStatistics(
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    return ResponseUtil.success({
      data: stats,
      message: "Estadísticas obtenidas exitosamente",
    });
  }

  /**
   * Reporta una incidencia
   */
  @Post("incident")
  @Roles("SECURITY", "GENERAL_ADMIN", "PROGRAM_ADMIN")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: "Reportar incidencia",
    description: "Crea un reporte de incidencia para un recurso",
  })
  @ApiResponse({
    status: 201,
    description: "Incidencia reportada exitosamente",
  })
  async reportIncident(
    @Body() dto: ReportIncidentDto,
    @CurrentUser() user: any,
  ) {
    const incident = await this.monitoringService.reportIncident({
      checkInOutId: dto.checkInOutId,
      resourceId: dto.resourceId,
      reportedBy: user.id || user.sub,
      severity: dto.severity,
      description: dto.description,
      location: dto.location,
      metadata: dto.metadata,
    });

    return ResponseUtil.success({
      data: incident,
      message: "Incidencia reportada exitosamente",
    });
  }

  /**
   * Obtiene incidencias pendientes
   */
  @Get("incidents/pending")
  @Roles("SECURITY", "GENERAL_ADMIN", "PROGRAM_ADMIN")
  @ApiOperation({
    summary: "Obtener incidencias pendientes",
    description: "Lista todas las incidencias pendientes de resolución",
  })
  @ApiResponse({
    status: 200,
    description: "Incidencias pendientes obtenidas exitosamente",
  })
  async getPendingIncidents(@Query("resourceId") resourceId?: string) {
    const incidents =
      await this.monitoringService.getPendingIncidents(resourceId);

    return ResponseUtil.success({
      data: incidents,
      message: "Incidencias pendientes obtenidas exitosamente",
    });
  }

  /**
   * Resuelve una incidencia
   */
  @Post("incident/:incidentId/resolve")
  @Roles("SECURITY", "GENERAL_ADMIN", "PROGRAM_ADMIN")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Resolver incidencia",
    description: "Marca una incidencia como resuelta",
  })
  @ApiResponse({
    status: 200,
    description: "Incidencia resuelta exitosamente",
  })
  async resolveIncident(
    @Param("incidentId") incidentId: string,
    @Body() dto: ResolveIncidentDto,
    @CurrentUser() user: any,
  ) {
    const incident = await this.monitoringService.resolveIncident({
      incidentId,
      resolvedBy: user.id || user.sub,
      resolution: dto.resolution,
    });

    return ResponseUtil.success({
      data: incident,
      message: "Incidencia resuelta exitosamente",
    });
  }

  /**
   * Obtiene alertas activas para el dashboard
   */
  @Get("alerts")
  @Roles("SECURITY", "GENERAL_ADMIN", "PROGRAM_ADMIN")
  @ApiOperation({
    summary: "Obtener alertas activas",
    description:
      "Lista todas las alertas activas (check-outs vencidos, incidencias críticas, etc.)",
  })
  @ApiResponse({
    status: 200,
    description: "Alertas activas obtenidas exitosamente",
  })
  async getActiveAlerts() {
    const alerts = await this.monitoringService.getActiveAlerts();

    return ResponseUtil.success({
      data: alerts,
      message: "Alertas activas obtenidas exitosamente",
    });
  }
}
