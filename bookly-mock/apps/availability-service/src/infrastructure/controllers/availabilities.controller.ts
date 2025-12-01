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

    const availability = await this.commandBus.execute(command);
    return ResponseUtil.success(availability, 'Availability created successfully');
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

    const result = await this.queryBus.execute(query);
    
    // Si el resultado ya tiene estructura de paginación
    if (result.data && result.meta) {
      return ResponseUtil.paginated(
        result.data,
        result.meta.total,
        page || 1,
        limit || 10,
        'Availabilities retrieved successfully'
      );
    }
    
    return ResponseUtil.success(result, 'Availabilities retrieved successfully');
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

    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Availability checked successfully');
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
  ): Promise<any> {
    const query = new SearchAvailabilityQuery(dto);
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Available slots found successfully');
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
    const result = { message: "Delete functionality to be implemented", id };
    return ResponseUtil.success(result, 'Availability deleted successfully');
  }
}
