import { ApiProperty } from "@nestjs/swagger";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

/**
 * DTO para actualizar un rol existente
 */
export class UpdateRoleDto {
  @ApiProperty({
    description: "Nombre para mostrar del rol",
    example: "Docente Senior",
    minLength: 3,
    maxLength: 50,
    required: false,
  })
  @IsString({ message: "El nombre para mostrar debe ser una cadena" })
  @MinLength(3, {
    message: "El nombre para mostrar debe tener al menos 3 caracteres",
  })
  @MaxLength(50, {
    message: "El nombre para mostrar no puede exceder 50 caracteres",
  })
  @IsOptional()
  displayName?: string;

  @ApiProperty({
    description: "Descripción del rol",
    example:
      "Docente con privilegios adicionales para gestión de laboratorios.",
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
    description: "IDs de los permisos asociados al rol",
    example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
    type: [String],
    required: false,
  })
  @IsArray({ message: "Los permisos deben ser un arreglo" })
  @ArrayMinSize(1, { message: "Debe asignar al menos un permiso al rol" })
  @IsString({ each: true, message: "Cada permiso debe ser un ID válido" })
  @IsOptional()
  permissionIds?: string[];

  @ApiProperty({
    description: "Indica si el rol está activo",
    example: true,
    required: false,
  })
  @IsBoolean({ message: "El campo isActive debe ser un booleano" })
  @IsOptional()
  isActive?: boolean;
}
