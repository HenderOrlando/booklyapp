import { ResourceType } from "@libs/common/enums";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

/**
 * Create Resource DTO
 * Datos de entrada para crear un nuevo recurso
 */
export class CreateResourceDto {
  @ApiProperty({
    description: "Código único del recurso",
    example: "LAB-SIS-101",
  })
  @IsString({ message: "El código debe ser un string" })
  @IsNotEmpty({ message: "El código es requerido" })
  code: string;

  @ApiProperty({
    description: "Nombre del recurso",
    example: "Laboratorio de Sistemas 101",
  })
  @IsString({ message: "El nombre debe ser un string" })
  @IsNotEmpty({ message: "El nombre es requerido" })
  name: string;

  @ApiProperty({
    description: "Descripción detallada del recurso",
    example: "Laboratorio equipado con 30 computadores",
  })
  @IsString({ message: "La descripción debe ser un string" })
  @IsNotEmpty({ message: "La descripción es requerida" })
  description: string;

  @ApiProperty({
    description: "Tipo de recurso",
    enum: ResourceType,
    example: ResourceType.LABORATORY,
  })
  @IsEnum(ResourceType, { message: "Tipo de recurso inválido" })
  @IsNotEmpty({ message: "El tipo es requerido" })
  type: ResourceType;

  @ApiProperty({
    description: "ID de la categoría del recurso",
    example: "507f1f77bcf86cd799439011",
  })
  @IsString({ message: "El categoryId debe ser un string" })
  @IsNotEmpty({ message: "El categoryId es requerido" })
  categoryId: string;

  @ApiProperty({
    description: "Capacidad del recurso (personas o unidades)",
    example: 30,
    minimum: 1,
  })
  @IsNumber({}, { message: "La capacidad debe ser un número" })
  @Min(1, { message: "La capacidad debe ser al menos 1" })
  @IsNotEmpty({ message: "La capacidad es requerida" })
  capacity: number;

  @ApiProperty({
    description: "Ubicación del recurso",
    example: "Edificio Francisco de Paula Santander",
  })
  @IsString({ message: "La ubicación debe ser un string" })
  @IsNotEmpty({ message: "La ubicación es requerida" })
  location: string;

  @ApiProperty({
    description: "Piso donde se encuentra el recurso",
    example: "2do piso",
    required: false,
  })
  @IsString({ message: "El piso debe ser un string" })
  @IsOptional()
  floor?: string;

  @ApiProperty({
    description: "Edificio donde se encuentra el recurso",
    example: "Edificio Central",
    required: false,
  })
  @IsString({ message: "El edificio debe ser un string" })
  @IsOptional()
  building?: string;

  @ApiProperty({
    description: "Atributos adicionales del recurso",
    example: { hasProjector: true, hasAirConditioning: true },
    required: false,
  })
  @IsObject({ message: "Los atributos deben ser un objeto" })
  @IsOptional()
  attributes?: Record<string, any>;

  @ApiProperty({
    description: "IDs de programas académicos asociados",
    example: ["ING-SIS", "ING-IND"],
    required: false,
  })
  @IsArray({ message: "Los programIds deben ser un array" })
  @IsString({ each: true, message: "Cada programId debe ser un string" })
  @IsOptional()
  programIds?: string[];

  @ApiProperty({
    description: "Reglas de disponibilidad del recurso",
    required: false,
  })
  @IsObject({ message: "Las reglas de disponibilidad deben ser un objeto" })
  @IsOptional()
  availabilityRules?: {
    requiresApproval: boolean;
    maxAdvanceBookingDays: number;
    minBookingDurationMinutes: number;
    maxBookingDurationMinutes: number;
    allowRecurring: boolean;
  };
}
