import { MaintenanceStatus, MaintenanceType } from "@libs/common/enums";
import { ResponseUtil } from "@libs/common";
import { CurrentUser } from "@libs/decorators";
import { JwtAuthGuard } from "@libs/guards";
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
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import {
  CancelMaintenanceCommand,
  CompleteMaintenanceCommand,
  ScheduleMaintenanceCommand,
  StartMaintenanceCommand,
} from "../../application/commands";
import { GetMaintenancesQuery } from "../../application/queries";
import { ScheduleMaintenanceDto } from "../dto";

/**
 * Maintenances Controller
 * Controlador REST para gestión de mantenimientos
 */
@ApiTags("Maintenances")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("maintenances")
export class MaintenancesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  @ApiOperation({ summary: "Programar un nuevo mantenimiento" })
  async scheduleMaintenance(
    @Body() scheduleMaintenanceDto: ScheduleMaintenanceDto,
    @CurrentUser("sub") userId: string
  ) {
    const command = new ScheduleMaintenanceCommand(
      scheduleMaintenanceDto.resourceId,
      scheduleMaintenanceDto.type,
      scheduleMaintenanceDto.title,
      scheduleMaintenanceDto.description,
      new Date(scheduleMaintenanceDto.scheduledStartDate),
      new Date(scheduleMaintenanceDto.scheduledEndDate),
      scheduleMaintenanceDto.performedBy,
      scheduleMaintenanceDto.cost,
      scheduleMaintenanceDto.notes,
      scheduleMaintenanceDto.affectsAvailability ?? true,
      userId
    );

    const maintenance = await this.commandBus.execute(command);

    return ResponseUtil.success(
      maintenance,
      "Maintenance scheduled successfully"
    );
  }

  @Get()
  @ApiOperation({ summary: "Obtener lista de mantenimientos" })
  async getMaintenances(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("sortBy") sortBy?: string,
    @Query("sortOrder") sortOrder?: "asc" | "desc",
    @Query("resourceId") resourceId?: string,
    @Query("type") type?: MaintenanceType,
    @Query("status") status?: MaintenanceStatus
  ) {
    const query = new GetMaintenancesQuery(
      {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        sortBy: sortBy || "createdAt",
        sortOrder: sortOrder || "desc",
      },
      {
        resourceId,
        type,
        status,
      }
    );

    const result = await this.queryBus.execute(query);

    return ResponseUtil.success(result, "Maintenances retrieved successfully");
  }

  @Patch(":id/start")
  @ApiOperation({ summary: "Iniciar un mantenimiento programado" })
  async startMaintenance(
    @Param("id") id: string,
    @CurrentUser("sub") userId: string
  ) {
    const command = new StartMaintenanceCommand(id, userId);
    const maintenance = await this.commandBus.execute(command);

    return ResponseUtil.success(
      maintenance,
      "Maintenance started successfully"
    );
  }

  @Patch(":id/complete")
  @ApiOperation({ summary: "Completar un mantenimiento en progreso" })
  async completeMaintenance(
    @Param("id") id: string,
    @Body("cost") cost: number | undefined,
    @Body("notes") notes: string | undefined,
    @CurrentUser("sub") userId: string
  ) {
    const command = new CompleteMaintenanceCommand(id, userId, cost, notes);
    const maintenance = await this.commandBus.execute(command);

    return ResponseUtil.success(
      maintenance,
      "Maintenance completed successfully"
    );
  }

  @Patch(":id/cancel")
  @ApiOperation({ summary: "Cancelar un mantenimiento" })
  async cancelMaintenance(
    @Param("id") id: string,
    @Body("reason") reason: string | undefined,
    @CurrentUser("sub") userId: string
  ) {
    const command = new CancelMaintenanceCommand(id, userId, reason);
    const maintenance = await this.commandBus.execute(command);

    return ResponseUtil.success(
      maintenance,
      "Maintenance cancelled successfully"
    );
  }
}
