import { UserRole } from "@libs/common/enums";
import { CurrentUser } from "@libs/decorators";
import { Roles } from "@libs/decorators";
import { JwtAuthGuard } from "@libs/guards";
import { RolesGuard } from "@libs/guards";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Audit, AuditAction } from "@reports/audit-decorators";
import {
  ApproveStepCommand,
  CancelApprovalRequestCommand,
  CreateApprovalRequestCommand,
  RejectStepCommand,
} from "../../application/commands";
import {
  GetActiveTodayApprovalsQuery,
  GetApprovalRequestByIdQuery,
  GetApprovalRequestsQuery,
  GetApprovalStatisticsQuery,
} from "../../application/queries";
import {
  ApproveStepDto,
  CancelApprovalRequestDto,
  CreateApprovalRequestDto,
  GetActiveTodayApprovalsDto,
  PaginatedActiveApprovalsResponseDto,
  QueryApprovalRequestsDto,
  RejectStepDto,
} from "../dtos";
import { CacheActiveApprovalsInterceptor } from "../interceptors/cache-active-approvals.interceptor";

/**
 * Approval Requests Controller
 * Controlador REST para gestión de solicitudes de aprobación
 */
@ApiTags("Approval Requests")
@ApiBearerAuth()
@Controller("approval-requests")
@UseGuards(JwtAuthGuard)
export class ApprovalRequestsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  @Audit({
    entityType: "RESERVATION",
    action: AuditAction.CREATED,
  })
  @ApiOperation({ summary: "Crear una nueva solicitud de aprobación" })
  @ApiResponse({
    status: 201,
    description: "Solicitud creada exitosamente",
  })
  @ApiResponse({
    status: 400,
    description: "Datos inválidos o solicitud duplicada",
  })
  async create(
    @Body() dto: CreateApprovalRequestDto,
    @CurrentUser() user: any
  ): Promise<any> {
    const command = new CreateApprovalRequestCommand(
      dto.reservationId,
      dto.requesterId,
      dto.approvalFlowId,
      dto.metadata,
      user.sub
    );

    return await this.commandBus.execute(command);
  }

  @Get()
  @ApiOperation({ summary: "Listar solicitudes de aprobación con filtros" })
  @ApiResponse({
    status: 200,
    description: "Lista de solicitudes obtenida exitosamente",
  })
  async findAll(@Query() query: QueryApprovalRequestsDto): Promise<any> {
    const queryCommand = new GetApprovalRequestsQuery(
      {
        page: query.page || 1,
        limit: query.limit || 10,
      },
      {
        requesterId: query.requesterId,
        approvalFlowId: query.approvalFlowId,
        status: query.status,
        reservationId: query.reservationId,
      }
    );

    return await this.queryBus.execute(queryCommand);
  }

  @Get("statistics")
  @ApiOperation({ summary: "Obtener estadísticas de aprobaciones" })
  @ApiResponse({
    status: 200,
    description: "Estadísticas obtenidas exitosamente",
  })
  async getStatistics(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("approvalFlowId") approvalFlowId?: string
  ): Promise<any> {
    const query = new GetApprovalStatisticsQuery({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      approvalFlowId,
    });

    return await this.queryBus.execute(query);
  }

  @Get("active-today")
  @UseInterceptors(CacheActiveApprovalsInterceptor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SECURITY, UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: "Obtener aprobaciones activas del día (para vigilantes)",
    description:
      "RF-23: Visualización de reservas aprobadas para vigilante con paginación y filtros",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de aprobaciones activas obtenida exitosamente",
    type: PaginatedActiveApprovalsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Fecha en formato inválido",
  })
  @ApiResponse({
    status: 403,
    description: "No tiene permisos para acceder a este recurso",
  })
  async getActiveToday(
    @Query() dto: GetActiveTodayApprovalsDto
  ): Promise<PaginatedActiveApprovalsResponseDto> {
    const query = new GetActiveTodayApprovalsQuery(
      dto.date,
      dto.page,
      dto.limit,
      {
        resourceId: dto.resourceId,
        programId: dto.programId,
        resourceType: dto.resourceType,
      }
    );

    const result = await this.queryBus.execute(query);

    // Transformar la respuesta al formato esperado
    return {
      data: result.requests,
      meta: result.meta,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener una solicitud por ID" })
  @ApiResponse({
    status: 200,
    description: "Solicitud obtenida exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Solicitud no encontrada",
  })
  async findOne(@Param("id") id: string): Promise<any> {
    const query = new GetApprovalRequestByIdQuery(id);
    return await this.queryBus.execute(query);
  }

  @Post(":id/approve")
  @Audit({
    entityType: "RESERVATION",
    action: AuditAction.APPROVED,
    captureBeforeData: true,
  })
  @ApiOperation({ summary: "Aprobar un paso del flujo" })
  @ApiResponse({
    status: 200,
    description: "Paso aprobado exitosamente",
  })
  @ApiResponse({
    status: 400,
    description: "No es posible aprobar en el estado actual",
  })
  async approve(
    @Param("id") id: string,
    @Body() dto: ApproveStepDto,
    @CurrentUser() user: any
  ): Promise<any> {
    const command = new ApproveStepCommand(
      id,
      user.sub,
      dto.stepName,
      dto.comment
    );

    return await this.commandBus.execute(command);
  }

  @Post(":id/reject")
  @Audit({
    entityType: "RESERVATION",
    action: AuditAction.REJECTED,
    captureBeforeData: true,
  })
  @ApiOperation({ summary: "Rechazar un paso del flujo" })
  @ApiResponse({
    status: 200,
    description: "Paso rechazado exitosamente",
  })
  @ApiResponse({
    status: 400,
    description: "No es posible rechazar en el estado actual",
  })
  async reject(
    @Param("id") id: string,
    @Body() dto: RejectStepDto,
    @CurrentUser() user: any
  ): Promise<any> {
    const command = new RejectStepCommand(
      id,
      user.sub,
      dto.stepName,
      dto.comment
    );

    return await this.commandBus.execute(command);
  }

  @Post(":id/cancel")
  @Audit({
    entityType: "RESERVATION",
    action: AuditAction.CANCELLED,
    captureBeforeData: true,
  })
  @ApiOperation({ summary: "Cancelar una solicitud de aprobación" })
  @ApiResponse({
    status: 200,
    description: "Solicitud cancelada exitosamente",
  })
  @ApiResponse({
    status: 400,
    description: "No es posible cancelar una solicitud completada",
  })
  async cancel(
    @Param("id") id: string,
    @Body() dto: CancelApprovalRequestDto,
    @CurrentUser() user: any
  ): Promise<any> {
    const command = new CancelApprovalRequestCommand(id, user.sub, dto.reason);

    return await this.commandBus.execute(command);
  }

  @Delete(":id")
  @Audit({
    entityType: "RESERVATION",
    action: AuditAction.DELETED,
    captureBeforeData: true,
  })
  @ApiOperation({ summary: "Eliminar una solicitud de aprobación" })
  @ApiResponse({
    status: 200,
    description: "Solicitud eliminada exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Solicitud no encontrada",
  })
  async remove(@Param("id") id: string): Promise<any> {
    // Implementar DeleteApprovalRequestCommand si es necesario
    return { message: "Delete functionality to be implemented" };
  }
}
