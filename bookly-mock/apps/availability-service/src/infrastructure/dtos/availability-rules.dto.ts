import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

/**
 * DTO for Custom Availability Rules
 */
export class CustomRulesDto {
  @ApiPropertyOptional({
    description: "Solo permitir reservas en horario laboral",
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  businessHoursOnly?: boolean;

  @ApiPropertyOptional({
    description: "Solo permitir reservas entre semana",
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  weekdaysOnly?: boolean;

  @ApiPropertyOptional({
    description: "Número máximo de reservas concurrentes",
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxConcurrentBookings?: number;

  @ApiPropertyOptional({
    description: "Requiere confirmación del solicitante",
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  requiresConfirmation?: boolean;

  @ApiPropertyOptional({
    description: "Permitir cancelación hasta N horas antes",
    example: 24,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  cancellationDeadlineHours?: number;
}

/**
 * DTO for Availability Rules Response
 */
export class AvailabilityRulesDto {
  @ApiProperty({
    description: "ID del recurso",
    example: "resource_12345",
  })
  @IsString()
  resourceId: string;

  @ApiProperty({
    description: "Requiere aprobación para reservar",
    example: true,
  })
  @IsBoolean()
  requiresApproval: boolean;

  @ApiProperty({
    description: "Días máximos de anticipación para reservar",
    example: 90,
  })
  @IsInt()
  @Min(1)
  maxAdvanceBookingDays: number;

  @ApiProperty({
    description: "Duración mínima de reserva en minutos",
    example: 60,
  })
  @IsInt()
  @Min(15)
  minBookingDurationMinutes: number;

  @ApiProperty({
    description: "Duración máxima de reserva en minutos",
    example: 480,
  })
  @IsInt()
  @Min(15)
  maxBookingDurationMinutes: number;

  @ApiProperty({
    description: "Permitir reservas recurrentes",
    example: true,
  })
  @IsBoolean()
  allowRecurring: boolean;

  @ApiPropertyOptional({
    description: "Reglas personalizadas adicionales",
    type: CustomRulesDto,
  })
  @IsOptional()
  @IsObject()
  customRules?: CustomRulesDto;
}

/**
 * DTO for Validation Result
 */
export class ValidationResultDto {
  @ApiProperty({
    description: "Indica si la reserva es válida",
    example: true,
  })
  @IsBoolean()
  isValid: boolean;

  @ApiProperty({
    description: "Lista de errores de validación",
    example: ["Anticipación excedida", "Duración mínima no cumplida"],
    type: [String],
  })
  errors: string[];

  @ApiPropertyOptional({
    description: "Advertencias (no bloquean la reserva)",
    example: ["El recurso puede requerir aprobación adicional"],
    type: [String],
  })
  warnings?: string[];
}
