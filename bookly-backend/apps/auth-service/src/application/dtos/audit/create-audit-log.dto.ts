import { AuditAction, AuditStatus } from "@libs/common/enums";
import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsIP,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";

/**
 * DTO para crear un registro de auditoría
 */
export class CreateAuditLogDto {
  @ApiProperty({
    description: "ID del usuario que realizó la acción",
    example: "507f1f77bcf86cd799439011",
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: "Acción realizada",
    enum: AuditAction,
    example: AuditAction.UPDATE,
  })
  @IsEnum(AuditAction)
  @IsNotEmpty()
  action: string;

  @ApiProperty({
    description: "Recurso afectado",
    example: "roles",
  })
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ApiProperty({
    description: "Método HTTP",
    example: "PUT",
  })
  @IsString()
  @IsNotEmpty()
  method: string;

  @ApiProperty({
    description: "URL completa de la petición",
    example: "/api/roles/507f1f77bcf86cd799439011",
  })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({
    description: "Dirección IP del cliente",
    example: "192.168.1.100",
  })
  @IsIP()
  @IsNotEmpty()
  ip: string;

  @ApiProperty({
    description: "User Agent del cliente",
    example: "Mozilla/5.0...",
    required: false,
  })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiProperty({
    description: "Estado de la operación",
    enum: AuditStatus,
    example: AuditStatus.SUCCESS,
  })
  @IsEnum(AuditStatus)
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    description: "Tiempo de ejecución en milisegundos",
    example: 150,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  executionTime?: number;

  @ApiProperty({
    description: "Cambios realizados (antes/después)",
    example: { before: { name: "Old" }, after: { name: "New" } },
    required: false,
  })
  @IsObject()
  @IsOptional()
  changes?: Record<string, any>;

  @ApiProperty({
    description: "Mensaje de error si falló",
    example: "Permission denied",
    required: false,
  })
  @IsString()
  @IsOptional()
  error?: string;
}
