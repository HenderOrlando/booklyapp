import { ExceptionReason } from "@libs/common/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

/**
 * DTO para crear excepción de disponibilidad
 */
export class CreateAvailabilityExceptionDto {
  @ApiProperty({
    description: "ID del recurso",
    example: "507f1f77bcf86cd799439011",
  })
  @IsMongoId()
  resourceId: string;

  @ApiProperty({
    description: "Fecha de la excepción (YYYY-MM-DD)",
    example: "2025-12-25",
  })
  @IsDate()
  @Type(() => Date)
  exceptionDate: Date;

  @ApiProperty({
    description: "Motivo de la excepción",
    enum: ExceptionReason,
    example: ExceptionReason.HOLIDAY,
  })
  @IsEnum(ExceptionReason)
  reason: ExceptionReason;

  @ApiPropertyOptional({
    description: "Razón personalizada (requerido si reason es CUSTOM)",
    example: "Evento especial de la universidad",
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  customReason?: string;

  @ApiProperty({
    description:
      "¿Está disponible? (false = bloqueado, true = disponible excepcionalmente)",
    example: false,
    default: false,
  })
  @IsBoolean()
  isAvailable: boolean;

  @ApiPropertyOptional({
    description:
      "Hora de inicio del bloqueo parcial (HH:mm) - Opcional para bloqueos de horas específicas",
    example: "14:00",
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "startTime debe estar en formato HH:mm",
  })
  startTime?: string;

  @ApiPropertyOptional({
    description: "Hora de fin del bloqueo parcial (HH:mm)",
    example: "18:00",
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "endTime debe estar en formato HH:mm",
  })
  endTime?: string;

  @ApiPropertyOptional({
    description: "Notas adicionales sobre la excepción",
    example: "Cerrado por festividad nacional",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

/**
 * DTO para consultar excepciones
 */
export class QueryAvailabilityExceptionsDto {
  @ApiPropertyOptional({
    description: "Filtrar por ID de recurso",
    example: "507f1f77bcf86cd799439011",
  })
  @IsOptional()
  @IsMongoId()
  resourceId?: string;

  @ApiPropertyOptional({
    description: "Fecha desde (YYYY-MM-DD)",
    example: "2025-11-01",
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({
    description: "Fecha hasta (YYYY-MM-DD)",
    example: "2025-12-31",
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiPropertyOptional({
    description: "Filtrar por motivo",
    enum: ExceptionReason,
  })
  @IsOptional()
  @IsEnum(ExceptionReason)
  reason?: ExceptionReason;

  @ApiPropertyOptional({
    description: "Filtrar por disponibilidad",
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

/**
 * DTO para actualizar excepción de disponibilidad
 */
export class UpdateAvailabilityExceptionDto {
  @ApiPropertyOptional({
    description: "Nuevo motivo de la excepción",
    enum: ExceptionReason,
  })
  @IsOptional()
  @IsEnum(ExceptionReason)
  reason?: ExceptionReason;

  @ApiPropertyOptional({
    description: "Nueva razón personalizada",
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  customReason?: string;

  @ApiPropertyOptional({
    description: "Cambiar disponibilidad",
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({
    description: "Nueva hora de inicio",
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
  startTime?: string;

  @ApiPropertyOptional({
    description: "Nueva hora de fin",
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
  endTime?: string;

  @ApiPropertyOptional({
    description: "Actualizar notas",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

/**
 * DTO de respuesta para excepción
 */
export class AvailabilityExceptionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  resourceId: string;

  @ApiProperty()
  exceptionDate: Date;

  @ApiProperty({ enum: ExceptionReason })
  reason: ExceptionReason;

  @ApiPropertyOptional()
  customReason?: string;

  @ApiProperty()
  isAvailable: boolean;

  @ApiPropertyOptional()
  startTime?: string;

  @ApiPropertyOptional()
  endTime?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  createdBy: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
