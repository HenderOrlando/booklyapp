import { AuditAction, AuditStatus } from "@libs/common/enums";
import { ResponseUtil } from "@libs/common";
import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Response } from "express";
import {
  AuditLogsResponseDto,
  CleanupStatsDto,
} from '@auth/application/dtos/audit/audit-log-response.dto';
import { AuditService } from '@auth/application/services/audit.service';
import { RequireAction } from "../decorators/require-action.decorator";
import { RequirePermissions } from "../decorators/require-permissions.decorator";
import { ActionGuard } from "../guards/action.guard";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { PermissionsGuard } from "../guards/permissions.guard";
import { AuditInterceptor } from "../interceptors/audit.interceptor";

/**
 * Controller para consulta y gestión de auditoría
 * Solo accesible para administradores con permisos de auditoría
 */
@ApiTags("Audit")
@ApiBearerAuth()
@Controller("audit")
@UseGuards(JwtAuthGuard, PermissionsGuard, ActionGuard)
@UseInterceptors(AuditInterceptor)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * Obtener logs de auditoría de un usuario específico
   */
  @Get("user/:userId")
  @RequirePermissions("audit:read")
  @RequireAction(AuditAction.VIEW)
  @ApiOperation({
    summary: "Obtener logs de auditoría de un usuario",
    description:
      "Retorna el historial de acciones de un usuario específico con filtros opcionales",
  })
  @ApiQuery({
    name: "status",
    required: false,
    enum: AuditStatus,
    description: "Filtrar por estado (SUCCESS o FAILED)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Número máximo de registros (default: 100)",
  })
  @ApiResponse({
    status: 200,
    description: "Logs de auditoría obtenidos exitosamente",
    type: AuditLogsResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: "No tiene permisos para ver logs de auditoría",
  })
  async getUserAuditLogs(
    @Query("userId") userId: string,
    @Query("status") status?: AuditStatus,
    @Query("limit") limit = 100
  ) {
    const logs = await this.auditService.getUserAuditLogs(
      userId,
      status,
      Number(limit)
    );

    return ResponseUtil.success(
      logs,
      `${logs.length} registro(s) encontrado(s) para el usuario ${userId}`
    );
  }

  /**
   * Obtener logs de auditoría de un recurso específico
   */
  @Get("resource")
  @RequirePermissions("audit:read")
  @RequireAction(AuditAction.VIEW)
  @ApiOperation({
    summary: "Obtener logs de auditoría de un recurso",
    description:
      "Retorna el historial de acciones realizadas sobre un recurso específico",
  })
  @ApiQuery({
    name: "resource",
    required: true,
    type: String,
    description: "Ruta del recurso a consultar (ej: /roles/123)",
  })
  @ApiQuery({
    name: "action",
    required: false,
    enum: AuditAction,
    description: "Filtrar por tipo de acción",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Número máximo de registros (default: 100)",
  })
  @ApiResponse({
    status: 200,
    description: "Logs de auditoría obtenidos exitosamente",
    type: AuditLogsResponseDto,
  })
  async getResourceAuditLogs(
    @Query("resource") resource: string,
    @Query("action") action?: AuditAction,
    @Query("limit") limit = 100
  ) {
    const logs = await this.auditService.getResourceAuditLogs(
      resource,
      action,
      Number(limit)
    );

    return ResponseUtil.success(
      logs,
      `${logs.length} registro(s) encontrado(s) para el recurso ${resource}`
    );
  }

  /**
   * Obtener intentos fallidos recientes
   */
  @Get("failed-attempts")
  @RequirePermissions("audit:read")
  @RequireAction(AuditAction.VIEW)
  @ApiOperation({
    summary: "Obtener intentos fallidos recientes",
    description:
      "Retorna los intentos de acceso no autorizados o acciones fallidas recientes",
  })
  @ApiQuery({
    name: "hours",
    required: false,
    type: Number,
    description: "Filtrar por últimas N horas (default: 24)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Número máximo de registros (default: 100)",
  })
  @ApiResponse({
    status: 200,
    description: "Intentos fallidos obtenidos exitosamente",
    type: AuditLogsResponseDto,
  })
  async getFailedAttempts(
    @Query("hours") hours = 24,
    @Query("limit") limit = 100
  ) {
    const logs = await this.auditService.getFailedAttempts(
      Number(hours),
      Number(limit)
    );

    return ResponseUtil.success(
      logs,
      `${logs.length} intento(s) fallido(s) en las últimas ${hours} horas`
    );
  }

  /**
   * Exportar logs de auditoría en formato CSV
   */
  @Get("export/csv")
  @RequirePermissions("audit:export")
  @RequireAction(AuditAction.VIEW)
  @ApiOperation({
    summary: "Exportar logs de auditoría en CSV",
    description:
      "Genera y descarga un archivo CSV con los registros de auditoría filtrados",
  })
  @ApiQuery({
    name: "userId",
    required: false,
    type: String,
    description: "Filtrar por usuario",
  })
  @ApiQuery({
    name: "resource",
    required: false,
    type: String,
    description: "Filtrar por recurso",
  })
  @ApiQuery({
    name: "status",
    required: false,
    enum: AuditStatus,
    description: "Filtrar por estado",
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    type: String,
    description: "Fecha inicial (ISO 8601)",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    type: String,
    description: "Fecha final (ISO 8601)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Número máximo de registros (default: 10000)",
  })
  @ApiResponse({
    status: 200,
    description: "Archivo CSV generado exitosamente",
    content: {
      "text/csv": {
        schema: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  async exportAuditLogsCSV(
    @Res() res: Response,
    @Query("userId") userId?: string,
    @Query("resource") resource?: string,
    @Query("status") status?: AuditStatus,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("limit") limit = 10000
  ) {
    // Obtener logs con filtros
    let logs;

    if (userId) {
      logs = await this.auditService.getUserAuditLogs(
        userId,
        status,
        Number(limit)
      );
    } else if (resource) {
      logs = await this.auditService.getResourceAuditLogs(
        resource,
        undefined,
        Number(limit)
      );
    } else {
      logs = await this.auditService.getFailedAttempts(24 * 30, Number(limit));
    }

    // Filtrar por fechas si se proporcionan
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();

      logs = logs.filter((log) => {
        const logDate = new Date(log.timestamp);
        return logDate >= start && logDate <= end;
      });
    }

    // Generar CSV
    const csv = this.generateCSV(logs);

    // Configurar headers de respuesta
    const filename = `audit_logs_${new Date().toISOString().split("T")[0]}.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    // Enviar CSV
    res.send(csv);
  }

  /**
   * Limpiar logs antiguos (solo admin)
   */
  @Get("cleanup")
  @RequirePermissions("audit:admin")
  @RequireAction(AuditAction.DELETE)
  @ApiOperation({
    summary: "Limpiar logs de auditoría antiguos",
    description:
      "Elimina logs de auditoría más antiguos que el número de días especificado",
  })
  @ApiQuery({
    name: "days",
    required: false,
    type: Number,
    description: "Días de retención (default: 90)",
  })
  @ApiResponse({
    status: 200,
    description: "Logs antiguos eliminados exitosamente",
    type: CleanupStatsDto,
  })
  async cleanupOldLogs(@Query("days") days = 90) {
    const result = await this.auditService.cleanOldLogs(Number(days));

    return ResponseUtil.success(
      { deletedCount: result.deletedCount },
      `${result.deletedCount} registro(s) antiguo(s) eliminado(s)`
    );
  }

  /**
   * Método auxiliar para generar CSV
   */
  private generateCSV(logs: any[]): string {
    if (logs.length === 0) {
      return "No hay datos para exportar";
    }

    // Headers
    const headers = [
      "ID",
      "Usuario",
      "Acción",
      "Recurso",
      "Método",
      "URL",
      "Estado",
      "IP",
      "User Agent",
      "Tiempo de Ejecución (ms)",
      "Error",
      "Fecha y Hora",
    ];

    // Generar filas
    const rows = logs.map((log) => [
      log._id?.toString() || "",
      log.userId || "",
      log.action || "",
      log.resource || "",
      log.method || "",
      log.url || "",
      log.status || "",
      log.ip || "",
      log.userAgent || "",
      log.executionTime || "",
      log.error || "",
      log.timestamp ? new Date(log.timestamp).toISOString() : "",
    ]);

    // Combinar headers y rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    return csvContent;
  }
}
