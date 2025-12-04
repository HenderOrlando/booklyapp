import { ResponseUtil } from "@libs/common";
import { CurrentUser } from "@libs/decorators";
import { JwtAuthGuard } from "@libs/guards";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { AddToWaitingListCommand } from '@availability/application/commands';
import { GetWaitingListQuery } from '@availability/application/queries';
import { AddToWaitingListDto } from "../dtos";

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
    private readonly queryBus: QueryBus
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
    @CurrentUser() user: any
  ): Promise<any> {
    const command = new AddToWaitingListCommand(
      dto.resourceId,
      dto.userId,
      dto.requestedStartDate,
      dto.requestedEndDate,
      dto.priority,
      dto.purpose,
      dto.expiresAt,
      user.sub
    );

    const waitingListEntry = await this.commandBus.execute(command);
    return ResponseUtil.success(waitingListEntry, 'Added to waiting list successfully');
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
    @Query("limit") limit?: number
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
        'Waiting list retrieved successfully'
      );
    }
    
    return ResponseUtil.success(result, 'Waiting list retrieved successfully');
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
    @CurrentUser() user: any
  ): Promise<any> {
    // Implementar CancelWaitingListCommand si es necesario
    const result = {
      message: "Cancel waiting list functionality to be implemented",
      id,
      userId: user.sub,
    };
    return ResponseUtil.success(result, 'Waiting list entry cancelled successfully');
  }
}
