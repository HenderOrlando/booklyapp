import { ResponseUtil } from "@libs/common";
import { RequirePermissions } from "@libs/common/decorators";
import {
  ImportResourceMode,
  ResourceStatus,
  ResourceType,
} from "@libs/common/enums";
import { CurrentUser } from "@libs/decorators";
import { JwtAuthGuard, PermissionsGuard } from "@libs/guards";
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { CacheInterceptor, CacheKey, CacheTTL } from "@nestjs/cache-manager";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Audit, AuditAction } from "@reports/audit-decorators";
import {
  CreateResourceCommand,
  DeleteResourceCommand,
  ImportResourcesCommand,
  RestoreResourceCommand,
  UpdateResourceCommand,
} from "@resources/application/commands";
import {
  GetResourceByIdQuery,
  GetResourceCharacteristicsQuery,
  GetResourcesQuery,
  SearchResourcesAdvancedQuery,
} from "@resources/application/queries";
import {
  CreateResourceDto,
  ImportResourcesDto,
  SearchResourcesAdvancedDto,
  UpdateResourceDto,
} from "../dto";

/**
 * Resources Controller
 * Controlador REST para gestión de recursos
 *
 * Endpoints disponibles:
 * - GET /resources - Listar recursos con paginación y filtros
 * - GET /resources/:id - Obtener detalles de un recurso
 * - GET /resources/:id/availability-rules - Obtener reglas de disponibilidad
 * - POST /resources - Crear nuevo recurso
 * - POST /resources/import - Importar recursos desde CSV
 * - PATCH /resources/:id - Actualizar recurso
 * - DELETE /resources/:id - Eliminar recurso
 */
@ApiTags("Resources")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("resources")
export class ResourcesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @Audit({
    entityType: "RESOURCE",
    action: AuditAction.CREATED,
  })
  @RequirePermissions("resources:create")
  @ApiOperation({
    summary: "Crear un nuevo recurso",
    description:
      "Crea un nuevo recurso en el sistema con sus reglas de disponibilidad",
  })
  @ApiResponse({
    status: 201,
    description: "Recurso creado exitosamente",
    schema: {
      example: {
        success: true,
        data: {
          id: "resource_123",
          name: "Auditorio Principal",
          type: "auditorio",
          status: "AVAILABLE",
          capacity: 500,
        },
        message: "Resource created successfully",
      },
    },
  })
  @ApiResponse({ status: 400, description: "Datos inválidos" })
  @ApiResponse({ status: 401, description: "No autorizado" })
  async createResource(
    @Body() createResourceDto: CreateResourceDto,
    @CurrentUser("sub") userId: string,
  ) {
    const command = new CreateResourceCommand(
      createResourceDto.code,
      createResourceDto.name,
      createResourceDto.description,
      createResourceDto.type,
      createResourceDto.categoryId,
      createResourceDto.capacity,
      createResourceDto.location,
      createResourceDto.floor,
      createResourceDto.building,
      createResourceDto.attributes,
      createResourceDto.programIds,
      createResourceDto.availabilityRules,
      userId,
    );

    const resource = await this.commandBus.execute(command);

    return ResponseUtil.success(resource, "Resource created successfully");
  }

  @Post("import")
  @Audit({
    entityType: "RESOURCE",
    action: AuditAction.IMPORTED,
  })
  @ApiOperation({
    summary: "Importar recursos masivamente desde CSV",
    description:
      "Permite importar múltiples recursos desde un archivo CSV. Soporta modos: create, update y upsert",
  })
  async importResources(
    @Body() importDto: ImportResourcesDto,
    @CurrentUser("sub") userId: string,
  ) {
    const command = new ImportResourcesCommand(
      importDto.csvContent,
      importDto.mode || ImportResourceMode.CREATE,
      importDto.skipErrors || false,
      userId,
    );

    const result = await this.commandBus.execute(command);

    return ResponseUtil.success(
      result,
      `Import completed: ${result.successCount} created, ${result.updatedCount} updated, ${result.errorCount} errors`,
    );
  }

  @Get("search/advanced")
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000) // 1 min de caché para búsquedas avanzadas
  @ApiOperation({
    summary: "Búsqueda avanzada de recursos",
    description:
      "Realiza una búsqueda avanzada con múltiples filtros: tipos, capacidad, " +
      "categorías, programas, equipamiento, ubicación, edificio, estado y disponibilidad",
  })
  @ApiResponse({
    status: 200,
    description: "Búsqueda completada exitosamente",
    schema: {
      example: {
        success: true,
        data: {
          resources: [
            {
              id: "resource_123",
              code: "AULA-101",
              name: "Aula 101",
              type: "CLASSROOM",
              capacity: 40,
              location: "Edificio A - Piso 1",
              status: "AVAILABLE",
            },
          ],
          meta: {
            total: 15,
            page: 1,
            limit: 10,
            totalPages: 2,
          },
        },
        message: "Advanced search completed successfully",
      },
    },
  })
  @ApiResponse({ status: 400, description: "Parámetros de búsqueda inválidos" })
  @ApiResponse({ status: 401, description: "No autorizado" })
  async searchResourcesAdvanced(
    @Query() searchDto: SearchResourcesAdvancedDto,
  ) {
    const query = new SearchResourcesAdvancedQuery(
      searchDto.types,
      searchDto.minCapacity,
      searchDto.maxCapacity,
      searchDto.categoryIds,
      searchDto.programIds,
      searchDto.hasEquipment,
      searchDto.location,
      searchDto.building,
      searchDto.status,
      searchDto.availableOn,
      searchDto.page || 1,
      searchDto.limit || 10,
      searchDto.sortBy || "createdAt",
      searchDto.sortOrder || "desc",
    );

    const result = await this.queryBus.execute(query);

    return ResponseUtil.success(
      result,
      "Advanced search completed successfully",
    );
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30000) // 30 sec de caché para lista general
  @ApiOperation({
    summary: "Obtener lista de recursos",
    description:
      "Lista todos los recursos con paginación, ordenamiento y filtros",
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
    description: "Cantidad de resultados por página (default: 10)",
  })
  @ApiQuery({
    name: "sortBy",
    required: false,
    type: String,
    description: "Campo para ordenar (default: createdAt)",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    enum: ["asc", "desc"],
    description: "Orden ascendente o descendente (default: desc)",
  })
  @ApiQuery({
    name: "isActive",
    required: false,
    type: Boolean,
    description: "Filtrar por recursos activos/inactivos",
  })
  @ApiQuery({
    name: "status",
    required: false,
    enum: ResourceStatus,
    description: "Filtrar por estado del recurso",
  })
  @ApiQuery({
    name: "type",
    required: false,
    type: String,
    description: "Filtrar por tipo de recurso",
  })
  @ApiQuery({
    name: "minCapacity",
    required: false,
    type: Number,
    description: "Capacidad mínima del recurso",
  })
  @ApiQuery({
    name: "maxCapacity",
    required: false,
    type: Number,
    description: "Capacidad máxima del recurso",
  })
  @ApiQuery({
    name: "search",
    required: false,
    type: String,
    description: "Búsqueda por nombre, código o descripción",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de recursos obtenida exitosamente",
  })
  @ApiResponse({ status: 401, description: "No autorizado" })
  async getResources(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("sortBy") sortBy?: string,
    @Query("sortOrder") sortOrder?: "asc" | "desc",
    @Query("type") type?: ResourceType,
    @Query("categoryId") categoryId?: string,
    @Query("programId") programId?: string,
    @Query("status") status?: string,
    @Query("isActive") isActive?: string,
    @Query("location") location?: string,
    @Query("building") building?: string,
    @Query("minCapacity") minCapacity?: number,
    @Query("maxCapacity") maxCapacity?: number,
    @Query("search") search?: string,
  ) {
    // Manejar múltiples estados (pueden venir como array o string separado por comas)
    let statuses: ResourceStatus[] | undefined;
    if (status) {
      if (Array.isArray(status)) {
        statuses = status as ResourceStatus[];
      } else if (status.includes(",")) {
        statuses = status.split(",") as ResourceStatus[];
      } else {
        statuses = [status as ResourceStatus];
      }
    }

    const query = new GetResourcesQuery(
      {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        sortBy: sortBy || "createdAt",
        sortOrder: sortOrder || "desc",
      },
      {
        type,
        categoryId,
        programId,
        status: statuses,
        isActive:
          isActive === "true" ? true : isActive === "false" ? false : undefined,
        location,
        building,
        minCapacity: minCapacity ? Number(minCapacity) : undefined,
        maxCapacity: maxCapacity ? Number(maxCapacity) : undefined,
        search,
      },
    );

    const result = await this.queryBus.execute(query);

    return ResponseUtil.success(result, "Resources retrieved successfully");
  }

  @Get("characteristics")
  @ApiOperation({
    summary: "Listar catálogo de características de recursos",
    description:
      "Retorna las características de recurso desde reference_data para su asignación reutilizable",
  })
  @ApiQuery({
    name: "active",
    required: false,
    type: Boolean,
    description: "Filtrar solo características activas (default: true)",
  })
  @ApiResponse({
    status: 200,
    description: "Características obtenidas exitosamente",
  })
  @ApiResponse({ status: 401, description: "No autorizado" })
  async getResourceCharacteristics(@Query("active") active?: string) {
    const onlyActive =
      active === undefined ? true : active === "true" ? true : false;

    const query = new GetResourceCharacteristicsQuery(onlyActive);
    const characteristics = await this.queryBus.execute(query);

    return ResponseUtil.success(
      characteristics,
      "Resource characteristics retrieved successfully",
    );
  }

  @Get(":id")
  @ApiOperation({
    summary: "Obtener un recurso por ID",
    description: "Retorna los detalles completos de un recurso específico",
  })
  @ApiParam({
    name: "id",
    description: "ID del recurso",
    type: String,
    example: "resource_123",
  })
  @ApiResponse({
    status: 200,
    description: "Recurso encontrado",
  })
  @ApiResponse({ status: 404, description: "Recurso no encontrado" })
  @ApiResponse({ status: 401, description: "No autorizado" })
  async getResourceById(@Param("id") id: string) {
    const query = new GetResourceByIdQuery(id);
    const resource = await this.queryBus.execute(query);

    return ResponseUtil.success(resource, "Resource retrieved successfully");
  }

  @Get(":id/category")
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000) // 1h de caché, la categoría de un recurso cambia poco
  @ApiOperation({
    summary: "Obtener categoría de un recurso",
    description:
      "Retorna solo la información de categoría de un recurso específico",
  })
  @ApiParam({
    name: "id",
    description: "ID del recurso",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "Categoría del recurso obtenida exitosamente",
    schema: {
      example: {
        success: true,
        data: {
          id: "category_123",
          name: "Salón de Clases",
          code: "CLASSROOM",
          color: "#3B82F6",
        },
        message: "Resource category retrieved successfully",
      },
    },
  })
  @ApiResponse({ status: 404, description: "Recurso no encontrado" })
  @ApiResponse({ status: 401, description: "No autorizado" })
  async getResourceCategory(@Param("id") id: string) {
    const query = new GetResourceByIdQuery(id);
    const resource = await this.queryBus.execute(query);

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    // Retornar solo la información de categoría
    return ResponseUtil.success(
      {
        id: resource.categoryId,
        // La categoría completa estaría en resource.category si la incluimos en la query
      },
      "Resource category retrieved successfully",
    );
  }

  @Patch(":id")
  @Audit({
    entityType: "RESOURCE",
    action: AuditAction.UPDATED,
    captureBeforeData: true,
  })
  @RequirePermissions("resources:update")
  @ApiOperation({
    summary: "Actualizar un recurso",
    description: "Actualiza los datos de un recurso existente",
  })
  @ApiParam({
    name: "id",
    description: "ID del recurso a actualizar",
    type: String,
  })
  @ApiResponse({ status: 200, description: "Recurso actualizado exitosamente" })
  @ApiResponse({ status: 404, description: "Recurso no encontrado" })
  @ApiResponse({ status: 400, description: "Datos inválidos" })
  @ApiResponse({ status: 401, description: "No autorizado" })
  async updateResource(
    @Param("id") id: string,
    @Body() updateResourceDto: UpdateResourceDto,
    @CurrentUser("sub") userId: string,
  ) {
    const command = new UpdateResourceCommand(id, updateResourceDto, userId);

    const resource = await this.commandBus.execute(command);

    return ResponseUtil.success(resource, "Resource updated successfully");
  }

  @Delete(":id")
  @Audit({
    entityType: "RESOURCE",
    action: AuditAction.DELETED,
    captureBeforeData: true,
  })
  @RequirePermissions("resources:delete")
  @ApiOperation({
    summary: "Eliminar un recurso",
    description: "Elimina (soft delete) un recurso del sistema",
  })
  @ApiParam({
    name: "id",
    description: "ID del recurso a eliminar",
    type: String,
  })
  @ApiResponse({ status: 200, description: "Recurso eliminado exitosamente" })
  @ApiResponse({ status: 404, description: "Recurso no encontrado" })
  @ApiResponse({
    status: 400,
    description: "No se puede eliminar recurso con reservas activas",
  })
  @ApiResponse({ status: 401, description: "No autorizado" })
  async deleteResource(
    @Param("id") id: string,
    @CurrentUser("sub") userId: string,
  ) {
    const command = new DeleteResourceCommand(id, userId);
    const result = await this.commandBus.execute(command);

    return ResponseUtil.success(
      { deleted: result },
      "Resource deleted successfully",
    );
  }

  @Post(":id/restore")
  @Audit({
    entityType: "RESOURCE",
    action: AuditAction.UPDATED,
  })
  @RequirePermissions("resources:restore")
  @ApiOperation({
    summary: "Restaurar un recurso eliminado",
    description: "Restaura un recurso previamente eliminado (soft delete)",
  })
  @ApiParam({
    name: "id",
    description: "ID del recurso a restaurar",
    type: String,
  })
  @ApiResponse({ status: 200, description: "Recurso restaurado exitosamente" })
  @ApiResponse({ status: 404, description: "Recurso no encontrado" })
  @ApiResponse({
    status: 400,
    description: "El recurso no está eliminado",
  })
  @ApiResponse({ status: 401, description: "No autorizado" })
  async restoreResource(
    @Param("id") id: string,
    @CurrentUser("sub") userId: string,
  ) {
    const command = new RestoreResourceCommand(id, userId);
    const result = await this.commandBus.execute(command);

    return ResponseUtil.success(
      { restored: result },
      "Resource restored successfully",
    );
  }

  @Get(":id/availability-rules")
  @ApiOperation({
    summary: "Obtener reglas de disponibilidad de un recurso",
    description:
      "Retorna las reglas de disponibilidad configuradas para un recurso específico. " +
      "Estas reglas son utilizadas por availability-service para validar reservas.",
  })
  @ApiParam({
    name: "id",
    description: "ID del recurso",
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: "Reglas de disponibilidad obtenidas exitosamente",
    schema: {
      example: {
        success: true,
        data: {
          resourceId: "resource_123",
          requiresApproval: true,
          maxAdvanceBookingDays: 90,
          minBookingDurationMinutes: 60,
          maxBookingDurationMinutes: 480,
          allowRecurring: true,
          customRules: {
            businessHoursOnly: true,
            weekdaysOnly: false,
            maxConcurrentBookings: 1,
          },
        },
        message: "Availability rules retrieved successfully",
      },
    },
  })
  @ApiResponse({ status: 404, description: "Recurso no encontrado" })
  @ApiResponse({ status: 401, description: "No autorizado" })
  async getAvailabilityRules(@Param("id") id: string) {
    const query = new GetResourceByIdQuery(id);
    const resource = await this.queryBus.execute(query);

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }

    return ResponseUtil.success(
      {
        resourceId: resource.id,
        ...resource.availabilityRules,
      },
      "Availability rules retrieved successfully",
    );
  }
}
