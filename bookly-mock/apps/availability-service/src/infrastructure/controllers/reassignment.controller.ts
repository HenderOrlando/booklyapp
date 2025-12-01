import { RequirePermissions } from "@libs/common/decorators";
import { ResponseUtil } from "@libs/common";
import { CurrentUser } from "@libs/decorators";
import { JwtAuthGuard } from "@libs/guards";
import { PermissionsGuard } from "@libs/guards/permissions.guard";
import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RequestReassignmentCommand } from '@availability/application/commands/request-reassignment.command";
import { RespondReassignmentCommand } from '@availability/application/commands/respond-reassignment.command";
import { GetReassignmentHistoryQuery } from '@availability/application/queries/get-reassignment-history.query";
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
  ): Promise<any> {
    const command = new RequestReassignmentCommand(dto, userId);
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Reassignment alternatives found successfully');
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
  ): Promise<any> {
    const command = new RespondReassignmentCommand(dto, userId);
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Reassignment response registered successfully');
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
  ): Promise<any> {
    const query = new GetReassignmentHistoryQuery(filters);
    const history = await this.queryBus.execute(query);
    return ResponseUtil.success(history, 'Reassignment history retrieved successfully');
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
  ): Promise<any> {
    const query = new GetReassignmentHistoryQuery({ userId });
    const history = await this.queryBus.execute(query);
    return ResponseUtil.success(history, 'Personal reassignment history retrieved successfully');
  }
}
