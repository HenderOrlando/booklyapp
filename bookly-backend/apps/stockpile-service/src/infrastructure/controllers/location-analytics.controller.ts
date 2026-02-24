import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { LocationAnalyticsService } from '@stockpile/application/services/location-analytics.service';

/**
 * Location Analytics Controller
 * Endpoints para análisis de uso por ubicación geográfica
 */
@ApiTags("Location Analytics")
@ApiBearerAuth()
@Controller("location-analytics")
export class LocationAnalyticsController {
  constructor(
    private readonly locationAnalyticsService: LocationAnalyticsService
  ) {}

  /**
   * Obtener análisis de uso por ubicación
   */
  @Get("usage")
  @ApiOperation({
    summary: "Análisis de uso por ubicación",
    description:
      "Obtiene estadísticas agregadas de uso de recursos por ubicación geográfica, incluyendo check-ins totales, usuarios únicos, duración promedio y horas pico.",
  })
  @ApiQuery({
    name: "startDate",
    required: true,
    type: String,
    description: "Fecha inicio en formato ISO (YYYY-MM-DD)",
    example: "2024-01-01",
  })
  @ApiQuery({
    name: "endDate",
    required: true,
    type: String,
    description: "Fecha fin en formato ISO (YYYY-MM-DD)",
    example: "2024-01-31",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Número de página (paginación)",
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Elementos por página",
    example: 20,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Analytics por ubicación obtenidos exitosamente",
    schema: {
      example: {
        data: [
          {
            location: "Biblioteca Central",
            coordinates: { latitude: 7.8939, longitude: -72.5078 },
            totalCheckIns: 245,
            uniqueUsers: 89,
            avgDuration: 7200000,
            peakHours: [14, 10, 16],
            resources: ["resource-1", "resource-2"],
            usageByDay: { "2024-01-15": 25, "2024-01-16": 30 },
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 45,
          totalPages: 3,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: "Parámetros de fecha inválidos",
  })
  async getUsageByLocation(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number = 20
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const allData = await this.locationAnalyticsService.getUsageByLocation(
      start,
      end
    );

    // Paginación
    const total = allData.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = allData.slice(startIndex, endIndex);

    return {
      data: paginatedData.map((item) => ({
        ...item,
        uniqueUsers: item.uniqueUsers.size,
        resources: Array.from(item.resources),
        usageByDay: Object.fromEntries(item.usageByDay),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Obtener datos para mapa de calor
   */
  @Get("heatmap")
  @ApiOperation({
    summary: "Datos para mapa de calor",
    description:
      "Genera puntos de calor geográficos basados en la intensidad de uso de recursos. Útil para visualización en mapas con capas de heatmap.",
  })
  @ApiQuery({
    name: "startDate",
    required: true,
    type: String,
    description: "Fecha inicio en formato ISO",
    example: "2024-01-01",
  })
  @ApiQuery({
    name: "endDate",
    required: true,
    type: String,
    description: "Fecha fin en formato ISO",
    example: "2024-01-31",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Datos de heatmap generados exitosamente",
    schema: {
      example: [
        {
          lat: 7.8939,
          lng: -72.5078,
          intensity: 245,
          radius: 50,
        },
        {
          lat: 7.8941,
          lng: -72.5073,
          intensity: 180,
          radius: 40,
        },
      ],
    },
  })
  async getHeatmapData(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return await this.locationAnalyticsService.getHeatmapData(start, end);
  }

  /**
   * Obtener estadísticas generales de uso
   */
  @Get("statistics")
  @ApiOperation({
    summary: "Estadísticas generales de uso",
    description:
      "Resumen ejecutivo con métricas clave: check-ins totales, usuarios únicos, duración promedio, ubicación más popular y tendencia de uso.",
  })
  @ApiQuery({
    name: "startDate",
    required: true,
    type: String,
    description: "Fecha inicio en formato ISO",
    example: "2024-01-01",
  })
  @ApiQuery({
    name: "endDate",
    required: true,
    type: String,
    description: "Fecha fin en formato ISO",
    example: "2024-01-31",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Estadísticas calculadas exitosamente",
    schema: {
      example: {
        totalCheckIns: 1250,
        totalUniqueUsers: 345,
        avgDurationMinutes: 120,
        mostPopularLocation: "Biblioteca Central",
        leastPopularLocation: "Sala 305",
        peakHour: 14,
        usageTrend: "increasing",
      },
    },
  })
  async getUsageStatistics(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return await this.locationAnalyticsService.getUsageStatistics(start, end);
  }

  /**
   * Obtener análisis por recurso específico
   */
  @Get("resource/:resourceId")
  @ApiOperation({
    summary: "Análisis de uso por recurso",
    description:
      "Métricas detalladas de un recurso específico: check-ins, usuarios únicos, duración promedio, horas pico y uso por día de la semana.",
  })
  @ApiParam({
    name: "resourceId",
    type: String,
    description: "ID del recurso a analizar",
    example: "507f1f77bcf86cd799439011",
  })
  @ApiQuery({
    name: "startDate",
    required: true,
    type: String,
    description: "Fecha inicio en formato ISO",
    example: "2024-01-01",
  })
  @ApiQuery({
    name: "endDate",
    required: true,
    type: String,
    description: "Fecha fin en formato ISO",
    example: "2024-01-31",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Analytics del recurso obtenidos exitosamente",
    schema: {
      example: {
        resourceId: "507f1f77bcf86cd799439011",
        location: "Biblioteca Central",
        coordinates: { latitude: 7.8939, longitude: -72.5078 },
        totalCheckIns: 150,
        uniqueUsers: 45,
        avgDurationMinutes: 90,
        peakHours: [14, 10, 16],
        usageByDayOfWeek: {
          Lunes: 25,
          Martes: 30,
          Miércoles: 28,
          Jueves: 22,
          Viernes: 35,
          Sábado: 5,
          Domingo: 5,
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: "Recurso no encontrado",
  })
  async getResourceUsageAnalytics(
    @Param("resourceId") resourceId: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const analytics =
      await this.locationAnalyticsService.getResourceUsageAnalytics(
        resourceId,
        start,
        end
      );

    return {
      ...analytics,
      usageByDayOfWeek: Object.fromEntries(analytics.usageByDayOfWeek),
    };
  }
}
