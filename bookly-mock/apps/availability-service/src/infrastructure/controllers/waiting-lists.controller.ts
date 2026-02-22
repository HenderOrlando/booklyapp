import {
  AddToWaitingListCommand,
  CancelWaitingListCommand,
  NotifyWaitingListCommand,
  UpdateWaitingListPriorityCommand,
  AcceptWaitingListOfferCommand,
} from "@availability/application/commands";
import { GetWaitingListQuery } from "@availability/application/queries";
import { ResponseUtil } from "@libs/common";
import { CurrentUser } from "@libs/decorators";
import { JwtAuthGuard } from "@libs/guards";
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
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  AddToWaitingListDto,
  NotifyWaitingListDto,
  UpdateWaitingListPriorityDto,
} from "../dtos";

/**
 * Waiting Lists Controller
 * Controlador REST para gestión de lista de espera
 */
@ApiTags("Waiting Lists")
@ApiBearerAuth()
@Controller("waiting-lists")
@UseGuards(JwtAuthGuard)
export class WaitingListsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: "Agregar a lista de espera" })
  @ApiResponse({
    status: 201,
    description: "Agregado a lista de espera exitosamente",
  })
  @ApiResponse({
    status: 400,
    description: "Solicitud duplicada o datos inválidos",
  })
  async create(
    @Body() dto: AddToWaitingListDto,
    @CurrentUser() user: any,
  ): Promise<any> {
    const command = new AddToWaitingListCommand(
      dto.resourceId,
      dto.userId,
      dto.requestedStartDate,
      dto.requestedEndDate,
      dto.priority,
      dto.purpose,
      dto.expiresAt,
      user.sub,
    );

    const waitingListEntry = await this.commandBus.execute(command);
    return ResponseUtil.success(
      waitingListEntry,
      "Added to waiting list successfully",
    );
  }

  @Get("resource/:resourceId")
  @ApiOperation({ summary: "Obtener lista de espera de un recurso" })
  @ApiResponse({
    status: 200,
    description: "Lista de espera obtenida exitosamente",
  })
  async findByResource(
    @Param("resourceId") resourceId: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ): Promise<any> {
    const query = new GetWaitingListQuery(resourceId, {
      page: page || 1,
      limit: limit || 10,
    });

    const result = await this.queryBus.execute(query);
    // Si el resultado ya tiene estructura de paginación
    if (result.data && result.meta) {
      return ResponseUtil.paginated(
        result.data,
        result.meta.total,
        page || 1,
        limit || 10,
        "Waiting list retrieved successfully",
      );
    }

    return ResponseUtil.success(result, "Waiting list retrieved successfully");
  }

  @Post("notify")
  @ApiOperation({ summary: "Notificar a los siguientes en lista de espera" })
  @ApiResponse({
    status: 200,
    description: "Usuarios notificados exitosamente",
  })
  async notifyWaitlist(
    @Body() dto: NotifyWaitingListDto,
  ): Promise<any> {
    const command = new NotifyWaitingListCommand(
      dto.resourceId,
      new Date(dto.availableFrom),
      new Date(dto.availableUntil),
      dto.notifyTop
    );

    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(
      result,
      "Users notified successfully",
    );
  }

  @Patch(":id/priority")
  @ApiOperation({ summary: "Actualizar prioridad de una solicitud" })
  @ApiResponse({
    status: 200,
    description: "Prioridad actualizada exitosamente",
  })
  async updatePriority(
    @Param("id") id: string,
    @Body() dto: UpdateWaitingListPriorityDto,
  ): Promise<any> {
    const command = new UpdateWaitingListPriorityCommand(
      id,
      dto.newPriority,
      dto.reason
    );

    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(
      result,
      "Priority updated successfully",
    );
  }

  @Post(":id/accept")
  @ApiOperation({ summary: "Aceptar oferta de lista de espera" })
  @ApiResponse({
    status: 200,
    description: "Oferta aceptada y convertida a reserva exitosamente",
  })
  async acceptOffer(
    @Param("id") id: string,
    @CurrentUser("sub") userId: string,
  ): Promise<any> {
    const command = new AcceptWaitingListOfferCommand(id, userId);

    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(
      result,
      "Offer accepted successfully",
    );
  }

  @Delete(":id")
  @ApiOperation({ summary: "Cancelar solicitud de lista de espera" })
  @ApiResponse({
    status: 200,
    description: "Solicitud cancelada exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Solicitud no encontrada",
  })
  async remove(
    @Param("id") id: string,
    @CurrentUser("sub") userId: string,
  ): Promise<any> {
    const command = new CancelWaitingListCommand(id, userId);
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(
      result,
      "Waiting list entry cancelled successfully",
    );
  }
}
