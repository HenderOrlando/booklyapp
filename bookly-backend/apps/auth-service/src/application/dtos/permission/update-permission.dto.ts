import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

/**
 * DTO para actualizar un permiso existente
 */
export class UpdatePermissionDto {
  @ApiProperty({
    description: "Nombre descriptivo del permiso",
    example: "Ver y Listar Recursos",
    minLength: 3,
    maxLength: 100,
    required: false,
  })
  @IsString({ message: "El nombre debe ser una cadena" })
  @MinLength(3, { message: "El nombre debe tener al menos 3 caracteres" })
  @MaxLength(100, { message: "El nombre no puede exceder 100 caracteres" })
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: "Descripción del permiso",
    example: "Permite ver y listar todos los recursos del sistema",
    minLength: 10,
    maxLength: 500,
    required: false,
  })
  @IsString({ message: "La descripción debe ser una cadena" })
  @MinLength(10, {
    message: "La descripción debe tener al menos 10 caracteres",
  })
  @MaxLength(500, { message: "La descripción no puede exceder 500 caracteres" })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: "Indica si el permiso está activo",
    example: true,
    required: false,
  })
  @IsBoolean({ message: "El campo isActive debe ser un booleano" })
  @IsOptional()
  isActive?: boolean;
}
