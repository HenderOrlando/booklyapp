import { NotificationChannel } from "@libs/common/enums";
import { WebhookEventType } from "@libs/notifications";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
} from "class-validator";

/**
 * DTO para registrar un webhook
 */
export class RegisterWebhookDto {
  @ApiProperty({
    description: "Canal de notificación",
    enum: NotificationChannel,
    example: NotificationChannel.EMAIL,
  })
  @IsEnum(NotificationChannel)
  @IsNotEmpty()
  channel: NotificationChannel;

  @ApiProperty({
    description: "Proveedor de notificación",
    example: "sendgrid",
  })
  @IsString()
  @IsNotEmpty()
  provider: string;

  @ApiProperty({
    description: "URL del webhook",
    example: "https://api.bookly.com/webhooks/email/sendgrid",
  })
  @IsUrl()
  @IsNotEmpty()
  url: string;

  @ApiPropertyOptional({
    description: "Secret para verificación de firma",
  })
  @IsString()
  @IsOptional()
  secret?: string;

  @ApiPropertyOptional({
    description: "Configuración adicional",
  })
  @IsObject()
  @IsOptional()
  config?: Record<string, any>;

  @ApiPropertyOptional({
    description: "Activo/Inactivo",
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

/**
 * DTO para actualizar un webhook
 */
export class UpdateWebhookDto {
  @ApiPropertyOptional({
    description: "URL del webhook",
  })
  @IsUrl()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({
    description: "Secret para verificación de firma",
  })
  @IsString()
  @IsOptional()
  secret?: string;

  @ApiPropertyOptional({
    description: "Configuración adicional",
  })
  @IsObject()
  @IsOptional()
  config?: Record<string, any>;

  @ApiPropertyOptional({
    description: "Activo/Inactivo",
  })
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

/**
 * DTO de respuesta de webhook
 */
export class WebhookResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: NotificationChannel })
  channel: NotificationChannel;

  @ApiProperty()
  provider: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  active: boolean;

  @ApiProperty()
  hasSecret: boolean;

  @ApiPropertyOptional()
  config?: Record<string, any>;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  lastEventAt?: Date;

  @ApiPropertyOptional()
  totalEvents?: number;

  @ApiPropertyOptional()
  successRate?: number;
}

/**
 * DTO para logs de webhooks
 */
export class WebhookLogDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  webhookId: string;

  @ApiProperty({ enum: NotificationChannel })
  channel: NotificationChannel;

  @ApiProperty()
  provider: string;

  @ApiProperty({ enum: WebhookEventType })
  eventType: WebhookEventType;

  @ApiProperty()
  messageId: string;

  @ApiProperty()
  success: boolean;

  @ApiPropertyOptional()
  error?: string;

  @ApiProperty()
  requestBody: any;

  @ApiProperty()
  responseStatus: number;

  @ApiProperty()
  processingTime: number;

  @ApiProperty()
  timestamp: Date;
}

/**
 * DTO para estadísticas de webhooks
 */
export class WebhookStatsDto {
  @ApiProperty()
  webhookId: string;

  @ApiProperty()
  channel: NotificationChannel;

  @ApiProperty()
  provider: string;

  @ApiProperty()
  totalEvents: number;

  @ApiProperty()
  successfulEvents: number;

  @ApiProperty()
  failedEvents: number;

  @ApiProperty()
  successRate: number;

  @ApiProperty()
  averageProcessingTime: number;

  @ApiProperty()
  lastEventAt?: Date;

  @ApiProperty()
  eventsByType: Record<string, number>;
}

/**
 * DTO para probar un webhook
 */
export class TestWebhookDto {
  @ApiProperty({
    description: "Tipo de evento a simular",
    enum: WebhookEventType,
  })
  @IsEnum(WebhookEventType)
  @IsNotEmpty()
  eventType: WebhookEventType;

  @ApiPropertyOptional({
    description: "Datos de prueba personalizados",
  })
  @IsObject()
  @IsOptional()
  testData?: Record<string, any>;
}
