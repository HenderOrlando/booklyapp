import { FeedbackStatus } from "@libs/common/enums";
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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  CreateFeedbackCommand,
  DeleteFeedbackCommand,
  RespondToFeedbackCommand,
  UpdateFeedbackStatusCommand,
} from "../../application/commands/feedback.commands";
import {
  GetAllFeedbackQuery,
  GetFeedbackByIdQuery,
  GetFeedbackByStatusQuery,
  GetFeedbackGeneralStatisticsQuery,
  GetFeedbackResourceStatisticsQuery,
  GetResourceFeedbackQuery,
  GetUserFeedbackQuery,
} from "../../application/queries/feedback.queries";
import {
  CreateFeedbackDto,
  FeedbackQueryDto,
  RespondToFeedbackDto,
  UpdateFeedbackStatusDto,
} from "../dto/feedback.dto";

/**
 * Feedback Controller
 * Controlador para gestión de feedback de usuarios (RF-34)
 */
@ApiTags("Feedback")
@Controller("api/v1/feedback")
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class FeedbackController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  /**
   * Crear feedback de usuario
   * POST /api/v1/feedback
   */
  @Post()
  @Permissions("reports:feedback:create")
  @ApiOperation({ summary: "Crear feedback de usuario sobre una reserva" })
  @ApiResponse({ status: 201, description: "Feedback creado exitosamente" })
  @ApiResponse({
    status: 400,
    description: "Datos inválidos o feedback ya existe",
  })
  @ApiResponse({ status: 401, description: "No autenticado" })
  @ApiResponse({ status: 403, description: "Sin permisos" })
  async createFeedback(@Body() dto: CreateFeedbackDto) {
    const command = new CreateFeedbackCommand(
      dto.userId,
      dto.userName,
      dto.reservationId,
      dto.resourceId,
      dto.resourceName,
      dto.rating,
      dto.comments,
      dto.category,
      dto.isAnonymous
    );

    return await this.commandBus.execute(command);
  }

  /**
   * Obtener feedback por ID
   * GET /api/v1/feedback/:id
   */
  @Get(":id")
  @Permissions("reports:feedback:read")
  @ApiOperation({ summary: "Obtener feedback por ID" })
  @ApiParam({ name: "id", description: "ID del feedback" })
  @ApiResponse({ status: 200, description: "Feedback encontrado" })
  @ApiResponse({ status: 404, description: "Feedback no encontrado" })
  async getFeedbackById(@Param("id") id: string) {
    const query = new GetFeedbackByIdQuery(id);

    return await this.queryBus.execute(query);
  }

  /**
   * Listar feedback de usuario
   * GET /api/v1/feedback/user/:userId
   */
  @Get("user/:userId")
  @Permissions("reports:feedback:read")
  @ApiOperation({ summary: "Listar feedback de un usuario específico" })
  @ApiParam({ name: "userId", description: "ID del usuario" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Lista de feedbacks del usuario" })
  async getUserFeedback(
    @Param("userId") userId: string,
    @Query() queryDto: FeedbackQueryDto
  ) {
    const query = new GetUserFeedbackQuery(
      userId,
      queryDto.page,
      queryDto.limit
    );

    return await this.queryBus.execute(query);
  }

  /**
   * Listar feedback de recurso
   * GET /api/v1/feedback/resource/:resourceId
   */
  @Get("resource/:resourceId")
  @Permissions("reports:feedback:read")
  @ApiOperation({ summary: "Listar feedback de un recurso específico" })
  @ApiParam({ name: "resourceId", description: "ID del recurso" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Lista de feedbacks del recurso" })
  async getResourceFeedback(
    @Param("resourceId") resourceId: string,
    @Query() queryDto: FeedbackQueryDto
  ) {
    const query = new GetResourceFeedbackQuery(
      resourceId,
      queryDto.page,
      queryDto.limit
    );

    return await this.queryBus.execute(query);
  }

  /**
   * Listar feedback por estado
   * GET /api/v1/feedback/status/:status
   */
  @Get("status/:status")
  @Permissions("reports:feedback:read")
  @ApiOperation({
    summary: "Listar feedback por estado (PENDING, RESPONDED, CLOSED)",
  })
  @ApiParam({
    name: "status",
    enum: FeedbackStatus,
    description: "Estado del feedback",
  })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Lista de feedbacks por estado" })
  async getFeedbackByStatus(
    @Param("status") status: FeedbackStatus,
    @Query() queryDto: FeedbackQueryDto
  ) {
    const query = new GetFeedbackByStatusQuery(
      status,
      queryDto.page,
      queryDto.limit
    );

    return await this.queryBus.execute(query);
  }

  /**
   * Listar todo el feedback (Staff)
   * GET /api/v1/feedback
   */
  @Get()
  @Permissions("reports:feedback:read:all")
  @ApiOperation({ summary: "Listar todo el feedback (solo staff)" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({ status: 200, description: "Lista completa de feedbacks" })
  @ApiResponse({ status: 403, description: "Solo accesible por staff" })
  async getAllFeedback(@Query() queryDto: FeedbackQueryDto) {
    const query = new GetAllFeedbackQuery(queryDto.page, queryDto.limit);

    return await this.queryBus.execute(query);
  }

  /**
   * Responder a feedback (Staff)
   * PATCH /api/v1/feedback/:id/respond
   */
  @Patch(":id/respond")
  @Permissions("reports:feedback:respond")
  @ApiOperation({ summary: "Responder a feedback de usuario (solo staff)" })
  @ApiParam({ name: "id", description: "ID del feedback" })
  @ApiResponse({ status: 200, description: "Respuesta enviada exitosamente" })
  @ApiResponse({ status: 404, description: "Feedback no encontrado" })
  @ApiResponse({ status: 403, description: "Solo accesible por staff" })
  async respondToFeedback(
    @Param("id") id: string,
    @Body() dto: RespondToFeedbackDto
  ) {
    const command = new RespondToFeedbackCommand(
      id,
      dto.response,
      dto.respondedBy
    );

    return await this.commandBus.execute(command);
  }

  /**
   * Actualizar estado de feedback
   * PATCH /api/v1/feedback/:id/status
   */
  @Patch(":id/status")
  @Permissions("reports:feedback:update")
  @ApiOperation({ summary: "Actualizar estado de feedback" })
  @ApiParam({ name: "id", description: "ID del feedback" })
  @ApiResponse({ status: 200, description: "Estado actualizado exitosamente" })
  @ApiResponse({ status: 404, description: "Feedback no encontrado" })
  async updateFeedbackStatus(
    @Param("id") id: string,
    @Body() dto: UpdateFeedbackStatusDto
  ) {
    const command = new UpdateFeedbackStatusCommand(id, dto.status);

    return await this.commandBus.execute(command);
  }

  /**
   * Eliminar feedback
   * DELETE /api/v1/feedback/:id
   */
  @Delete(":id")
  @Permissions("reports:feedback:delete")
  @ApiOperation({ summary: "Eliminar feedback" })
  @ApiParam({ name: "id", description: "ID del feedback" })
  @ApiResponse({ status: 200, description: "Feedback eliminado exitosamente" })
  @ApiResponse({ status: 404, description: "Feedback no encontrado" })
  async deleteFeedback(@Param("id") id: string) {
    const command = new DeleteFeedbackCommand(id);

    return await this.commandBus.execute(command);
  }

  /**
   * Obtener estadísticas de feedback por recurso
   * GET /api/v1/feedback/statistics/resource/:resourceId
   */
  @Get("statistics/resource/:resourceId")
  @Permissions("reports:feedback:statistics")
  @ApiOperation({ summary: "Obtener estadísticas de feedback por recurso" })
  @ApiParam({ name: "resourceId", description: "ID del recurso" })
  @ApiResponse({ status: 200, description: "Estadísticas del recurso" })
  async getResourceStatistics(@Param("resourceId") resourceId: string) {
    const query = new GetFeedbackResourceStatisticsQuery(resourceId);

    return await this.queryBus.execute(query);
  }

  /**
   * Obtener estadísticas generales de feedback
   * GET /api/v1/feedback/statistics/general
   */
  @Get("statistics/general")
  @Permissions("reports:feedback:statistics")
  @ApiOperation({ summary: "Obtener estadísticas generales de feedback" })
  @ApiResponse({ status: 200, description: "Estadísticas generales" })
  async getGeneralStatistics() {
    const query = new GetFeedbackGeneralStatisticsQuery();

    return await this.queryBus.execute(query);
  }
}
