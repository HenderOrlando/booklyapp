import { UserRole } from "@libs/common/enums";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

/**
 * Register User DTO
 * Datos de entrada para registrar un nuevo usuario
 */
export class RegisterDto {
  @ApiProperty({
    description: "Email del usuario",
    example: "user@ufps.edu.co",
  })
  @IsEmail({}, { message: "Email debe ser válido" })
  @IsNotEmpty({ message: "Email es requerido" })
  email: string;

  @ApiProperty({
    description: "Contraseña del usuario",
    example: "SecurePassword123!",
    minLength: 8,
  })
  @IsString({ message: "Contraseña debe ser un string" })
  @MinLength(8, { message: "Contraseña debe tener al menos 8 caracteres" })
  @IsNotEmpty({ message: "Contraseña es requerida" })
  password: string;

  @ApiProperty({
    description: "Nombre del usuario",
    example: "Juan",
  })
  @IsString({ message: "Nombre debe ser un string" })
  @IsNotEmpty({ message: "Nombre es requerido" })
  firstName: string;

  @ApiProperty({
    description: "Apellido del usuario",
    example: "Pérez",
  })
  @IsString({ message: "Apellido debe ser un string" })
  @IsNotEmpty({ message: "Apellido es requerido" })
  lastName: string;

  @ApiProperty({
    description: "Roles del usuario",
    example: [UserRole.STUDENT],
    enum: UserRole,
    isArray: true,
    required: false,
  })
  @IsArray({ message: "Roles debe ser un array" })
  @IsEnum(UserRole, { each: true, message: "Roles inválidos" })
  @IsOptional()
  roles?: UserRole[];

  @ApiProperty({
    description: "Permisos adicionales del usuario",
    example: ["READ_RESOURCES"],
    required: false,
  })
  @IsArray({ message: "Permisos debe ser un array" })
  @IsString({ each: true, message: "Cada permiso debe ser un string" })
  @IsOptional()
  permissions?: string[];
}
