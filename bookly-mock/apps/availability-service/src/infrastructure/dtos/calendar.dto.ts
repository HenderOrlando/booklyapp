import { OAuthProvider } from "@auth/modules/oauth";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
} from "class-validator";

/**
 * DTO para iniciar conexión con calendario
 */
export class ConnectCalendarDto {
  @ApiProperty({
    description: "Proveedor de calendario",
    enum: OAuthProvider,
    example: OAuthProvider.GOOGLE,
  })
  @IsEnum(OAuthProvider)
  provider: OAuthProvider;

  @ApiProperty({
    description: "URL de redirección después de autorizar",
    example: "http://localhost:3000/calendar/callback",
  })
  @IsUrl()
  redirectUri: string;
}

/**
 * DTO para callback de OAuth
 */
export class CalendarOAuthCallbackDto {
  @ApiProperty({ description: "Código de autorización" })
  @IsString()
  code: string;

  @ApiProperty({ description: "State para validación CSRF" })
  @IsString()
  state: string;

  @ApiPropertyOptional({ description: "Proveedor de calendario" })
  @IsEnum(OAuthProvider)
  @IsOptional()
  provider?: OAuthProvider;
}

/**
 * DTO para configurar sincronización
 */
export class UpdateSyncSettingsDto {
  @ApiPropertyOptional({ description: "Habilitar sincronización" })
  @IsBoolean()
  @IsOptional()
  syncEnabled?: boolean;

  @ApiPropertyOptional({
    description: "Importar eventos externos a Bookly",
  })
  @IsBoolean()
  @IsOptional()
  syncFromExternal?: boolean;

  @ApiPropertyOptional({
    description: "Exportar reservas de Bookly al calendario",
  })
  @IsBoolean()
  @IsOptional()
  syncToExternal?: boolean;
}

/**
 * DTO de respuesta de conexión
 */
export class CalendarConnectionResponseDto {
  @ApiProperty({ description: "ID de la conexión" })
  id: string;

  @ApiProperty({ description: "ID del usuario" })
  userId: string;

  @ApiProperty({ description: "Proveedor" })
  provider: OAuthProvider;

  @ApiProperty({ description: "Email externo" })
  externalEmail: string;

  @ApiProperty({ description: "Estado de sincronización" })
  syncEnabled: boolean;

  @ApiProperty({ description: "Sincronizar desde externo" })
  syncFromExternal: boolean;

  @ApiProperty({ description: "Sincronizar a externo" })
  syncToExternal: boolean;

  @ApiPropertyOptional({ description: "Última sincronización" })
  lastSyncAt?: Date;

  @ApiPropertyOptional({ description: "Estado de última sincronización" })
  lastSyncStatus?: string;

  @ApiProperty({ description: "Está activa" })
  isActive: boolean;

  @ApiProperty({ description: "Fecha de conexión" })
  connectedAt: Date;
}

/**
 * DTO para URL de autorización OAuth
 */
export class OAuthAuthorizationUrlDto {
  @ApiProperty({ description: "URL para autorizar" })
  authorizationUrl: string;

  @ApiProperty({ description: "State para validación" })
  state: string;
}

/**
 * DTO para exportar evento
 */
export class ExportEventDto {
  @ApiProperty({ description: "ID de la reserva" })
  @IsString()
  reservationId: string;

  @ApiPropertyOptional({ description: "ID del calendario (opcional)" })
  @IsString()
  @IsOptional()
  calendarId?: string;
}

/**
 * DTO para importar eventos
 */
export class ImportEventsDto {
  @ApiProperty({ description: "Fecha desde" })
  startDate: Date;

  @ApiProperty({ description: "Fecha hasta" })
  endDate: Date;

  @ApiPropertyOptional({ description: "ID del calendario (opcional)" })
  @IsString()
  @IsOptional()
  calendarId?: string;
}
