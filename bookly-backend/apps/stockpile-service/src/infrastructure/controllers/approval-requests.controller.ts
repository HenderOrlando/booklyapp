import { ResponseUtil } from "@libs/common";
import { CurrentUser, Roles } from "@libs/decorators";
import { JwtAuthGuard, RolesGuard } from "@libs/guards";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { Request } from "express";
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
} from "@stockpile/application/commands";
import { DeleteApprovalRequestCommand } from "@stockpile/application/commands/delete-approval-request.command";
import {
  GetActiveTodayApprovalsQuery,
  GetApprovalRequestByIdQuery,
  GetApprovalRequestsQuery,
  GetApprovalStatisticsQuery,
} from "@stockpile/application/queries";
import { ApprovalRequestEntity } from "@stockpile/domain/entities";
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
    private readonly queryBus: QueryBus,
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
    @CurrentUser() user: any,
  ): Promise<any> {
    const command = new CreateApprovalRequestCommand(
      dto.reservationId,
      dto.requesterId,
      dto.approvalFlowId,
      dto.metadata,
      user.sub,
    );

    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(
      result,
      "Approval request created successfully",
    );
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
        resourceId: query.resourceId,
        programId: query.programId,
        priority: query.priority,
        search: query.search,
        startDate: query.startDate,
        endDate: query.endDate,
      },
    );

    const result = await this.queryBus.execute(queryCommand);
    const requests = result.requests || result.data || [];
    const meta = result.meta;

    const enrichedRequests = requests.map((r: ApprovalRequestEntity) =>
      this.mapEntityToFrontendDto(r),
    );

    if (meta) {
      return ResponseUtil.paginated(
        enrichedRequests,
        meta.total,
        query.page || 1,
        query.limit || 10,
        "Approval requests retrieved successfully",
      );
    }

    return ResponseUtil.success(
      enrichedRequests,
      "Approval requests retrieved successfully",
    );
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
    @Query("approvalFlowId") approvalFlowId?: string,
  ): Promise<any> {
    const query = new GetApprovalStatisticsQuery({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      approvalFlowId,
    });

    const result = await this.queryBus.execute(query);
    const mappedStats = {
      totalPending: result.pending || 0,
      totalInReview: result.inReview || 0,
      totalApproved: result.approved || 0,
      totalRejected: result.rejected || 0,
      totalCancelled: result.cancelled || 0,
      totalExpired: result.expired || 0,
      averageApprovalTime: result.averageApprovalTime || 0,
      approvalRate: result.total > 0 ? Math.round((result.approved / result.total) * 100) : 0,
      rejectionRate: result.total > 0 ? Math.round((result.rejected / result.total) * 100) : 0,
    };
    return ResponseUtil.success(
      mappedStats,
      "Approval statistics retrieved successfully",
    );
  }

  @Get("active-today")
  @UseInterceptors(CacheActiveApprovalsInterceptor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("SECURITY", "GENERAL_ADMIN", "PROGRAM_ADMIN")
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
  async getActiveToday(@Query() dto: GetActiveTodayApprovalsDto): Promise<any> {
    const query = new GetActiveTodayApprovalsQuery(
      dto.date,
      dto.page,
      dto.limit,
      {
        resourceId: dto.resourceId,
        programId: dto.programId,
        resourceType: dto.resourceType,
      },
    );

    const result = await this.queryBus.execute(query);

    // Transformar la respuesta al formato esperado con ResponseUtil
    return ResponseUtil.paginated(
      result.requests,
      result.meta.total,
      dto.page || 1,
      dto.limit || 10,
      "Active approvals for today retrieved successfully",
    );
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
    const result = await this.queryBus.execute(query);
    const enriched = this.mapEntityToFrontendDto(result);
    return ResponseUtil.success(
      enriched,
      "Approval request retrieved successfully",
    );
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
    @CurrentUser() user: any,
    @Req() req: Request,
  ): Promise<any> {
    const command = new ApproveStepCommand(
      id,
      user.sub,
      dto.stepName,
      dto.comment,
      {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
    );

    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, "Step approved successfully");
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
    @CurrentUser() user: any,
    @Req() req: Request,
  ): Promise<any> {
    const command = new RejectStepCommand(
      id,
      user.sub,
      dto.stepName,
      dto.comment,
      {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
    );

    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, "Step rejected successfully");
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
    @CurrentUser() user: any,
    @Req() req: Request,
  ): Promise<any> {
    const command = new CancelApprovalRequestCommand(
      id, 
      user.sub, 
      dto.reason,
      {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
    );

    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(
      result,
      "Approval request cancelled successfully",
    );
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
  async remove(
    @Param("id") id: string,
    @CurrentUser("sub") userId: string,
  ): Promise<any> {
    const command = new DeleteApprovalRequestCommand(id, userId);
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(
      result,
      "Approval request deleted successfully",
    );
  }

  /**
   * Mapea ApprovalRequestEntity al shape que espera el frontend.
   * Usa metadata para enriquecer con datos de usuario, recurso y reserva.
   */
  private mapEntityToFrontendDto(entity: ApprovalRequestEntity): Record<string, any> {
    const meta = entity.metadata || {};
    const lastApproval = entity.approvalHistory?.length
      ? entity.approvalHistory[entity.approvalHistory.length - 1]
      : undefined;

    return {
      id: entity.id,
      reservationId: entity.reservationId,
      userId: entity.requesterId,
      userName: meta.userName || "",
      userEmail: meta.userEmail || "",
      userRole: meta.userRole,
      resourceId: meta.resourceId || "",
      resourceName: meta.resourceName || "",
      resourceType: meta.resourceType,
      categoryName: meta.categoryName,
      programId: entity.metadata?.programId,
      programName: meta.programName,
      startDate: meta.reservationStartDate || null,
      endDate: meta.reservationEndDate || null,
      purpose: meta.purpose || "",
      attendees: meta.attendees || 0,
      requiresEquipment: meta.requiresEquipment,
      specialRequirements: meta.specialRequirements,
      status: entity.status,
      priority: meta.priority || "NORMAL",
      currentLevel: meta.currentLevel || "FIRST_LEVEL",
      maxLevel: meta.maxLevel || "FIRST_LEVEL",
      requestedAt: entity.submittedAt?.toISOString?.() || entity.submittedAt,
      reviewedAt: entity.completedAt?.toISOString?.() || entity.completedAt,
      reviewedBy: lastApproval?.approverId,
      reviewerName: lastApproval?.stepName,
      comments: lastApproval?.comment,
      rejectionReason: meta.rejectionReason || (entity.status === "REJECTED" ? lastApproval?.comment : undefined),
      expiresAt: meta.expiresAt,
      history: entity.approvalHistory?.map((h) => ({
        id: `${entity.id}_${h.stepName}`,
        approvalRequestId: entity.id,
        action: h.decision,
        performedBy: h.approverId,
        performerName: h.stepName,
        level: meta.currentLevel || "FIRST_LEVEL",
        comments: h.comment,
        timestamp: h.approvedAt?.toISOString?.() || h.approvedAt,
      })),
      createdAt: entity.createdAt?.toISOString?.() || entity.createdAt,
      updatedAt: entity.updatedAt?.toISOString?.() || entity.updatedAt,
    };
  }
}
