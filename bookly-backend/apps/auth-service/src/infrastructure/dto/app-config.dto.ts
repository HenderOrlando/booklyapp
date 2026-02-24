import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export class AppConfigFeaturesDto {
  @ApiPropertyOptional({
    description: "Habilita notificaciones de la plataforma",
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: "enableNotifications debe ser un booleano" })
  enableNotifications?: boolean;

  @ApiPropertyOptional({
    description: "Habilita funciones en tiempo real (WebSocket)",
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: "enableRealtime debe ser un booleano" })
  enableRealtime?: boolean;
}

export class UpdateAppConfigDto {
  @ApiPropertyOptional({
    description: "Habilita registro manual de usuarios",
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: "registrationEnabled debe ser un booleano" })
  registrationEnabled?: boolean;

  @ApiPropertyOptional({
    description: "Habilita autenticacion corporativa",
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: "corporateAuthEnabled debe ser un booleano" })
  corporateAuthEnabled?: boolean;

  @ApiPropertyOptional({
    description: "Dominios permitidos para SSO",
    example: ["ufps.edu.co"],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: "allowedDomains debe ser un array" })
  @IsString({ each: true, message: "Cada dominio debe ser un string" })
  allowedDomains?: string[];

  @ApiPropertyOptional({
    description: "Habilita auto registro para usuarios SSO",
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: "autoRegisterOnSSO debe ser un booleano" })
  autoRegisterOnSSO?: boolean;

  @ApiPropertyOptional({
    description: "Modo de tema por defecto",
    enum: ["system", "light", "dark"],
    example: "system",
  })
  @IsOptional()
  @IsIn(["system", "light", "dark"], {
    message: "themeMode debe ser system, light o dark",
  })
  themeMode?: string;

  @ApiPropertyOptional({
    description: "Color primario de la aplicacion",
    example: "#3B82F6",
  })
  @IsOptional()
  @IsString({ message: "primaryColor debe ser un string" })
  primaryColor?: string;

  @ApiPropertyOptional({
    description: "Color secundario de la aplicacion",
    example: "#14B8A6",
  })
  @IsOptional()
  @IsString({ message: "secondaryColor debe ser un string" })
  secondaryColor?: string;

  @ApiPropertyOptional({
    description: "Idioma por defecto de la aplicacion",
    example: "es",
  })
  @IsOptional()
  @IsString({ message: "defaultLocale debe ser un string" })
  defaultLocale?: string;

  @ApiPropertyOptional({
    description: "Idiomas soportados por la aplicacion",
    example: ["es", "en"],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: "supportedLocales debe ser un array" })
  @IsString({ each: true, message: "Cada locale debe ser un string" })
  supportedLocales?: string[];

  @ApiPropertyOptional({
    description: "Nombre comercial de la aplicacion",
    example: "Bookly UFPS",
  })
  @IsOptional()
  @IsString({ message: "appName debe ser un string" })
  appName?: string;

  @ApiPropertyOptional({
    description: "Logo para tema claro",
    example: "/images/bookly_imagotipo_light.png",
  })
  @IsOptional()
  @IsString({ message: "logoLightUrl debe ser un string" })
  logoLightUrl?: string;

  @ApiPropertyOptional({
    description: "Logo para tema oscuro",
    example: "/images/bookly_logotipo_dark-vertical.png",
  })
  @IsOptional()
  @IsString({ message: "logoDarkUrl debe ser un string" })
  logoDarkUrl?: string;

  @ApiPropertyOptional({
    description: "Favicon del tenant",
    example: "/images/favicon.png",
  })
  @IsOptional()
  @IsString({ message: "faviconUrl debe ser un string" })
  faviconUrl?: string;

  @ApiPropertyOptional({
    description: "Zona horaria por defecto",
    example: "America/Bogota",
  })
  @IsOptional()
  @IsString({ message: "timezone debe ser un string" })
  timezone?: string;

  @ApiPropertyOptional({
    description: "Feature flags globales de la aplicacion",
    type: AppConfigFeaturesDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => AppConfigFeaturesDto)
  features?: AppConfigFeaturesDto;

  @ApiPropertyOptional({
    description: "Indica si la aplicacion esta en modo mantenimiento",
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: "maintenanceMode debe ser un booleano" })
  maintenanceMode?: boolean;
}

export class StorageS3ConfigDto {
  @ApiPropertyOptional({ example: "bookly-assets" })
  @IsOptional()
  @IsString({ message: "bucket debe ser un string" })
  bucket?: string;

  @ApiPropertyOptional({ example: "us-east-1" })
  @IsOptional()
  @IsString({ message: "region debe ser un string" })
  region?: string;

  @ApiPropertyOptional({ example: "AKIA..." })
  @IsOptional()
  @IsString({ message: "accessKeyId debe ser un string" })
  accessKeyId?: string;

  @ApiPropertyOptional({ example: "********" })
  @IsOptional()
  @IsString({ message: "secretAccessKey debe ser un string" })
  secretAccessKey?: string;

  @ApiPropertyOptional({ example: "https://s3.amazonaws.com" })
  @IsOptional()
  @IsString({ message: "endpoint debe ser un string" })
  endpoint?: string;
}

export class StorageGcsConfigDto {
  @ApiPropertyOptional({ example: "bookly-assets" })
  @IsOptional()
  @IsString({ message: "bucket debe ser un string" })
  bucket?: string;

  @ApiPropertyOptional({ example: "bookly-ufps" })
  @IsOptional()
  @IsString({ message: "projectId debe ser un string" })
  projectId?: string;

  @ApiPropertyOptional({ example: "/secure/key.json" })
  @IsOptional()
  @IsString({ message: "keyFilePath debe ser un string" })
  keyFilePath?: string;

  @ApiPropertyOptional({ example: "service-account@bookly-ufps.iam.gserviceaccount.com" })
  @IsOptional()
  @IsString({ message: "clientEmail debe ser un string" })
  clientEmail?: string;

  @ApiPropertyOptional({ example: "-----BEGIN PRIVATE KEY-----..." })
  @IsOptional()
  @IsString({ message: "privateKey debe ser un string" })
  privateKey?: string;
}

export class UpdateStorageConfigDto {
  @ApiProperty({
    description: "Proveedor de almacenamiento",
    enum: ["local", "s3", "gcs"],
    example: "local",
  })
  @IsIn(["local", "s3", "gcs"], {
    message: "storageProvider debe ser local, s3 o gcs",
  })
  storageProvider: "local" | "s3" | "gcs";

  @ApiPropertyOptional({ type: StorageS3ConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => StorageS3ConfigDto)
  storageS3Config?: StorageS3ConfigDto;

  @ApiPropertyOptional({ type: StorageGcsConfigDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => StorageGcsConfigDto)
  storageGcsConfig?: StorageGcsConfigDto;
}
