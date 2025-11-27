import { RequirePermissions } from "@libs/common/decorators";
import { CurrentUser } from "@libs/decorators";
import { JwtAuthGuard } from "@libs/guards";
import { PermissionsGuard } from "@libs/guards/permissions.guard";
import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RequestReassignmentCommand } from "../../application/commands/request-reassignment.command";
import { RespondReassignmentCommand } from "../../application/commands/respond-reassignment.command";
import { GetReassignmentHistoryQuery } from "../../application/queries/get-reassignment-history.query";
import {
  GetReassignmentHistoryDto,
  ReassignmentHistoryResponseDto,
  ReassignmentResponseDto,
  RequestReassignmentDto,
  RespondReassignmentDto,
} from "../dtos/reassignment.dto";

/**
 * Controller para gestión de reasignaciones automáticas
 */
@ApiTags("Reassignments")
@Controller("reassignments")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReassignmentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  /**
   * Solicitar reasignación de recurso
   */
  @Post("request")
  @RequirePermissions("availability:reassign")
  @ApiOperation({
    summary: "Solicitar reasignación de recurso",
    description:
      "Busca alternativas para un recurso no disponible usando algoritmo de similitud multi-criterio",
  })
  @ApiResponse({
    status: 201,
    description: "Alternativas encontradas y notificación enviada",
    type: ReassignmentResponseDto,
  })
  async requestReassignment(
    @Body() dto: RequestReassignmentDto,
    @CurrentUser("sub") userId: string
  ): Promise<ReassignmentResponseDto> {
    const command = new RequestReassignmentCommand(dto, userId);
    return await this.commandBus.execute(command);
  }

  /**
   * Responder a reasignación
   */
  @Post("respond")
  @RequirePermissions("reservations:manage")
  @ApiOperation({
    summary: "Aceptar o rechazar reasignación",
    description:
      "El usuario puede aceptar o rechazar una reasignación sugerida",
  })
  @ApiResponse({
    status: 200,
    description: "Respuesta registrada exitosamente",
  })
  async respondToReassignment(
    @Body() dto: RespondReassignmentDto,
    @CurrentUser("sub") userId: string
  ): Promise<void> {
    const command = new RespondReassignmentCommand(dto, userId);
    return await this.commandBus.execute(command);
  }

  /**
   * Obtener historial de reasignaciones
   */
  @Get("history")
  @RequirePermissions("availability:read")
  @ApiOperation({
    summary: "Obtener historial de reasignaciones",
    description:
      "Consulta el historial de reasignaciones con filtros opcionales",
  })
  @ApiResponse({
    status: 200,
    description: "Historial obtenido exitosamente",
    type: [ReassignmentHistoryResponseDto],
  })
  async getHistory(
    @Query() filters: GetReassignmentHistoryDto
  ): Promise<ReassignmentHistoryResponseDto[]> {
    const query = new GetReassignmentHistoryQuery(filters);
    return await this.queryBus.execute(query);
  }

  /**
   * Obtener historial propio
   */
  @Get("my-history")
  @RequirePermissions("reservations:read")
  @ApiOperation({
    summary: "Obtener historial propio de reasignaciones",
    description: "Consulta las reasignaciones del usuario autenticado",
  })
  @ApiResponse({
    status: 200,
    description: "Historial propio obtenido exitosamente",
    type: [ReassignmentHistoryResponseDto],
  })
  async getMyHistory(
    @CurrentUser("sub") userId: string
  ): Promise<ReassignmentHistoryResponseDto[]> {
    const query = new GetReassignmentHistoryQuery({ userId });
    return await this.queryBus.execute(query);
  }
}
