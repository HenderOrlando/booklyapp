import { RequirePermissions } from "@libs/common/decorators";
import { ResponseUtil } from "@libs/common";
import { CurrentUser } from "@libs/decorators";
import { JwtAuthGuard } from "@libs/guards";
import { PermissionsGuard } from "@libs/guards/permissions.guard";
import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { IAuditQueryResult } from "@reports/audit-decorators";
import { Response } from "express";
import { GetReservationHistoryQuery } from "../../application/queries/get-reservation-history.query";
import { GetUserActivityQuery } from "../../application/queries/get-user-activity.query";
import { ExportHistoryDto, HistoryQueryDto } from "../dtos/history-query.dto";
import { ReservationHistoryRepository } from "../repositories/reservation-history.repository";

/**
 * History Controller
 * Controlador REST para consultas de historial y auditoría
 */
@ApiTags("History")
@ApiBearerAuth()
@Controller("history")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class HistoryController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly historyRepository: ReservationHistoryRepository
  ) {}

  @Get("reservation/:id")
  @RequirePermissions("history:read")
  @ApiOperation({ summary: "Obtener historial de una reserva específica" })
  @ApiParam({
    name: "id",
    description: "ID de la reserva",
    example: "507f1f77bcf86cd799439011",
  })
  @ApiResponse({
    status: 200,
    description: "Historial de reserva obtenido exitosamente",
    schema: {
      example: {
        records: [
          {
            entityId: "507f1f77bcf86cd799439011",
            entityType: "RESERVATION",
            action: "CREATED",
            afterData: {
              resourceId: "507f1f77bcf86cd799439013",
              userId: "507f1f77bcf86cd799439014",
              startDate: "2025-11-10T09:00:00Z",
              endDate: "2025-11-10T11:00:00Z",
              status: "PENDING",
            },
            userId: "507f1f77bcf86cd799439014",
            ip: "192.168.1.100",
            userAgent: "Mozilla/5.0...",
            timestamp: "2025-11-08T10:30:00Z",
          },
        ],
        total: 5,
        page: 1,
        totalPages: 1,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Sin permisos para acceder al historial",
  })
  async getReservationHistory(
    @Param("id") reservationId: string,
    @Query() queryDto: HistoryQueryDto
  ): Promise<any> {
    const query = new GetReservationHistoryQuery(reservationId, {
      action: queryDto.action,
      startDate: queryDto.startDate ? new Date(queryDto.startDate) : undefined,
      endDate: queryDto.endDate ? new Date(queryDto.endDate) : undefined,
      page: queryDto.page,
      limit: queryDto.limit,
    });

    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Reservation history retrieved successfully');
  }

  @Get("user/:userId")
  @RequirePermissions("history:read")
  @ApiOperation({ summary: "Obtener actividad de un usuario" })
  @ApiParam({
    name: "userId",
    description: "ID del usuario",
    example: "507f1f77bcf86cd799439014",
  })
  @ApiResponse({
    status: 200,
    description: "Actividad de usuario obtenida exitosamente",
  })
  @ApiResponse({
    status: 403,
    description: "Sin permisos para acceder a la actividad del usuario",
  })
  async getUserActivity(
    @Param("userId") userId: string,
    @Query() queryDto: HistoryQueryDto,
    @CurrentUser() currentUser: any
  ): Promise<any> {
    // Solo admins pueden ver actividad de otros usuarios
    // Los usuarios normales solo ven su propia actividad
    const targetUserId =
      currentUser.roles?.includes("admin") || currentUser.id === userId
        ? userId
        : currentUser.id;

    const query = new GetUserActivityQuery(targetUserId, {
      action: queryDto.action,
      startDate: queryDto.startDate ? new Date(queryDto.startDate) : undefined,
      endDate: queryDto.endDate ? new Date(queryDto.endDate) : undefined,
      page: queryDto.page,
      limit: queryDto.limit,
    });

    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'User activity retrieved successfully');
  }

  @Get("search")
  @RequirePermissions("history:read")
  @ApiOperation({ summary: "Buscar en historial con múltiples filtros" })
  @ApiResponse({
    status: 200,
    description: "Resultados de búsqueda obtenidos exitosamente",
  })
  async searchHistory(
    @Query() queryDto: HistoryQueryDto
  ): Promise<any> {
    const result = await this.historyRepository.findWithFilters({
      entityId: queryDto.reservationId,
      userId: queryDto.userId,
      action: queryDto.action,
      startDate: queryDto.startDate ? new Date(queryDto.startDate) : undefined,
      endDate: queryDto.endDate ? new Date(queryDto.endDate) : undefined,
      page: queryDto.page,
      limit: queryDto.limit,
    });
    return ResponseUtil.success(result, 'History search completed successfully');
  }

  @Post("export")
  @RequirePermissions("history:export")
  @ApiOperation({
    summary: "Exportar historial en formato CSV o JSON",
    description:
      "Genera un archivo descargable con el historial filtrado. Límite de 10,000 registros.",
  })
  @ApiResponse({
    status: 200,
    description: "Archivo CSV generado exitosamente",
    content: {
      "text/csv": {
        schema: {
          type: "string",
          example:
            'Timestamp,Reservation ID,Action,User ID,IP,User Agent,Changes\n"2025-11-08T10:30:00Z","507f1f77bcf86cd799439011","CREATED","507f1f77bcf86cd799439014","192.168.1.100","Mozilla/5.0...","Created"',
        },
      },
      "application/json": {
        schema: {
          type: "array",
          items: {
            type: "object",
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: "Sin permisos para exportar historial",
  })
  async exportHistory(
    @Query() exportDto: ExportHistoryDto,
    @Res() res: Response
  ): Promise<void> {
    const options = {
      entityId: exportDto.reservationId,
      userId: exportDto.userId,
      action: exportDto.action,
      startDate: exportDto.startDate
        ? new Date(exportDto.startDate)
        : undefined,
      endDate: exportDto.endDate ? new Date(exportDto.endDate) : undefined,
    };

    if (exportDto.format === "csv") {
      const csv = await this.historyRepository.exportToCsv(options);
      const filename = `history_export_${Date.now()}.csv`;

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.send(csv);
    } else {
      // JSON export
      const result = await this.historyRepository.findWithFilters({
        ...options,
        limit: 10000, // Límite de seguridad
      });

      const filename = `history_export_${Date.now()}.json`;
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.json(result.records);
    }
  }

  @Get("my-activity")
  @ApiOperation({
    summary: "Obtener mi propia actividad (usuario actual)",
    description: "Endpoint público para que usuarios consulten su historial",
  })
  @ApiResponse({
    status: 200,
    description: "Actividad personal obtenida exitosamente",
  })
  async getMyActivity(
    @CurrentUser() user: any,
    @Query() queryDto: HistoryQueryDto
  ): Promise<any> {
    const query = new GetUserActivityQuery(user.id || user.userId, {
      action: queryDto.action,
      startDate: queryDto.startDate ? new Date(queryDto.startDate) : undefined,
      endDate: queryDto.endDate ? new Date(queryDto.endDate) : undefined,
      page: queryDto.page,
      limit: queryDto.limit,
    });

    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Personal activity retrieved successfully');
  }
}
