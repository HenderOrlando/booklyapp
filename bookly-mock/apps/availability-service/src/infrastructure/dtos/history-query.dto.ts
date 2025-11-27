import { ApiPropertyOptional } from "@nestjs/swagger";
import { AuditAction } from "@reports/audit-decorators";
import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

/**
 * DTO para consultar historial de reservas
 */
export class HistoryQueryDto {
  @ApiPropertyOptional({
    description: "ID de la reserva",
    example: "507f1f77bcf86cd799439011",
  })
  @IsOptional()
  @IsString()
  reservationId?: string;

  @ApiPropertyOptional({
    description: "ID del usuario",
    example: "507f1f77bcf86cd799439012",
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: "Acción realizada",
    enum: AuditAction,
    example: AuditAction.CREATED,
  })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiPropertyOptional({
    description: "Fecha de inicio del rango",
    example: "2025-01-01T00:00:00Z",
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: "Fecha de fin del rango",
    example: "2025-12-31T23:59:59Z",
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: "Número de página",
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Cantidad de registros por página",
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

/**
 * DTO para exportar historial
 */
export class ExportHistoryDto {
  @ApiPropertyOptional({
    description: "ID de la reserva",
    example: "507f1f77bcf86cd799439011",
  })
  @IsOptional()
  @IsString()
  reservationId?: string;

  @ApiPropertyOptional({
    description: "ID del usuario",
    example: "507f1f77bcf86cd799439012",
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: "Acción realizada",
    enum: AuditAction,
  })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiPropertyOptional({
    description: "Fecha de inicio del rango",
    example: "2025-01-01T00:00:00Z",
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: "Fecha de fin del rango",
    example: "2025-12-31T23:59:59Z",
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: "Formato de exportación",
    enum: ["csv", "json"],
    default: "csv",
  })
  @IsOptional()
  @IsString()
  format?: "csv" | "json" = "csv";
}
