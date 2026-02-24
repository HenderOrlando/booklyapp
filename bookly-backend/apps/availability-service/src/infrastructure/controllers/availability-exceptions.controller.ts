import { RequirePermissions } from "@libs/common/decorators";
import { ResponseUtil } from "@libs/common";
import { CurrentUser } from "@libs/decorators";
import { JwtAuthGuard } from "@libs/guards";
import { PermissionsGuard } from "@libs/guards/permissions.guard";
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
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CreateAvailabilityExceptionCommand } from "@availability/application/commands/create-availability-exception.command";
import { DeleteAvailabilityExceptionCommand } from "@availability/application/commands/delete-availability-exception.command";
import { GetAvailabilityExceptionsQuery } from "@availability/application/queries/get-availability-exceptions.query";
import {
  AvailabilityExceptionResponseDto,
  CreateAvailabilityExceptionDto,
  QueryAvailabilityExceptionsDto,
} from "../dtos/availability-exception.dto";

/**
 * Availability Exceptions Controller
 * Gestión de excepciones de disponibilidad (días festivos, cierres, etc.)
 */
@ApiTags("Availability Exceptions")
@ApiBearerAuth()
@Controller("availability/exceptions")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AvailabilityExceptionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  @RequirePermissions("availability:manage")
  @ApiOperation({
    summary: "Crear excepción de disponibilidad",
    description:
      "Crea una excepción para bloquear o habilitar un recurso en una fecha específica. Útil para días festivos, eventos especiales o cierres temporales.",
  })
  @ApiResponse({
    status: 201,
    description: "Excepción creada exitosamente",
    type: AvailabilityExceptionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Ya existe una excepción para esta fecha y recurso",
  })
  @ApiResponse({
    status: 401,
    description: "No autenticado",
  })
  @ApiResponse({
    status: 403,
    description: "Sin permisos para gestionar disponibilidad",
  })
  async create(
    @Body() dto: CreateAvailabilityExceptionDto,
    @CurrentUser() user: any
  ): Promise<any> {
    const command = new CreateAvailabilityExceptionCommand(
      user.id || user.userId,
      dto
    );
    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, 'Availability exception created successfully');
  }

  @Get()
  @RequirePermissions("availability:read")
  @ApiOperation({
    summary: "Listar excepciones de disponibilidad",
    description:
      "Obtiene lista de excepciones filtradas por recurso, fechas, motivo, etc.",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de excepciones obtenida exitosamente",
    type: [AvailabilityExceptionResponseDto],
    schema: {
      example: [
        {
          id: "507f1f77bcf86cd799439011",
          resourceId: "507f1f77bcf86cd799439012",
          exceptionDate: "2025-12-25T00:00:00Z",
          reason: "HOLIDAY",
          isAvailable: false,
          notes: "Navidad - Universidad cerrada",
          createdBy: "507f1f77bcf86cd799439013",
          createdAt: "2025-11-08T10:00:00Z",
          updatedAt: "2025-11-08T10:00:00Z",
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: "No autenticado",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Número de página (default: 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items por página (default: 20)",
  })
  async findAll(
    @Query() filters: QueryAvailabilityExceptionsDto,
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ): Promise<any> {
    const query = new GetAvailabilityExceptionsQuery(filters);
    const result = await this.queryBus.execute(query);
    
    // Aplicar paginación en memoria
    const items = Array.isArray(result) ? result : [];
    const currentPage = page || 1;
    const pageSize = limit || 20;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = items.slice(startIndex, endIndex);
    
    return ResponseUtil.paginated(
      paginatedItems,
      items.length,
      currentPage,
      pageSize,
      'Availability exceptions retrieved successfully'
    );
  }

  @Get("resource/:resourceId")
  @RequirePermissions("availability:read")
  @ApiOperation({
    summary: "Listar excepciones de un recurso",
    description: "Obtiene todas las excepciones de un recurso específico",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de excepciones del recurso",
    type: [AvailabilityExceptionResponseDto],
  })
  async findByResource(
    @Param("resourceId") resourceId: string
  ): Promise<any> {
    const query = new GetAvailabilityExceptionsQuery({ resourceId });
    const result = await this.queryBus.execute(query);
    return ResponseUtil.success(result, 'Resource availability exceptions retrieved successfully');
  }

  @Delete(":id")
  @RequirePermissions("availability:manage")
  @ApiOperation({
    summary: "Eliminar excepción de disponibilidad",
    description: "Elimina una excepción existente",
  })
  @ApiResponse({
    status: 200,
    description: "Excepción eliminada exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Excepción no encontrada",
  })
  @ApiResponse({
    status: 403,
    description: "Sin permisos para gestionar disponibilidad",
  })
  async delete(@Param("id") id: string): Promise<any> {
    const command = new DeleteAvailabilityExceptionCommand(id);
    await this.commandBus.execute(command);
    return ResponseUtil.success({ id }, 'Availability exception deleted successfully');
  }
}
