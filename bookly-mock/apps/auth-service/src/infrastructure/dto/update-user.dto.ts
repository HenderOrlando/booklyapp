import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsIn, IsOptional, IsString } from "class-validator";

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

  @ApiProperty({
    description: "Estado de verificación del teléfono",
    example: true,
    required: false,
  })
  @IsBoolean({ message: "isPhoneVerified debe ser un booleano" })
  @IsOptional()
  isPhoneVerified?: boolean;
}
