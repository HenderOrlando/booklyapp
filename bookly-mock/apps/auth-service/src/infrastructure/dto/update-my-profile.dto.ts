import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional({
    description: "Notificaciones por correo",
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: "Email debe ser boolean" })
  email?: boolean;

  @ApiPropertyOptional({
    description: "Notificaciones push",
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: "Push debe ser boolean" })
  push?: boolean;

  @ApiPropertyOptional({
    description: "Notificaciones por SMS",
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: "SMS debe ser boolean" })
  sms?: boolean;
}

export class UpdateUserPreferencesDto {
  @ApiPropertyOptional({
    description: "Idioma preferido",
    example: "es",
  })
  @IsOptional()
  @IsString({ message: "Idioma debe ser un string" })
  language?: string;

  @ApiPropertyOptional({
    description: "Tema de la interfaz",
    enum: ["light", "dark", "system"],
    example: "system",
  })
  @IsOptional()
  @IsIn(["light", "dark", "system"], { message: "Tema inválido" })
  theme?: "light" | "dark" | "system";

  @ApiPropertyOptional({
    description: "Zona horaria",
    example: "America/Bogota",
  })
  @IsOptional()
  @IsString({ message: "Zona horaria debe ser un string" })
  timezone?: string;

  @ApiPropertyOptional({
    description: "Preferencias de notificación",
    type: UpdateNotificationPreferencesDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateNotificationPreferencesDto)
  notifications?: UpdateNotificationPreferencesDto;
}

/**
 * DTO para actualizar el perfil propio del usuario autenticado.
 */
export class UpdateMyProfileDto {
  @ApiPropertyOptional({
    description: "Nombre del usuario",
    example: "Juan",
  })
  @IsOptional()
  @IsString({ message: "Nombre debe ser un string" })
  firstName?: string;

  @ApiPropertyOptional({
    description: "Apellido del usuario",
    example: "Pérez",
  })
  @IsOptional()
  @IsString({ message: "Apellido debe ser un string" })
  lastName?: string;

  @ApiPropertyOptional({
    description: "Teléfono del usuario",
    example: "+573001234567",
  })
  @IsOptional()
  @IsString({ message: "Teléfono debe ser un string" })
  phone?: string;

  @ApiPropertyOptional({
    description: "Tipo de documento",
    enum: ["CC", "TI", "CE", "PASSPORT"],
    example: "CC",
  })
  @IsOptional()
  @IsIn(["CC", "TI", "CE", "PASSPORT"], {
    message: "Tipo de documento inválido",
  })
  documentType?: string;

  @ApiPropertyOptional({
    description: "Número de documento",
    example: "1098723456",
  })
  @IsOptional()
  @IsString({ message: "Número de documento debe ser un string" })
  documentNumber?: string;

  @ApiPropertyOptional({
    description: "Preferencias de usuario",
    type: UpdateUserPreferencesDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUserPreferencesDto)
  preferences?: UpdateUserPreferencesDto;
}
