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

/**
 * ReferenceData Controller — Stockpile Domain
 * Gestiona datos de referencia dinámicos del dominio de aprobaciones:
 * approval_status, approval_request_status, check_in_status, notification_channel, etc.
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
  @ApiOperation({ summary: "Listar grupos de datos de referencia" })
  @ApiResponse({ status: 200, description: "Grupos obtenidos exitosamente" })
  async getGroups() {
    const groups = await this.referenceDataRepository.getGroups();
    return ResponseUtil.success(groups, "Reference data groups retrieved");
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Listar datos de referencia" })
  @ApiQuery({ name: "group", required: false, example: "approval_status" })
  @ApiQuery({ name: "active", required: false, type: Boolean })
  @ApiResponse({ status: 200, description: "Datos obtenidos exitosamente" })
  async findAll(@Query("group") group?: string, @Query("active") active?: string) {
    const isActive = active !== undefined ? active === "true" : undefined;
    const data = await this.referenceDataRepository.findAll({ group, isActive });
    return ResponseUtil.success(data, "Reference data retrieved");
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Obtener dato de referencia por ID" })
  @ApiParam({ name: "id" })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async findById(@Param("id") id: string) {
    const data = await this.referenceDataRepository.findById(id);
    if (!data) throw new NotFoundException(`Reference data ${id} not found`);
    return ResponseUtil.success(data, "Reference data retrieved");
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Crear dato de referencia (solo admin)" })
  @ApiResponse({ status: 201 })
  async create(
    @Body() dto: { group: string; code: string; name: string; description?: string; color?: string; icon?: string; order?: number; isDefault?: boolean; metadata?: Record<string, any> },
    @CurrentUser("sub") userId: string,
  ) {
    const data = await this.referenceDataRepository.create({ ...dto, createdBy: userId });
    return ResponseUtil.success(data, "Reference data created");
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Actualizar dato de referencia (solo admin)" })
  @ApiParam({ name: "id" })
  async update(
    @Param("id") id: string,
    @Body() dto: { name?: string; description?: string; color?: string; icon?: string; order?: number; isActive?: boolean; isDefault?: boolean; metadata?: Record<string, any> },
    @CurrentUser("sub") userId: string,
  ) {
    const data = await this.referenceDataRepository.update(id, { ...dto, updatedBy: userId });
    if (!data) throw new NotFoundException(`Reference data ${id} not found`);
    return ResponseUtil.success(data, "Reference data updated");
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOperation({ summary: "Desactivar dato de referencia (solo admin)" })
  @ApiParam({ name: "id" })
  async deactivate(@Param("id") id: string, @CurrentUser("sub") userId: string) {
    const data = await this.referenceDataRepository.deactivate(id, userId);
    if (!data) throw new NotFoundException(`Reference data ${id} not found`);
    return ResponseUtil.success(data, "Reference data deactivated");
  }
}
