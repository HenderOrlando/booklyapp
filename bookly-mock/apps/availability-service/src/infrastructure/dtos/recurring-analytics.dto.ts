import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsString } from "class-validator";

/**
 * DTO para filtros de analytics de series recurrentes
 */
export class RecurringAnalyticsFiltersDto {
  @ApiPropertyOptional({
    description: "Fecha de inicio del rango de análisis",
    example: "2025-01-01T00:00:00.000Z",
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: "Fecha de fin del rango de análisis",
    example: "2025-12-31T23:59:59.999Z",
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: "ID del recurso para filtrar",
    example: "resource-123",
  })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiPropertyOptional({
    description: "ID del usuario para filtrar",
    example: "user-456",
  })
  @IsOptional()
  @IsString()
  userId?: string;
}

/**
 * DTO de respuesta para estadísticas de uso
 */
export class RecurringSeriesUsageStatsDto {
  @ApiProperty({
    description: "Total de series creadas",
    example: 150,
  })
  totalSeries: number;

  @ApiProperty({
    description: "Total de instancias generadas",
    example: 3500,
  })
  totalInstances: number;

  @ApiProperty({
    description: "Instancias completadas",
    example: 2800,
  })
  completedInstances: number;

  @ApiProperty({
    description: "Instancias canceladas",
    example: 200,
  })
  cancelledInstances: number;

  @ApiProperty({
    description: "Instancias pendientes",
    example: 500,
  })
  pendingInstances: number;

  @ApiProperty({
    description: "Tasa de cancelación (%)",
    example: 5.71,
  })
  cancellationRate: number;

  @ApiProperty({
    description: "Promedio de instancias por serie",
    example: 23.33,
  })
  averageInstancesPerSeries: number;
}

/**
 * DTO para uso de recursos por serie recurrente
 */
export class ResourceUsageBySeriesDto {
  @ApiProperty({
    description: "ID del recurso",
    example: "resource-123",
  })
  resourceId: string;

  @ApiProperty({
    description: "Nombre del recurso",
    example: "Sala 202",
  })
  resourceName: string;

  @ApiProperty({
    description: "Total de series en este recurso",
    example: 25,
  })
  totalSeries: number;

  @ApiProperty({
    description: "Total de instancias",
    example: 650,
  })
  totalInstances: number;

  @ApiProperty({
    description: "Horas totales reservadas",
    example: 1300,
  })
  totalHoursBooked: number;

  @ApiProperty({
    description: "Porcentaje de ocupación",
    example: 75.5,
  })
  occupancyRate: number;
}

/**
 * DTO para demanda insatisfecha (conflictos)
 */
export class UnsatisfiedDemandDto {
  @ApiProperty({
    description: "ID del recurso",
    example: "resource-123",
  })
  resourceId: string;

  @ApiProperty({
    description: "Nombre del recurso",
    example: "Sala 202",
  })
  resourceName: string;

  @ApiProperty({
    description: "Total de intentos fallidos",
    example: 45,
  })
  failedAttempts: number;

  @ApiProperty({
    description: "Instancias en conflicto",
    example: 120,
  })
  conflictedInstances: number;

  @ApiProperty({
    description: "Usuarios afectados",
    example: 12,
  })
  affectedUsers: number;

  @ApiProperty({
    description: "Horarios más conflictivos",
    type: [String],
    example: ["09:00-11:00", "14:00-16:00"],
  })
  peakConflictTimes: string[];
}

/**
 * DTO para patrones de uso temporal
 */
export class TemporalUsagePatternDto {
  @ApiProperty({
    description: "Día de la semana (0=Domingo, 6=Sábado)",
    example: 1,
  })
  dayOfWeek: number;

  @ApiProperty({
    description: "Hora del día (0-23)",
    example: 14,
  })
  hour: number;

  @ApiProperty({
    description: "Total de reservas en este slot",
    example: 85,
  })
  totalReservations: number;

  @ApiProperty({
    description: "Recursos únicos usados",
    example: 12,
  })
  uniqueResources: number;
}

/**
 * DTO de respuesta completa de analytics
 */
export class RecurringSeriesAnalyticsResponseDto {
  @ApiProperty({
    description: "Estadísticas generales de uso",
    type: RecurringSeriesUsageStatsDto,
  })
  usageStats: RecurringSeriesUsageStatsDto;

  @ApiProperty({
    description: "Uso por recurso (top 10)",
    type: [ResourceUsageBySeriesDto],
  })
  topResources: ResourceUsageBySeriesDto[];

  @ApiProperty({
    description: "Demanda insatisfecha (top 5)",
    type: [UnsatisfiedDemandDto],
  })
  unsatisfiedDemand: UnsatisfiedDemandDto[];

  @ApiProperty({
    description: "Patrones temporales de uso",
    type: [TemporalUsagePatternDto],
  })
  temporalPatterns: TemporalUsagePatternDto[];

  @ApiProperty({
    description: "Período analizado",
    type: Object,
    example: {
      startDate: "2025-01-01T00:00:00.000Z",
      endDate: "2025-12-31T23:59:59.999Z",
    },
  })
  period: {
    startDate: string;
    endDate: string;
  };
}
