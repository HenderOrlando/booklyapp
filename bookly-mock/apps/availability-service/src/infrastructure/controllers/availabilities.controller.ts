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
import { CreateAvailabilityCommand } from "../../application/commands";
import {
  CheckAvailabilityQuery,
  GetAvailabilitiesQuery,
  SearchAvailabilityQuery,
} from "../../application/queries";
import {
  CheckAvailabilityDto,
  CreateAvailabilityDto,
  SearchAvailabilityDto,
  SearchAvailabilityResponseDto,
} from "../dtos";

/**
 * Availabilities Controller
 * Controlador REST para gestión de disponibilidad
 */
@ApiTags("Availabilities")
@ApiBearerAuth()
@Controller("availabilities")
@UseGuards(JwtAuthGuard)
export class AvailabilitiesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  @ApiOperation({ summary: "Crear una nueva disponibilidad" })
  @ApiResponse({
    status: 201,
    description: "Disponibilidad creada exitosamente",
  })
  @ApiResponse({
    status: 400,
    description: "Datos inválidos o solapamiento con horarios existentes",
  })
  async create(
    @Body() dto: CreateAvailabilityDto,
    @CurrentUser() user: any
  ): Promise<any> {
    const command = new CreateAvailabilityCommand(
      dto.resourceId,
      dto.dayOfWeek,
      dto.startTime,
      dto.endTime,
      dto.isAvailable,
      dto.maxConcurrentReservations,
      dto.effectiveFrom,
      dto.effectiveUntil,
      dto.notes,
      user.sub
    );

    return await this.commandBus.execute(command);
  }

  @Get("resource/:resourceId")
  @ApiOperation({ summary: "Obtener disponibilidades de un recurso" })
  @ApiResponse({
    status: 200,
    description: "Disponibilidades obtenidas exitosamente",
  })
  async findByResource(
    @Param("resourceId") resourceId: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ): Promise<any> {
    const query = new GetAvailabilitiesQuery(resourceId, {
      page: page || 1,
      limit: limit || 10,
    });

    return await this.queryBus.execute(query);
  }

  @Post("check")
  @ApiOperation({ summary: "Verificar disponibilidad de un recurso" })
  @ApiResponse({
    status: 200,
    description: "Disponibilidad verificada exitosamente",
  })
  async checkAvailability(@Body() dto: CheckAvailabilityDto): Promise<any> {
    const query = new CheckAvailabilityQuery(
      dto.resourceId,
      dto.startDate,
      dto.endDate
    );

    return await this.queryBus.execute(query);
  }

  @Post("search")
  @ApiOperation({
    summary: "Búsqueda avanzada de disponibilidad con filtros complejos",
    description:
      "Permite buscar slots disponibles usando múltiples filtros: rango de fechas, horarios, tipos de recursos, capacidad, features, programa, ubicación, etc.",
  })
  @ApiResponse({
    status: 200,
    description: "Slots disponibles encontrados exitosamente",
    type: SearchAvailabilityResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Filtros inválidos o datos mal formateados",
  })
  @ApiResponse({
    status: 401,
    description: "No autorizado - Token inválido o expirado",
  })
  async searchAvailability(
    @Body() dto: SearchAvailabilityDto
  ): Promise<SearchAvailabilityResponseDto> {
    const query = new SearchAvailabilityQuery(dto);
    return await this.queryBus.execute(query);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Eliminar una disponibilidad" })
  @ApiResponse({
    status: 200,
    description: "Disponibilidad eliminada exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Disponibilidad no encontrada",
  })
  async remove(@Param("id") id: string): Promise<any> {
    // Implementar DeleteAvailabilityCommand si es necesario
    return { message: "Delete functionality to be implemented" };
  }
}
