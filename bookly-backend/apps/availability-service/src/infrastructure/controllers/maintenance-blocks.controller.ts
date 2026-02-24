import { RequirePermissions } from "@libs/common/decorators";
import { ResponseUtil } from "@libs/common";
import { CurrentUser } from "@libs/decorators";
import { JwtAuthGuard } from "@libs/guards";
import { PermissionsGuard } from "@libs/guards/permissions.guard";
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CancelMaintenanceBlockCommand } from "@availability/application/commands/cancel-maintenance-block.command";
import { CompleteMaintenanceBlockCommand } from "@availability/application/commands/complete-maintenance-block.command";
import { CreateMaintenanceBlockCommand } from "@availability/application/commands/create-maintenance-block.command";
import { GetMaintenanceBlocksQuery } from "@availability/application/queries/get-maintenance-blocks.query";
import {
  CancelMaintenanceDto,
  CompleteMaintenanceDto,
  CreateMaintenanceBlockDto,
  MaintenanceBlockResponseDto,
  QueryMaintenanceBlocksDto,
} from "../dtos/maintenance-block.dto";

/**
 * Maintenance Blocks Controller
 * Gestión de bloqueos por mantenimiento de recursos
 */
@ApiTags("Maintenance Blocks")
@ApiBearerAuth()
@Controller("availability/maintenance")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MaintenanceBlocksController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  @RequirePermissions("availability:manage")
  @ApiOperation({
    summary: "Crear bloqueo por mantenimiento",
    description:
      "Programa un período de mantenimiento para un recurso. Puede notificar automáticamente a usuarios con reservas afectadas.",
  })
  @ApiResponse({
    status: 201,
    description: "Bloqueo de mantenimiento creado exitosamente",
    type: MaintenanceBlockResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Datos inválidos o conflicto con otro mantenimiento",
  })
  @ApiResponse({
    status: 401,
    description: "No autenticado",
  })
  @ApiResponse({
    status: 403,
    description: "Sin permisos para gestionar disponibilidad",
  })
  async create(
    @Body() dto: CreateMaintenanceBlockDto,
    @CurrentUser() user: any
  ): Promise<any> {
    const command = new CreateMaintenanceBlockCommand(
      user.id || user.userId,
      dto
    );
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Maintenance block created successfully');
  }

  @Get()
  @RequirePermissions("availability:read")
  @ApiOperation({
    summary: "Listar bloqueos de mantenimiento",
    description:
      "Obtiene lista de mantenimientos filtrados por recurso, estado, fechas, etc.",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de mantenimientos obtenida exitosamente",
    type: [MaintenanceBlockResponseDto],
    schema: {
      example: [
        {
          id: "507f1f77bcf86cd799439011",
          resourceId: "507f1f77bcf86cd799439012",
          title: "Mantenimiento preventivo anual",
          description: "Revisión completa de equipos",
          startDate: "2025-12-20T08:00:00Z",
          endDate: "2025-12-20T18:00:00Z",
          status: "SCHEDULED",
          notifyUsers: true,
          affectedReservations: [],
          audit: {
            createdBy: "507f1f77bcf86cd799439013",
          },
          createdAt: "2025-11-08T10:00:00Z",
          updatedAt: "2025-11-08T10:00:00Z",
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: "No autenticado",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Número de página (default: 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items por página (default: 20)",
  })
  async findAll(
    @Query() filters: QueryMaintenanceBlocksDto,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ): Promise<any> {
    const query = new GetMaintenanceBlocksQuery(filters);
    const result = await this.queryBus.execute(query);
    
    // Aplicar paginación en memoria
    const items = Array.isArray(result) ? result : [];
    const currentPage = page || 1;
    const pageSize = limit || 20;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = items.slice(startIndex, endIndex);
    
    return ResponseUtil.paginated(
      paginatedItems,
      items.length,
      currentPage,
      pageSize,
      'Maintenance blocks retrieved successfully'
    );
  }

  @Get("resource/:resourceId")
  @RequirePermissions("availability:read")
  @ApiOperation({
    summary: "Listar mantenimientos de un recurso",
    description: "Obtiene todos los mantenimientos de un recurso específico",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de mantenimientos del recurso",
    type: [MaintenanceBlockResponseDto],
  })
  async findByResource(
    @Param("resourceId") resourceId: string
  ): Promise<any> {
    const query = new GetMaintenanceBlocksQuery({ resourceId });
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Resource maintenance blocks retrieved successfully');
  }

  @Get("active")
  @RequirePermissions("availability:read")
  @ApiOperation({
    summary: "Listar mantenimientos activos",
    description: "Obtiene mantenimientos actualmente en progreso",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de mantenimientos activos",
    type: [MaintenanceBlockResponseDto],
  })
  async findActive(): Promise<any> {
    const query = new GetMaintenanceBlocksQuery({
      status: "IN_PROGRESS" as any,
    });
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Active maintenance blocks retrieved successfully');
  }

  @Patch(":id/complete")
  @RequirePermissions("availability:manage")
  @ApiOperation({
    summary: "Completar mantenimiento",
    description: "Marca un mantenimiento como completado",
  })
  @ApiResponse({
    status: 200,
    description: "Mantenimiento completado exitosamente",
    type: MaintenanceBlockResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Estado inválido para completar",
  })
  @ApiResponse({
    status: 404,
    description: "Mantenimiento no encontrado",
  })
  async complete(
    @Param("id") id: string,
    @Body() dto: CompleteMaintenanceDto,
    @CurrentUser() user: any
  ): Promise<any> {
    const command = new CompleteMaintenanceBlockCommand(
      id,
      user.id || user.userId,
      dto
    );
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Maintenance block completed successfully');
  }

  @Patch(":id/cancel")
  @RequirePermissions("availability:manage")
  @ApiOperation({
    summary: "Cancelar mantenimiento",
    description: "Cancela un mantenimiento programado o en progreso",
  })
  @ApiResponse({
    status: 200,
    description: "Mantenimiento cancelado exitosamente",
    type: MaintenanceBlockResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Estado inválido para cancelar o mantenimiento ya completado",
  })
  @ApiResponse({
    status: 404,
    description: "Mantenimiento no encontrado",
  })
  async cancel(
    @Param("id") id: string,
    @Body() dto: CancelMaintenanceDto,
    @CurrentUser() user: any
  ): Promise<any> {
    const command = new CancelMaintenanceBlockCommand(
      id,
      user.id || user.userId,
      dto
    );
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Maintenance block cancelled successfully');
  }
}
