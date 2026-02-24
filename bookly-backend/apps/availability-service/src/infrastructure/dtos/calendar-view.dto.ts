import { CalendarViewType, SlotStatus } from "@libs/common/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

/**
 * DTO para solicitar vista de calendario
 */
export class CalendarViewDto {
  @ApiProperty({
    description: "Tipo de vista",
    enum: CalendarViewType,
    example: CalendarViewType.MONTH,
  })
  @IsEnum(CalendarViewType)
  view: CalendarViewType;

  @ApiProperty({
    description: "Año",
    minimum: 2020,
    maximum: 2100,
    example: 2025,
  })
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(2100)
  year: number;

  @ApiPropertyOptional({
    description: "Mes (1-12, requerido para vista mensual)",
    minimum: 1,
    maximum: 12,
    example: 11,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiPropertyOptional({
    description: "Número de semana (1-53, requerido para vista semanal)",
    minimum: 1,
    maximum: 53,
    example: 45,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(53)
  week?: number;

  @ApiPropertyOptional({
    description: "Fecha específica (ISO 8601, requerido para vista diaria)",
    example: "2025-11-08",
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({
    description: "ID del recurso",
    example: "507f1f77bcf86cd799439011",
  })
  @IsString()
  resourceId: string;
}

/**
 * DTO de slot de calendario
 */
export class CalendarSlotDto {
  @ApiProperty({
    description: "Fecha del slot",
    example: "2025-11-08",
  })
  date: string;

  @ApiProperty({
    description: "Hora de inicio",
    example: "09:00",
  })
  startTime: string;

  @ApiProperty({
    description: "Hora de fin",
    example: "11:00",
  })
  endTime: string;

  @ApiProperty({
    description: "Estado del slot",
    enum: SlotStatus,
    example: SlotStatus.AVAILABLE,
  })
  status: SlotStatus;

  @ApiProperty({
    description: "Código de color hexadecimal",
    example: "#4CAF50",
  })
  color: string;

  @ApiPropertyOptional({
    description: "ID de la reserva (si está reservado)",
    example: "507f1f77bcf86cd799439012",
  })
  reservationId?: string;

  @ApiPropertyOptional({
    description: "ID del usuario que reservó (si está reservado)",
    example: "507f1f77bcf86cd799439013",
  })
  userId?: string;

  @ApiProperty({
    description: "Metadatos del slot",
  })
  metadata: {
    resourceId: string;
    resourceName?: string;
    capacity?: number;
    canBook: boolean;
    remainingCapacity?: number;
    isRecurring?: boolean;
  };
}

/**
 * Leyenda de colores
 */
export class CalendarLegendDto {
  @ApiProperty({
    description: "Color para slots disponibles",
    example: "#4CAF50",
  })
  available: string;

  @ApiProperty({
    description: "Color para slots reservados",
    example: "#F44336",
  })
  reserved: string;

  @ApiProperty({
    description: "Color para slots pendientes de aprobación",
    example: "#FFC107",
  })
  pending: string;

  @ApiProperty({
    description: "Color para slots bloqueados o en mantenimiento",
    example: "#9E9E9E",
  })
  blocked: string;

  @ApiProperty({
    description: "Color para reservas propias del usuario",
    example: "#2196F3",
  })
  ownReservation: string;
}

/**
 * DTO de respuesta de vista de calendario
 */
export class CalendarViewResponseDto {
  @ApiProperty({
    description: "Tipo de vista",
    example: "month",
  })
  view: string;

  @ApiProperty({
    description: "Período de la vista",
    example: {
      start: "2025-11-01T00:00:00Z",
      end: "2025-11-30T23:59:59Z",
    },
  })
  period: {
    start: string;
    end: string;
  };

  @ApiProperty({
    description: "Lista de slots del calendario",
    type: [CalendarSlotDto],
  })
  slots: CalendarSlotDto[];

  @ApiProperty({
    description: "Leyenda de colores",
    type: CalendarLegendDto,
  })
  legend: CalendarLegendDto;

  @ApiProperty({
    description: "Información del recurso",
  })
  resource: {
    id: string;
    name?: string;
    type?: string;
  };

  @ApiProperty({
    description: "Metadatos adicionales",
  })
  metadata: {
    totalSlots: number;
    availableSlots: number;
    reservedSlots: number;
    blockedSlots: number;
    timezone: string;
    generatedAt: string;
  };
}
