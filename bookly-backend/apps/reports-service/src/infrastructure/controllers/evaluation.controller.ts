import { ResponseUtil } from "@libs/common";
import { Permissions } from "@libs/decorators/permissions.decorator";
import { JwtAuthGuard } from "@libs/guards";
import { PermissionsGuard } from "@libs/guards/permissions.guard";
import {
  Body,
  Controller,
  Delete,
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
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  CreateEvaluationCommand,
  DeleteEvaluationCommand,
  UpdateEvaluationCommand,
} from "@reports/application/commands/evaluation.commands";
import {
  GetEvaluationByIdQuery,
  GetEvaluationsByPeriodQuery,
  GetEvaluationsNeedingFollowUpQuery,
  GetGeneralEvaluationStatisticsQuery,
  GetLatestUserEvaluationQuery,
  GetPriorityUsersQuery,
  GetUserEvaluationsQuery,
  GetUserEvaluationStatisticsQuery,
} from "@reports/application/queries/evaluation.queries";
import {
  CreateEvaluationDto,
  EvaluationPeriodQueryDto,
  EvaluationQueryDto,
  PriorityUsersQueryDto,
  UpdateEvaluationDto,
} from "../dto/evaluation.dto";

/**
 * Evaluation Controller
 * Controlador REST para gestión de evaluaciones de usuarios (RF-35)
 * HU-30: Evaluación de usuarios
 */
@ApiTags("Evaluations")
@Controller("evaluations")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class EvaluationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  /**
   * Crear evaluación de usuario
   * POST /evaluations
   */
  @Post()
  @Permissions("reports:evaluation:create")
  @ApiOperation({
    summary: "Crear evaluación de usuario",
    description:
      "Permite al staff evaluar el desempeño de un usuario en base a cumplimiento, puntualidad y cuidado de recursos",
  })
  @ApiResponse({
    status: 201,
    description: "Evaluación creada exitosamente",
  })
  @ApiResponse({
    status: 400,
    description: "Datos de evaluación inválidos",
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado",
  })
  async createEvaluation(@Body() dto: CreateEvaluationDto) {
    const command = new CreateEvaluationCommand(
      dto.userId,
      dto.userName,
      dto.userEmail,
      dto.evaluatedBy,
      dto.evaluatorName,
      dto.evaluatorRole,
      dto.complianceScore,
      dto.punctualityScore,
      dto.resourceCareScore,
      dto.comments,
      dto.recommendations,
      dto.period,
    );

    const evaluation = await this.commandBus.execute(command);
    return ResponseUtil.success(evaluation, "Evaluación creada exitosamente");
  }

  /**
   * Listar evaluaciones de usuario
   * GET /evaluations/user/:userId
   */
  @Get("user/:userId")
  @Permissions("reports:evaluation:read")
  @ApiOperation({
    summary: "Listar evaluaciones de usuario",
    description: "Obtiene todas las evaluaciones de un usuario específico",
  })
  @ApiParam({ name: "userId", description: "ID del usuario" })
  @ApiResponse({
    status: 200,
    description: "Lista de evaluaciones",
  })
  async getUserEvaluations(
    @Param("userId") userId: string,
    @Query() queryDto: EvaluationQueryDto,
  ) {
    const query = new GetUserEvaluationsQuery(
      userId,
      queryDto.page,
      queryDto.limit,
    );

    const result = await this.queryBus.execute(query);
    return ResponseUtil.paginated(
      result.evaluations,
      result.total,
      result.page,
      queryDto.limit || 20,
    );
  }

  /**
   * Obtener última evaluación de usuario
   * GET /evaluations/user/:userId/latest
   */
  @Get("user/:userId/latest")
  @Permissions("reports:evaluation:read")
  @ApiOperation({
    summary: "Obtener última evaluación de usuario",
    description: "Consulta la evaluación más reciente de un usuario",
  })
  @ApiParam({ name: "userId", description: "ID del usuario" })
  @ApiResponse({
    status: 200,
    description: "Última evaluación encontrada",
  })
  @ApiResponse({
    status: 404,
    description: "Usuario sin evaluaciones",
  })
  async getLatestUserEvaluation(@Param("userId") userId: string) {
    const query = new GetLatestUserEvaluationQuery(userId);
    const evaluation = await this.queryBus.execute(query);
    return ResponseUtil.success(evaluation);
  }

  /**
   * Listar evaluaciones por período
   * GET /evaluations/period
   */
  @Get("period")
  @Permissions("reports:evaluation:read")
  @ApiOperation({
    summary: "Listar evaluaciones por período",
    description: "Obtiene todas las evaluaciones en un rango de fechas",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de evaluaciones del período",
  })
  async getEvaluationsByPeriod(@Query() queryDto: EvaluationPeriodQueryDto) {
    const query = new GetEvaluationsByPeriodQuery(
      new Date(queryDto.startDate),
      new Date(queryDto.endDate),
      queryDto.page,
      queryDto.limit,
    );

    const result = await this.queryBus.execute(query);
    return ResponseUtil.paginated(
      result.evaluations,
      result.total,
      result.page,
      queryDto.limit || 20,
    );
  }

  /**
   * Obtener usuarios con acceso prioritario
   * GET /evaluations/priority-users
   */
  @Get("priority-users")
  @Permissions("reports:evaluation:read")
  @ApiOperation({
    summary: "Obtener usuarios con acceso prioritario",
    description:
      "Lista usuarios que tienen score >= threshold y califican para acceso prioritario",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de usuarios prioritarios",
  })
  async getPriorityUsers(@Query() queryDto: PriorityUsersQueryDto) {
    const query = new GetPriorityUsersQuery(queryDto.threshold);
    const users = await this.queryBus.execute(query);
    return ResponseUtil.success(users);
  }

  /**
   * Obtener evaluaciones que requieren seguimiento
   * GET /evaluations/follow-up
   */
  @Get("follow-up")
  @Permissions("reports:evaluation:read")
  @ApiOperation({
    summary: "Obtener evaluaciones que requieren seguimiento",
    description:
      "Lista usuarios con evaluaciones bajas que necesitan atención (score < 70 o compliance < 60)",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de evaluaciones que requieren seguimiento",
  })
  async getEvaluationsNeedingFollowUp() {
    const query = new GetEvaluationsNeedingFollowUpQuery();
    const evaluations = await this.queryBus.execute(query);
    return ResponseUtil.success(evaluations);
  }

  /**
   * Obtener estadísticas de evaluación de usuario
   * GET /evaluations/user/:userId/statistics
   */
  @Get("user/:userId/statistics")
  @Permissions("reports:evaluation:read")
  @ApiOperation({
    summary: "Obtener estadísticas de evaluación de usuario",
    description:
      "Consulta promedios, totales y tendencias de evaluaciones de un usuario",
  })
  @ApiParam({ name: "userId", description: "ID del usuario" })
  @ApiResponse({
    status: 200,
    description: "Estadísticas del usuario",
  })
  async getUserStatistics(@Param("userId") userId: string) {
    const query = new GetUserEvaluationStatisticsQuery(userId);
    const statistics = await this.queryBus.execute(query);
    return ResponseUtil.success(statistics);
  }

  /**
   * Obtener estadísticas generales de evaluaciones
   * GET /evaluations/statistics
   */
  @Get("statistics")
  @Permissions("reports:evaluation:read")
  @ApiOperation({
    summary: "Obtener estadísticas generales de evaluaciones",
    description:
      "Consulta métricas generales del sistema de evaluaciones (promedios, conteos, tendencias)",
  })
  @ApiResponse({
    status: 200,
    description: "Estadísticas generales",
  })
  async getGeneralStatistics() {
    const query = new GetGeneralEvaluationStatisticsQuery();
    const statistics = await this.queryBus.execute(query);
    return ResponseUtil.success(statistics);
  }

  /**
   * Obtener evaluación por ID
   * GET /evaluations/:id
   * NOTA: Este handler DEBE ir después de todas las rutas GET estáticas
   * para evitar que ":id" capture "statistics", "period", etc.
   */
  @Get(":id")
  @Permissions("reports:evaluation:read")
  @ApiOperation({
    summary: "Obtener evaluación por ID",
    description: "Consulta los detalles de una evaluación específica",
  })
  @ApiParam({ name: "id", description: "ID de la evaluación" })
  @ApiResponse({
    status: 200,
    description: "Evaluación encontrada",
  })
  @ApiResponse({
    status: 404,
    description: "Evaluación no encontrada",
  })
  async getEvaluationById(@Param("id") evaluationId: string) {
    const query = new GetEvaluationByIdQuery(evaluationId);
    const evaluation = await this.queryBus.execute(query);
    return ResponseUtil.success(evaluation);
  }

  /**
   * Actualizar evaluación
   * PATCH /evaluations/:id
   */
  @Patch(":id")
  @Permissions("reports:evaluation:update")
  @ApiOperation({
    summary: "Actualizar evaluación",
    description:
      "Modifica los scores o comentarios de una evaluación existente",
  })
  @ApiParam({ name: "id", description: "ID de la evaluación" })
  @ApiResponse({
    status: 200,
    description: "Evaluación actualizada exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Evaluación no encontrada",
  })
  async updateEvaluation(
    @Param("id") evaluationId: string,
    @Body() dto: UpdateEvaluationDto,
  ) {
    const command = new UpdateEvaluationCommand(
      evaluationId,
      dto.complianceScore,
      dto.punctualityScore,
      dto.resourceCareScore,
      undefined, // overallScore se calcula automáticamente
      dto.comments,
      dto.recommendations,
    );

    const evaluation = await this.commandBus.execute(command);
    return ResponseUtil.success(
      evaluation,
      "Evaluación actualizada exitosamente",
    );
  }

  /**
   * Eliminar evaluación
   * DELETE /evaluations/:id
   */
  @Delete(":id")
  @Permissions("reports:evaluation:delete")
  @ApiOperation({
    summary: "Eliminar evaluación",
    description: "Elimina permanentemente una evaluación del sistema",
  })
  @ApiParam({ name: "id", description: "ID de la evaluación" })
  @ApiResponse({
    status: 200,
    description: "Evaluación eliminada exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Evaluación no encontrada",
  })
  async deleteEvaluation(@Param("id") evaluationId: string) {
    const command = new DeleteEvaluationCommand(evaluationId);
    await this.commandBus.execute(command);
    return ResponseUtil.success(
      { deleted: true },
      "Evaluación eliminada exitosamente",
    );
  }
}
