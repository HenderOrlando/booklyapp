import { MaintenanceType } from "@libs/common/enums";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

/**
 * Schedule Maintenance DTO
 * Datos de entrada para programar un mantenimiento
 */
export class ScheduleMaintenanceDto {
  @ApiProperty({
    description: "ID del recurso a mantener",
    example: "507f1f77bcf86cd799439011",
  })
  @IsString({ message: "El resourceId debe ser un string" })
  @IsNotEmpty({ message: "El resourceId es requerido" })
  resourceId: string;

  @ApiProperty({
    description: "Tipo de mantenimiento",
    enum: MaintenanceType,
    example: MaintenanceType.PREVENTIVE,
  })
  @IsEnum(MaintenanceType, { message: "Tipo de mantenimiento inválido" })
  @IsNotEmpty({ message: "El tipo es requerido" })
  type: MaintenanceType;

  @ApiProperty({
    description: "Título del mantenimiento",
    example: "Mantenimiento preventivo mensual",
  })
  @IsString({ message: "El título debe ser un string" })
  @IsNotEmpty({ message: "El título es requerido" })
  title: string;

  @ApiProperty({
    description: "Descripción detallada del mantenimiento",
    example: "Revisión y limpieza de equipos de cómputo",
  })
  @IsString({ message: "La descripción debe ser un string" })
  @IsNotEmpty({ message: "La descripción es requerida" })
  description: string;

  @ApiProperty({
    description: "Fecha y hora de inicio programada",
    example: "2024-12-01T08:00:00Z",
  })
  @IsDateString({}, { message: "La fecha de inicio debe ser una fecha válida" })
  @IsNotEmpty({ message: "La fecha de inicio es requerida" })
  scheduledStartDate: string;

  @ApiProperty({
    description: "Fecha y hora de fin programada",
    example: "2024-12-01T12:00:00Z",
  })
  @IsDateString({}, { message: "La fecha de fin debe ser una fecha válida" })
  @IsNotEmpty({ message: "La fecha de fin es requerida" })
  scheduledEndDate: string;

  @ApiProperty({
    description: "Persona responsable del mantenimiento",
    example: "Juan Pérez",
    required: false,
  })
  @IsString({ message: "El responsable debe ser un string" })
  @IsOptional()
  performedBy?: string;

  @ApiProperty({
    description: "Costo estimado del mantenimiento",
    example: 150000,
    minimum: 0,
    required: false,
  })
  @IsNumber({}, { message: "El costo debe ser un número" })
  @Min(0, { message: "El costo debe ser mayor o igual a 0" })
  @IsOptional()
  cost?: number;

  @ApiProperty({
    description: "Notas adicionales del mantenimiento",
    example: "Requiere desconexión de equipos",
    required: false,
  })
  @IsString({ message: "Las notas deben ser un string" })
  @IsOptional()
  notes?: string;

  @ApiProperty({
    description: "Indica si el mantenimiento afecta la disponibilidad",
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean({ message: "affectsAvailability debe ser un booleano" })
  @IsOptional()
  affectsAvailability?: boolean;
}
