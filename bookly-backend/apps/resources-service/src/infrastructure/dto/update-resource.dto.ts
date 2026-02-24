import { ResourceStatus, ResourceType } from "@libs/common/enums";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

/**
 * Update Resource DTO
 * Datos de entrada para actualizar un recurso existente
 */
export class UpdateResourceDto {
  @ApiProperty({
    description: "Código único del recurso",
    example: "LAB-SIS-101",
    required: false,
  })
  @IsString({ message: "El código debe ser un string" })
  @IsOptional()
  code?: string;

  @ApiProperty({
    description: "Nombre del recurso",
    example: "Laboratorio de Sistemas 101",
    required: false,
  })
  @IsString({ message: "El nombre debe ser un string" })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: "Descripción detallada del recurso",
    required: false,
  })
  @IsString({ message: "La descripción debe ser un string" })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: "Tipo de recurso",
    enum: ResourceType,
    required: false,
  })
  @IsEnum(ResourceType, { message: "Tipo de recurso inválido" })
  @IsOptional()
  type?: ResourceType;

  @ApiProperty({
    description: "ID de la categoría del recurso",
    required: false,
  })
  @IsString({ message: "El categoryId debe ser un string" })
  @IsOptional()
  categoryId?: string;

  @ApiProperty({
    description: "Capacidad del recurso",
    minimum: 1,
    required: false,
  })
  @IsNumber({}, { message: "La capacidad debe ser un número" })
  @Min(1, { message: "La capacidad debe ser al menos 1" })
  @IsOptional()
  capacity?: number;

  @ApiProperty({
    description: "Ubicación del recurso",
    required: false,
  })
  @IsString({ message: "La ubicación debe ser un string" })
  @IsOptional()
  location?: string;

  @ApiProperty({
    description: "Piso donde se encuentra el recurso",
    required: false,
  })
  @IsString({ message: "El piso debe ser un string" })
  @IsOptional()
  floor?: string;

  @ApiProperty({
    description: "Edificio donde se encuentra el recurso",
    required: false,
  })
  @IsString({ message: "El edificio debe ser un string" })
  @IsOptional()
  building?: string;

  @ApiProperty({
    description: "Atributos adicionales del recurso",
    required: false,
  })
  @IsObject({ message: "Los atributos deben ser un objeto" })
  @IsOptional()
  attributes?: Record<string, any>;

  @ApiProperty({
    description: "IDs de programas académicos asociados",
    required: false,
  })
  @IsArray({ message: "Los programIds deben ser un array" })
  @IsString({ each: true, message: "Cada programId debe ser un string" })
  @IsOptional()
  programIds?: string[];

  @ApiProperty({
    description: "Estado del recurso",
    enum: ResourceStatus,
    required: false,
  })
  @IsEnum(ResourceStatus, { message: "Estado inválido" })
  @IsOptional()
  status?: ResourceStatus;

  @ApiProperty({
    description: "Indica si el recurso está activo",
    required: false,
  })
  @IsBoolean({ message: "isActive debe ser un booleano" })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: "Reglas de disponibilidad del recurso",
    required: false,
  })
  @IsObject({ message: "Las reglas de disponibilidad deben ser un objeto" })
  @IsOptional()
  availabilityRules?: {
    requiresApproval?: boolean;
    maxAdvanceBookingDays?: number;
    minBookingDurationMinutes?: number;
    maxBookingDurationMinutes?: number;
    allowRecurring?: boolean;
  };
}
