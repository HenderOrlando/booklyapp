import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

/**
 * DTO para crear un nuevo permiso
 */
export class CreatePermissionDto {
  @ApiProperty({
    description: "Código único del permiso (resource:action)",
    example: "resources:read",
    minLength: 5,
    maxLength: 100,
  })
  @IsString({ message: "El código debe ser una cadena" })
  @MinLength(5, { message: "El código debe tener al menos 5 caracteres" })
  @MaxLength(100, { message: "El código no puede exceder 100 caracteres" })
  @IsNotEmpty({ message: "El código es obligatorio" })
  code: string;

  @ApiProperty({
    description: "Nombre descriptivo del permiso",
    example: "Ver Recursos",
    minLength: 3,
    maxLength: 100,
  })
  @IsString({ message: "El nombre debe ser una cadena" })
  @MinLength(3, { message: "El nombre debe tener al menos 3 caracteres" })
  @MaxLength(100, { message: "El nombre no puede exceder 100 caracteres" })
  @IsNotEmpty({ message: "El nombre es obligatorio" })
  name: string;

  @ApiProperty({
    description: "Descripción del permiso",
    example: "Permite ver la lista de recursos del sistema",
    minLength: 10,
    maxLength: 500,
  })
  @IsString({ message: "La descripción debe ser una cadena" })
  @MinLength(10, {
    message: "La descripción debe tener al menos 10 caracteres",
  })
  @MaxLength(500, { message: "La descripción no puede exceder 500 caracteres" })
  @IsNotEmpty({ message: "La descripción es obligatoria" })
  description: string;

  @ApiProperty({
    description: "Recurso al que aplica el permiso",
    example: "resources",
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: "El recurso debe ser una cadena" })
  @MinLength(2, { message: "El recurso debe tener al menos 2 caracteres" })
  @MaxLength(50, { message: "El recurso no puede exceder 50 caracteres" })
  @IsNotEmpty({ message: "El recurso es obligatorio" })
  resource: string;

  @ApiProperty({
    description: "Acción que permite el permiso",
    example: "read",
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: "La acción debe ser una cadena" })
  @MinLength(2, { message: "La acción debe tener al menos 2 caracteres" })
  @MaxLength(50, { message: "La acción no puede exceder 50 caracteres" })
  @IsNotEmpty({ message: "La acción es obligatoria" })
  action: string;

  @ApiProperty({
    description: "Indica si el permiso está activo",
    example: true,
    default: true,
  })
  @IsBoolean({ message: "El campo isActive debe ser un booleano" })
  @IsOptional()
  isActive?: boolean;
}
