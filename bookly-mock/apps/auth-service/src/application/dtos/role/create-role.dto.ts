import { UserRole } from "@libs/common/enums";
import { ApiProperty } from "@nestjs/swagger";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

/**
 * DTO para crear un nuevo rol
 */
export class CreateRoleDto {
  @ApiProperty({
    description: "Nombre del rol (enum UserRole)",
    example: UserRole.TEACHER,
    enum: UserRole,
  })
  @IsEnum(UserRole, {
    message: "El nombre del rol debe ser un UserRole válido",
  })
  @IsNotEmpty({ message: "El nombre del rol es obligatorio" })
  name: UserRole;

  @ApiProperty({
    description: "Nombre para mostrar del rol",
    example: "Docente",
    minLength: 3,
    maxLength: 50,
  })
  @IsString({ message: "El nombre para mostrar debe ser una cadena" })
  @MinLength(3, {
    message: "El nombre para mostrar debe tener al menos 3 caracteres",
  })
  @MaxLength(50, {
    message: "El nombre para mostrar no puede exceder 50 caracteres",
  })
  @IsNotEmpty({ message: "El nombre para mostrar es obligatorio" })
  displayName: string;

  @ApiProperty({
    description: "Descripción del rol",
    example:
      "Puede crear reservas para sus clases y aprobar solicitudes de estudiantes.",
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
    description: "IDs de los permisos asociados al rol",
    example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012"],
    type: [String],
  })
  @IsArray({ message: "Los permisos deben ser un arreglo" })
  @ArrayMinSize(1, { message: "Debe asignar al menos un permiso al rol" })
  @IsString({ each: true, message: "Cada permiso debe ser un ID válido" })
  permissionIds: string[];

  @ApiProperty({
    description: "Indica si el rol está activo",
    example: true,
    default: true,
  })
  @IsBoolean({ message: "El campo isActive debe ser un booleano" })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: "Indica si el rol es del sistema (no puede ser eliminado)",
    example: false,
    default: false,
  })
  @IsBoolean({ message: "El campo isDefault debe ser un booleano" })
  @IsOptional()
  isDefault?: boolean;
}
