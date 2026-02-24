import { MaintenanceStatus } from "@libs/common/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

/**
 * DTO para crear bloqueo por mantenimiento
 */
export class CreateMaintenanceBlockDto {
  @ApiProperty({
    description: "ID del recurso",
    example: "507f1f77bcf86cd799439011",
  })
  @IsMongoId()
  resourceId: string;

  @ApiProperty({
    description: "Título del mantenimiento",
    example: "Mantenimiento preventivo anual",
  })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description: "Descripción detallada del mantenimiento",
    example:
      "Revisión completa de equipos, limpieza y actualización de componentes",
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: "Fecha y hora de inicio del mantenimiento",
    example: "2025-12-20T08:00:00Z",
  })
  @IsDate()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({
    description: "Fecha y hora de fin del mantenimiento",
    example: "2025-12-20T18:00:00Z",
  })
  @IsDate()
  @Type(() => Date)
  endDate: Date;

  @ApiProperty({
    description: "¿Notificar a usuarios con reservas afectadas?",
    example: true,
    default: false,
  })
  @IsBoolean()
  notifyUsers: boolean;

  @ApiPropertyOptional({
    description: "Notas adicionales sobre el mantenimiento",
    example: "Contactar al técnico en ext. 1234",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

/**
 * DTO para consultar bloqueos de mantenimiento
 */
export class QueryMaintenanceBlocksDto {
  @ApiPropertyOptional({
    description: "Filtrar por ID de recurso",
    example: "507f1f77bcf86cd799439011",
  })
  @IsOptional()
  @IsMongoId()
  resourceId?: string;

  @ApiPropertyOptional({
    description: "Filtrar por estado",
    enum: MaintenanceStatus,
  })
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @ApiPropertyOptional({
    description: "Fecha desde",
    example: "2025-11-01T00:00:00Z",
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({
    description: "Fecha hasta",
    example: "2025-12-31T23:59:59Z",
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
}

/**
 * DTO para actualizar bloqueo de mantenimiento
 */
export class UpdateMaintenanceBlockDto {
  @ApiPropertyOptional({
    description: "Actualizar título",
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: "Actualizar descripción",
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: "Nueva fecha de inicio",
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({
    description: "Nueva fecha de fin",
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @ApiPropertyOptional({
    description: "Actualizar estado",
    enum: MaintenanceStatus,
  })
  @IsOptional()
  @IsEnum(MaintenanceStatus)
  status?: MaintenanceStatus;

  @ApiPropertyOptional({
    description: "Actualizar notificación",
  })
  @IsOptional()
  @IsBoolean()
  notifyUsers?: boolean;

  @ApiPropertyOptional({
    description: "Actualizar notas",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

/**
 * DTO de respuesta para bloqueo de mantenimiento
 */
export class MaintenanceBlockResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  resourceId: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty({ enum: MaintenanceStatus })
  status: MaintenanceStatus;

  @ApiProperty()
  notifyUsers: boolean;

  @ApiProperty({ type: [String] })
  affectedReservations: string[];

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  audit: {
    createdBy: string;
    updatedBy?: string;
    completedBy?: string;
    cancelledBy?: string;
  };

  @ApiPropertyOptional()
  completedAt?: Date;

  @ApiPropertyOptional()
  cancelledAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

/**
 * DTO para completar mantenimiento
 */
export class CompleteMaintenanceDto {
  @ApiPropertyOptional({
    description: "Notas de completitud",
    example:
      "Mantenimiento completado exitosamente. Todos los equipos operativos.",
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

/**
 * DTO para cancelar mantenimiento
 */
export class CancelMaintenanceDto {
  @ApiProperty({
    description: "Razón de cancelación",
    example: "Pospuesto por falta de repuestos",
  })
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason: string;
}
