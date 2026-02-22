import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateReferenceDataRequestDto {
  @ApiProperty({ description: "Grupo lógico (ej: resource_type)", example: "resource_type" })
  @IsString()
  @IsNotEmpty()
  group: string;

  @ApiProperty({ description: "Código único dentro del grupo", example: "CLASSROOM" })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: "Nombre legible", example: "Salón de Clase" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: "Descripción extendida" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: "Color hex para UI", example: "#3B82F6" })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: "Icono para UI", example: "school" })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ description: "Orden de visualización", example: 0 })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ description: "Si es el valor por defecto del grupo", example: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: "Metadatos adicionales" })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateReferenceDataRequestDto {
  @ApiPropertyOptional({ description: "Nombre legible" })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: "Descripción extendida" })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: "Color hex para UI" })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: "Icono para UI" })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ description: "Orden de visualización" })
  @IsNumber()
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ description: "Si está activo" })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: "Si es el valor por defecto del grupo" })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: "Metadatos adicionales" })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
