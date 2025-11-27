import { RequirePermissions } from "@libs/common/decorators";
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
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CancelMaintenanceBlockCommand } from "../../application/commands/cancel-maintenance-block.command";
import { CompleteMaintenanceBlockCommand } from "../../application/commands/complete-maintenance-block.command";
import { CreateMaintenanceBlockCommand } from "../../application/commands/create-maintenance-block.command";
import { GetMaintenanceBlocksQuery } from "../../application/queries/get-maintenance-blocks.query";
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
  ): Promise<MaintenanceBlockResponseDto> {
    const command = new CreateMaintenanceBlockCommand(
      user.id || user.userId,
      dto
    );
    return await this.commandBus.execute(command);
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
  async findAll(
    @Query() filters: QueryMaintenanceBlocksDto
  ): Promise<MaintenanceBlockResponseDto[]> {
    const query = new GetMaintenanceBlocksQuery(filters);
    return await this.queryBus.execute(query);
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
  ): Promise<MaintenanceBlockResponseDto[]> {
    const query = new GetMaintenanceBlocksQuery({ resourceId });
    return await this.queryBus.execute(query);
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
  async findActive(): Promise<MaintenanceBlockResponseDto[]> {
    const query = new GetMaintenanceBlocksQuery({
      status: "IN_PROGRESS" as any,
    });
    return await this.queryBus.execute(query);
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
  ): Promise<MaintenanceBlockResponseDto> {
    const command = new CompleteMaintenanceBlockCommand(
      id,
      user.id || user.userId,
      dto
    );
    return await this.commandBus.execute(command);
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
  ): Promise<MaintenanceBlockResponseDto> {
    const command = new CancelMaintenanceBlockCommand(
      id,
      user.id || user.userId,
      dto
    );
    return await this.commandBus.execute(command);
  }
}
