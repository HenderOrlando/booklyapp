import { CategoryType } from "@libs/common/enums";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";

/**
 * Update Category DTO
 * Datos de entrada para actualizar una categoría existente
 */
export class UpdateCategoryDto {
  @ApiProperty({
    description: "Código único de la categoría",
    example: "LAB-COMP",
    required: false,
  })
  @IsString({ message: "El código debe ser un string" })
  @IsOptional()
  code?: string;

  @ApiProperty({
    description: "Nombre de la categoría",
    example: "Laboratorios de Computación",
    required: false,
  })
  @IsString({ message: "El nombre debe ser un string" })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: "Descripción de la categoría",
    example: "Categoría para laboratorios con equipos de cómputo",
    required: false,
  })
  @IsString({ message: "La descripción debe ser un string" })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: "Tipo de categoría",
    enum: CategoryType,
    example: CategoryType.RESOURCE_TYPE,
    required: false,
  })
  @IsEnum(CategoryType, { message: "Tipo de categoría inválido" })
  @IsOptional()
  type?: CategoryType;

  @ApiProperty({
    description: "Color hexadecimal para la categoría",
    example: "#3B82F6",
    required: false,
  })
  @IsString({ message: "El color debe ser un string" })
  @IsOptional()
  color?: string;

  @ApiProperty({
    description: "Icono de la categoría",
    example: "computer",
    required: false,
  })
  @IsString({ message: "El icono debe ser un string" })
  @IsOptional()
  icon?: string;

  @ApiProperty({
    description: "ID de la categoría padre (para jerarquías)",
    example: "507f1f77bcf86cd799439011",
    required: false,
  })
  @IsString({ message: "El parentId debe ser un string" })
  @IsOptional()
  parentId?: string;

  @ApiProperty({
    description: "Indica si la categoría está activa",
    required: false,
  })
  @IsBoolean({ message: "isActive debe ser un booleano" })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: "Metadatos adicionales de la categoría",
    example: { priority: 1, order: 10 },
    required: false,
  })
  @IsObject({ message: "Los metadatos deben ser un objeto" })
  @IsOptional()
  metadata?: Record<string, any>;
}
