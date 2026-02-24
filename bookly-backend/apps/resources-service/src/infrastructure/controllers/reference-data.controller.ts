import { ResponseUtil } from "@libs/common";
import { ReferenceDataRepository } from "@libs/database";
import { CurrentUser } from "@libs/decorators";
import { JwtAuthGuard, RolesGuard } from "@libs/guards";
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
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  CreateReferenceDataRequestDto,
  UpdateReferenceDataRequestDto,
} from "../dto/reference-data.dto";

/**
 * ReferenceData Controller — Resources Domain
 * Gestiona datos de referencia dinámicos del dominio de recursos:
 * resource_type, resource_status, maintenance_type, maintenance_status, category_type
 */
@ApiTags("Reference Data")
@Controller("reference-data")
@ApiBearerAuth()
export class ReferenceDataController {
  constructor(
    private readonly referenceDataRepository: ReferenceDataRepository,
  ) {}

  @Get("groups")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "Listar grupos de datos de referencia",
    description: "Retorna los nombres de todos los grupos disponibles en el dominio de recursos",
  })
  @ApiResponse({ status: 200, description: "Grupos obtenidos exitosamente" })
  async getGroups() {
    const groups = await this.referenceDataRepository.getGroups();
    return ResponseUtil.success(groups, "Reference data groups retrieved");
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "Listar datos de referencia",
    description: "Retorna datos de referencia filtrados por grupo y/o estado",
  })
  @ApiQuery({ name: "group", required: false, description: "Filtrar por grupo", example: "resource_type" })
  @ApiQuery({ name: "active", required: false, type: Boolean, description: "Filtrar por estado activo" })
  @ApiResponse({ status: 200, description: "Datos obtenidos exitosamente" })
  async findAll(
    @Query("group") group?: string,
    @Query("active") active?: string,
  ) {
    const isActive = active !== undefined ? active === "true" : undefined;
    const data = await this.referenceDataRepository.findAll({
      group,
      isActive,
    });
    return ResponseUtil.success(data, "Reference data retrieved");
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "Obtener dato de referencia por ID",
    description: "Retorna un dato de referencia específico",
  })
  @ApiParam({ name: "id", description: "ID del dato de referencia" })
  @ApiResponse({ status: 200, description: "Dato encontrado" })
  @ApiResponse({ status: 404, description: "Dato no encontrado" })
  async findById(@Param("id") id: string) {
    const data = await this.referenceDataRepository.findById(id);
    if (!data) {
      throw new NotFoundException(`Reference data with id ${id} not found`);
    }
    return ResponseUtil.success(data, "Reference data retrieved");
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: "Crear dato de referencia",
    description: "Crea un nuevo dato de referencia en un grupo (solo admin)",
  })
  @ApiResponse({ status: 201, description: "Dato creado exitosamente" })
  @ApiResponse({ status: 409, description: "El código ya existe en el grupo" })
  async create(
    @Body() dto: CreateReferenceDataRequestDto,
    @CurrentUser("sub") userId: string,
  ) {
    const data = await this.referenceDataRepository.create({
      ...dto,
      createdBy: userId,
    });
    return ResponseUtil.success(data, "Reference data created");
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: "Actualizar dato de referencia",
    description: "Actualiza un dato de referencia existente (solo admin)",
  })
  @ApiParam({ name: "id", description: "ID del dato de referencia" })
  @ApiResponse({ status: 200, description: "Dato actualizado exitosamente" })
  @ApiResponse({ status: 404, description: "Dato no encontrado" })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateReferenceDataRequestDto,
    @CurrentUser("sub") userId: string,
  ) {
    const data = await this.referenceDataRepository.update(id, {
      ...dto,
      updatedBy: userId,
    });
    if (!data) {
      throw new NotFoundException(`Reference data with id ${id} not found`);
    }
    return ResponseUtil.success(data, "Reference data updated");
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({
    summary: "Desactivar dato de referencia",
    description: "Desactiva (soft delete) un dato de referencia (solo admin)",
  })
  @ApiParam({ name: "id", description: "ID del dato de referencia" })
  @ApiResponse({ status: 200, description: "Dato desactivado exitosamente" })
  @ApiResponse({ status: 404, description: "Dato no encontrado" })
  async deactivate(
    @Param("id") id: string,
    @CurrentUser("sub") userId: string,
  ) {
    const data = await this.referenceDataRepository.deactivate(id, userId);
    if (!data) {
      throw new NotFoundException(`Reference data with id ${id} not found`);
    }
    return ResponseUtil.success(data, "Reference data deactivated");
  }
}
