import { CategoryType } from "@libs/common/enums";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";

/**
 * Create Category DTO
 * Datos de entrada para crear una nueva categoría
 */
export class CreateCategoryDto {
  @ApiProperty({
    description: "Código único de la categoría",
    example: "LAB-COMP",
  })
  @IsString({ message: "El código debe ser un string" })
  @IsNotEmpty({ message: "El código es requerido" })
  code: string;

  @ApiProperty({
    description: "Nombre de la categoría",
    example: "Laboratorios de Computación",
  })
  @IsString({ message: "El nombre debe ser un string" })
  @IsNotEmpty({ message: "El nombre es requerido" })
  name: string;

  @ApiProperty({
    description: "Descripción de la categoría",
    example: "Categoría para laboratorios con equipos de cómputo",
  })
  @IsString({ message: "La descripción debe ser un string" })
  @IsNotEmpty({ message: "La descripción es requerida" })
  description: string;

  @ApiProperty({
    description: "Tipo de categoría",
    enum: CategoryType,
    example: CategoryType.RESOURCE_TYPE,
  })
  @IsEnum(CategoryType, { message: "Tipo de categoría inválido" })
  @IsNotEmpty({ message: "El tipo es requerido" })
  type: CategoryType;

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
    description: "Metadatos adicionales de la categoría",
    example: { priority: 1, order: 10 },
    required: false,
  })
  @IsObject({ message: "Los metadatos deben ser un objeto" })
  @IsOptional()
  metadata?: Record<string, any>;
}
