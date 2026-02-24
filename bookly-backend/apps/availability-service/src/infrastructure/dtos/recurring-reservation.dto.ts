import { RecurrenceType } from "@libs/common/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from "class-validator";

/**
 * Patrón de recurrencia para reservas periódicas
 */
export class RecurrencePatternDto {
  @ApiProperty({
    description: "Frecuencia de recurrencia",
    enum: RecurrenceType,
    example: RecurrenceType.WEEKLY,
  })
  @IsEnum(RecurrenceType)
  @IsNotEmpty()
  frequency: RecurrenceType;

  @ApiProperty({
    description: "Intervalo entre recurrencias (cada N días/semanas/meses)",
    example: 1,
    minimum: 1,
    maximum: 12,
  })
  @IsInt()
  @Min(1)
  @Max(12)
  interval: number;

  @ApiPropertyOptional({
    description: "Fecha de finalización de la serie (ISO 8601)",
    example: "2025-06-30T23:59:59Z",
  })
  @IsDateString()
  @IsOptional()
  @ValidateIf((o) => !o.occurrences)
  endDate?: string;

  @ApiPropertyOptional({
    description: "Número de ocurrencias",
    example: 10,
    minimum: 1,
    maximum: 365,
  })
  @IsInt()
  @Min(1)
  @Max(365)
  @IsOptional()
  @ValidateIf((o) => !o.endDate)
  occurrences?: number;

  @ApiPropertyOptional({
    description:
      "Días de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado). Requerido para weekly.",
    type: [Number],
    example: [1, 3, 5],
  })
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  @IsOptional()
  @ValidateIf((o) => o.frequency === RecurrenceType.WEEKLY)
  daysOfWeek?: number[];

  @ApiPropertyOptional({
    description: "Día del mes (1-31). Requerido para monthly.",
    example: 15,
    minimum: 1,
    maximum: 31,
  })
  @IsInt()
  @Min(1)
  @Max(31)
  @IsOptional()
  @ValidateIf((o) => o.frequency === RecurrenceType.MONTHLY)
  monthDay?: number;
}

/**
 * DTO para crear reserva recurrente
 */
export class CreateRecurringReservationDto {
  @ApiProperty({
    description: "ID del recurso a reservar",
    example: "507f1f77bcf86cd799439011",
  })
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({
    description: "Fecha y hora de inicio de la primera instancia (ISO 8601)",
    example: "2025-01-06T08:00:00Z",
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: "Fecha y hora de finalización de cada instancia (ISO 8601)",
    example: "2025-01-06T10:00:00Z",
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({
    description: "Propósito de la reserva",
    example: "Clase de Programación Avanzada",
  })
  @IsString()
  @IsNotEmpty()
  purpose: string;

  @ApiProperty({
    description: "Patrón de recurrencia",
    type: RecurrencePatternDto,
  })
  @ValidateNested()
  @Type(() => RecurrencePatternDto)
  @IsNotEmpty()
  recurrencePattern: RecurrencePatternDto;

  @ApiPropertyOptional({
    description: "Participantes adicionales",
    type: [Object],
    example: [
      {
        userId: "507f1f77bcf86cd799439012",
        name: "Juan Pérez",
        email: "juan.perez@example.com",
      },
    ],
  })
  @IsArray()
  @IsOptional()
  participants?: {
    userId: string;
    name: string;
    email: string;
  }[];

  @ApiPropertyOptional({
    description: "Notas adicionales",
    example: "Traer laptop personal",
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description:
      "Si true, falla si alguna instancia tiene conflicto. Si false, crea solo las instancias sin conflicto.",
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  createAllOrNone?: boolean;
}

/**
 * Información de instancia fallida
 */
export class FailedInstanceDto {
  @ApiProperty({
    description: "Fecha de la instancia fallida (ISO 8601)",
    example: "2025-01-13T08:00:00Z",
  })
  date: string;

  @ApiProperty({
    description: "Razón del fallo",
    example: "Conflicto con reserva existente",
  })
  reason: string;

  @ApiPropertyOptional({
    description: "ID de la reserva conflictiva",
    example: "507f1f77bcf86cd799439099",
  })
  conflictingReservationId?: string;
}

/**
 * Información de una instancia de la serie
 */
export class ReservationInstanceDto {
  @ApiProperty({
    description: "ID de la instancia",
    example: "507f1f77bcf86cd799439015",
  })
  id: string;

  @ApiProperty({
    description: "Número de instancia en la serie",
    example: 3,
  })
  instanceNumber: number;

  @ApiProperty({
    description: "Fecha y hora de inicio (ISO 8601)",
    example: "2025-01-13T08:00:00Z",
  })
  startDate: string;

  @ApiProperty({
    description: "Fecha y hora de finalización (ISO 8601)",
    example: "2025-01-13T10:00:00Z",
  })
  endDate: string;

  @ApiProperty({
    description: "Estado de la instancia",
    example: "pending",
  })
  status: string;

  @ApiPropertyOptional({
    description: "Si esta instancia es una excepción de la serie",
    default: false,
  })
  isException?: boolean;
}

/**
 * Respuesta de creación de reserva recurrente
 */
export class RecurringReservationResponseDto {
  @ApiProperty({
    description: "ID único de la serie",
    example: "series-abc123",
  })
  seriesId: string;

  @ApiProperty({
    description: "ID de la reserva maestra",
    example: "507f1f77bcf86cd799439014",
  })
  masterReservationId: string;

  @ApiProperty({
    description: "Instancias de la serie",
    type: [ReservationInstanceDto],
  })
  instances: ReservationInstanceDto[];

  @ApiProperty({
    description: "Total de instancias en la serie",
    example: 10,
  })
  totalInstances: number;

  @ApiProperty({
    description: "Instancias creadas exitosamente",
    example: 10,
  })
  successfulInstances: number;

  @ApiProperty({
    description: "Instancias que fallaron",
    type: [FailedInstanceDto],
  })
  failedInstances: FailedInstanceDto[];

  @ApiProperty({
    description: "Patrón de recurrencia aplicado",
    type: RecurrencePatternDto,
  })
  pattern: RecurrencePatternDto;

  @ApiPropertyOptional({
    description: "Tiempo de ejecución en milisegundos",
    example: 1250,
  })
  executionTimeMs?: number;
}

/**
 * DTO para actualizar serie recurrente
 */
export class UpdateRecurringSeriesDto {
  @ApiPropertyOptional({
    description: "Nueva fecha y hora de inicio (ISO 8601)",
    example: "2025-01-06T09:00:00Z",
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: "Nueva fecha y hora de finalización (ISO 8601)",
    example: "2025-01-06T11:00:00Z",
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: "Nuevo propósito",
    example: "Clase de Programación Avanzada - Actualizado",
  })
  @IsString()
  @IsOptional()
  purpose?: string;

  @ApiPropertyOptional({
    description: "Notas adicionales",
    example: "Se cambió el horario",
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({
    description:
      "Si true, actualiza toda la serie. Si false, solo instancias futuras.",
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  updatePastInstances?: boolean;
}

/**
 * DTO para cancelar serie recurrente
 */
export class CancelRecurringSeriesDto {
  @ApiProperty({
    description: "Razón de la cancelación",
    example: "Cambio de plan de estudios",
  })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({
    description:
      "Si true, cancela toda la serie. Si false, solo instancias futuras.",
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  cancelPastInstances?: boolean;
}

/**
 * DTO para cancelar instancia individual
 */
export class CancelInstanceDto {
  @ApiProperty({
    description: "ID de la instancia a cancelar",
    example: "507f1f77bcf86cd799439015",
  })
  @IsString()
  @IsNotEmpty()
  instanceId: string;

  @ApiProperty({
    description: "Razón de la cancelación",
    example: "Feriado nacional",
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

/**
 * DTO para modificar instancia individual
 */
export class ModifyInstanceDto {
  @ApiProperty({
    description: "ID de la instancia a modificar",
    example: "507f1f77bcf86cd799439015",
  })
  @IsString()
  @IsNotEmpty()
  instanceId: string;

  @ApiPropertyOptional({
    description: "Nueva fecha y hora de inicio (ISO 8601)",
    example: "2025-01-13T09:00:00Z",
  })
  @IsDateString()
  @IsOptional()
  newStartDate?: string;

  @ApiPropertyOptional({
    description: "Nueva fecha y hora de finalización (ISO 8601)",
    example: "2025-01-13T11:00:00Z",
  })
  @IsDateString()
  @IsOptional()
  newEndDate?: string;

  @ApiPropertyOptional({
    description: "Nuevo propósito",
    example: "Clase especial",
  })
  @IsString()
  @IsOptional()
  purpose?: string;

  @ApiPropertyOptional({
    description: "Razón de la modificación",
    example: "Ajuste de horario por evento especial",
  })
  @IsString()
  @IsOptional()
  reason?: string;
}

/**
 * Filtros para consultar series recurrentes
 */
export class RecurringReservationFiltersDto {
  @ApiPropertyOptional({
    description: "ID del usuario propietario",
    example: "507f1f77bcf86cd799439012",
  })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    description: "ID del recurso",
    example: "507f1f77bcf86cd799439011",
  })
  @IsString()
  @IsOptional()
  resourceId?: string;

  @ApiPropertyOptional({
    description: "Fecha de inicio del rango de búsqueda (ISO 8601)",
    example: "2025-01-01T00:00:00Z",
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: "Fecha de fin del rango de búsqueda (ISO 8601)",
    example: "2025-06-30T23:59:59Z",
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: "Estado de las instancias",
    example: "pending",
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: "Incluir instancias en la respuesta",
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  includeInstances?: boolean;

  @ApiPropertyOptional({
    description: "Número de página",
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: "Tamaño de página",
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}
