import {
  NotificationChannel,
  NotificationPriority,
} from "@libs/common/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";

/**
 * Send Notification DTO
 */
export class SendNotificationDto {
  @ApiProperty({
    enum: NotificationChannel,
    description: "Canal de notificación",
  })
  @IsEnum(NotificationChannel)
  @IsNotEmpty()
  channel: NotificationChannel;

  @ApiProperty({ description: "Destinatario(s)", type: [String] })
  @IsNotEmpty()
  to: string | string[];

  @ApiPropertyOptional({ description: "Asunto (para email)" })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ description: "Mensaje de la notificación" })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ description: "Datos adicionales" })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiPropertyOptional({ description: "Remitente personalizado" })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ description: "Template a utilizar" })
  @IsOptional()
  @IsString()
  template?: string;

  @ApiPropertyOptional({ description: "ID del tenant" })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiPropertyOptional({
    description: "Prioridad",
    enum: NotificationPriority,
  })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiPropertyOptional({ description: "Metadata adicional" })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

/**
 * Batch Send Notification DTO
 */
export class BatchSendNotificationDto {
  @ApiProperty({
    type: [SendNotificationDto],
    description: "Lista de notificaciones",
  })
  @IsArray()
  @IsNotEmpty()
  notifications: SendNotificationDto[];
}

/**
 * Notification Response DTO
 */
export class NotificationResponseDto {
  @ApiProperty({ description: "Éxito del envío" })
  success: boolean;

  @ApiProperty({ description: "ID del mensaje" })
  messageId?: string;

  @ApiProperty({ description: "Proveedor utilizado" })
  provider: string;

  @ApiProperty({ description: "Error si hubo" })
  error?: string;

  @ApiProperty({ description: "Timestamp" })
  timestamp: Date;

  @ApiProperty({ description: "Latencia en ms" })
  latency?: number;
}
