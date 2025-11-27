import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";

/**
 * Provider Configuration DTO
 */
export class ProviderConfigDto {
  @ApiProperty({ description: "Tipo de proveedor", example: "NODEMAILER" })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiProperty({
    description: "Dirección de origen",
    example: "noreply@bookly.ufps.edu.co",
  })
  @IsString()
  @IsNotEmpty()
  from: string;

  @ApiProperty({
    description: "Configuración específica del proveedor",
    example: { host: "smtp.gmail.com", port: 587, secure: false },
  })
  @IsObject()
  @IsNotEmpty()
  config: Record<string, any>;
}

/**
 * Create Tenant Notification Config DTO
 */
export class CreateTenantNotificationConfigDto {
  @ApiProperty({ description: "ID del tenant", example: "ufps-cucuta" })
  @IsString()
  @IsNotEmpty()
  tenantId: string;

  @ApiPropertyOptional({
    description: "Configuración del proveedor de email",
    type: ProviderConfigDto,
  })
  @IsOptional()
  @IsObject()
  emailProvider?: ProviderConfigDto;

  @ApiPropertyOptional({
    description: "Configuración del proveedor de SMS",
    type: ProviderConfigDto,
  })
  @IsOptional()
  @IsObject()
  smsProvider?: ProviderConfigDto;

  @ApiPropertyOptional({
    description: "Configuración del proveedor de WhatsApp",
    type: ProviderConfigDto,
  })
  @IsOptional()
  @IsObject()
  whatsappProvider?: ProviderConfigDto;

  @ApiPropertyOptional({
    description: "Estado activo",
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * Update Tenant Notification Config DTO
 */
export class UpdateTenantNotificationConfigDto {
  @ApiPropertyOptional({
    description: "Configuración del proveedor de email",
    type: ProviderConfigDto,
  })
  @IsOptional()
  @IsObject()
  emailProvider?: ProviderConfigDto;

  @ApiPropertyOptional({
    description: "Configuración del proveedor de SMS",
    type: ProviderConfigDto,
  })
  @IsOptional()
  @IsObject()
  smsProvider?: ProviderConfigDto;

  @ApiPropertyOptional({
    description: "Configuración del proveedor de WhatsApp",
    type: ProviderConfigDto,
  })
  @IsOptional()
  @IsObject()
  whatsappProvider?: ProviderConfigDto;

  @ApiPropertyOptional({ description: "Estado activo", example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

/**
 * Tenant Notification Config Response DTO
 */
export class TenantNotificationConfigResponseDto {
  @ApiProperty({ description: "ID de la configuración" })
  id: string;

  @ApiProperty({ description: "ID del tenant" })
  tenantId: string;

  @ApiPropertyOptional({ description: "Configuración del proveedor de email" })
  emailProvider?: ProviderConfigDto;

  @ApiPropertyOptional({ description: "Configuración del proveedor de SMS" })
  smsProvider?: ProviderConfigDto;

  @ApiPropertyOptional({
    description: "Configuración del proveedor de WhatsApp",
  })
  whatsappProvider?: ProviderConfigDto;

  @ApiProperty({ description: "Estado activo" })
  isActive: boolean;

  @ApiProperty({ description: "Fecha de creación" })
  createdAt: Date;

  @ApiProperty({ description: "Fecha de actualización" })
  updatedAt: Date;
}
