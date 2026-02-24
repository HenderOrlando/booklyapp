import { AuditAction, AuditStatus } from "@libs/common/enums";
import { ApiProperty } from "@nestjs/swagger";

/**
 * DTO de respuesta para logs de auditoría
 */
export class AuditLogResponseDto {
  @ApiProperty({
    description: "ID del log de auditoría",
    example: "507f1f77bcf86cd799439011",
  })
  id: string;

  @ApiProperty({
    description: "ID del usuario que realizó la acción",
    example: "507f191e810c19729de860ea",
  })
  userId: string;

  @ApiProperty({
    description: "Acción realizada",
    enum: AuditAction,
    example: AuditAction.CREATE,
  })
  action: AuditAction;

  @ApiProperty({
    description: "Recurso afectado",
    example: "/roles/507f1f77bcf86cd799439011",
  })
  resource: string;

  @ApiProperty({
    description: "Método HTTP utilizado",
    example: "POST",
  })
  method: string;

  @ApiProperty({
    description: "URL completa del endpoint",
    example: "/roles",
  })
  url: string;

  @ApiProperty({
    description: "Dirección IP del cliente",
    example: "192.168.1.100",
  })
  ip: string;

  @ApiProperty({
    description: "User agent del navegador",
    example: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    required: false,
  })
  userAgent?: string;

  @ApiProperty({
    description: "Estado de la operación",
    enum: AuditStatus,
    example: AuditStatus.SUCCESS,
  })
  status: AuditStatus;

  @ApiProperty({
    description: "Tiempo de ejecución en milisegundos",
    example: 45,
    required: false,
  })
  executionTime?: number;

  @ApiProperty({
    description: "Cambios realizados (body de la request)",
    example: { name: "Admin Role", permissions: ["role:read", "role:create"] },
    required: false,
  })
  changes?: Record<string, any>;

  @ApiProperty({
    description: "Mensaje de error si la operación falló",
    example: "Insufficient permissions",
    required: false,
  })
  error?: string;

  @ApiProperty({
    description: "Fecha y hora de la acción",
    example: "2025-11-04T21:30:00.000Z",
  })
  timestamp: Date;
}

/**
 * DTO de respuesta con múltiples logs
 */
export class AuditLogsResponseDto {
  @ApiProperty({
    description: "Indica si la operación fue exitosa",
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: "Lista de logs de auditoría",
    type: [AuditLogResponseDto],
  })
  data: AuditLogResponseDto[];

  @ApiProperty({
    description: "Mensaje descriptivo",
    example: "10 registro(s) encontrado(s)",
  })
  message: string;
}

/**
 * DTO para estadísticas de limpieza
 */
export class CleanupStatsDto {
  @ApiProperty({
    description: "Número de registros eliminados",
    example: 1523,
  })
  deletedCount: number;

  @ApiProperty({
    description: "Indica si la operación fue confirmada",
    example: true,
  })
  acknowledged: boolean;
}
