import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsEmail,
  IsIn,
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
    description: "Nombre de usuario",
    example: "juan.perez",
    required: false,
  })
  @IsString({ message: "Username debe ser un string" })
  @IsOptional()
  username?: string;

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
    example: ["STUDENT"],
    isArray: true,
    required: false,
  })
  @IsArray({ message: "Roles debe ser un array" })
  @IsString({ each: true, message: "Cada rol debe ser un string" })
  @IsOptional()
  roles?: string[];

  @ApiProperty({
    description: "Permisos adicionales del usuario",
    example: ["READ_RESOURCES"],
    required: false,
  })
  @IsArray({ message: "Permisos debe ser un array" })
  @IsString({ each: true, message: "Cada permiso debe ser un string" })
  @IsOptional()
  permissions?: string[];

  @ApiProperty({
    description: "Teléfono del usuario",
    example: "+573001234567",
    required: false,
  })
  @IsString({ message: "Teléfono debe ser un string" })
  @IsOptional()
  phone?: string;

  @ApiProperty({
    description: "Tipo de documento",
    enum: ["CC", "TI", "CE", "PASSPORT", "DNI", "OTHER"],
    example: "CC",
    required: false,
  })
  @IsString({ message: "Tipo de documento debe ser un string" })
  @IsIn(["CC", "TI", "CE", "PASSPORT", "DNI", "OTHER"], {
    message: "Tipo de documento inválido",
  })
  @IsOptional()
  documentType?: string;

  @ApiProperty({
    description: "Número de documento",
    example: "1098723456",
    required: false,
  })
  @IsString({ message: "Número de documento debe ser un string" })
  @IsOptional()
  documentNumber?: string;

  @ApiProperty({
    description: "Tenant del usuario",
    example: "UFPS",
    required: false,
  })
  @IsString({ message: "tenantId debe ser un string" })
  @IsOptional()
  tenantId?: string;
}
