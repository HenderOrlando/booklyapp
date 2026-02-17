import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsOptional, IsString } from "class-validator";

/**
 * Update User DTO
 * Datos de entrada para actualizar un usuario
 */
export class UpdateUserDto {
  @ApiProperty({
    description: "Nombre del usuario",
    example: "Juan",
    required: false,
  })
  @IsString({ message: "Nombre debe ser un string" })
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: "Apellido del usuario",
    example: "Pérez",
    required: false,
  })
  @IsString({ message: "Apellido debe ser un string" })
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: "Roles del usuario",
    example: ["STUDENT", "TEACHER"],
    isArray: true,
    required: false,
  })
  @IsArray({ message: "Roles debe ser un array" })
  @IsString({ each: true, message: "Cada rol debe ser un string" })
  @IsOptional()
  roles?: string[];

  @ApiProperty({
    description: "Permisos adicionales del usuario",
    example: ["READ_RESOURCES", "CREATE_RESERVATION"],
    required: false,
  })
  @IsArray({ message: "Permisos debe ser un array" })
  @IsString({ each: true, message: "Cada permiso debe ser un string" })
  @IsOptional()
  permissions?: string[];

  @ApiProperty({
    description: "Estado de activación del usuario",
    example: true,
    required: false,
  })
  @IsBoolean({ message: "isActive debe ser un booleano" })
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: "Estado de verificación del email",
    example: true,
    required: false,
  })
  @IsBoolean({ message: "isEmailVerified debe ser un booleano" })
  @IsOptional()
  isEmailVerified?: boolean;
}
