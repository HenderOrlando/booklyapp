import { ResponseUtil } from "@libs/common";
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
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Department, DepartmentDocument } from "../schemas/department.schema";

/**
 * Departments Controller
 * Controlador CRUD para gestión de departamentos
 */
@ApiTags("Departments")
@Controller("departments")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class DepartmentsController {
  constructor(
    @InjectModel(Department.name) private readonly departmentModel: Model<DepartmentDocument>,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: "Crear departamento",
    description: "Crea un nuevo departamento asociado a una facultad con un owner (director/responsable). Solo admin.",
  })
  @ApiResponse({ status: 201, description: "Departamento creado exitosamente" })
  @ApiResponse({ status: 409, description: "El código ya existe" })
  async create(
    @Body() dto: { code: string; name: string; description?: string; facultyId: string; ownerId: string; ownerName?: string; ownerEmail?: string },
    @CurrentUser("sub") userId: string,
  ) {
    const department = new this.departmentModel({
      ...dto,
      audit: { createdBy: userId },
    });
    const saved = await department.save();
    return ResponseUtil.success(saved, "Department created successfully");
  }

  @Get()
  @ApiOperation({
    summary: "Listar departamentos",
    description: "Retorna todos los departamentos activos con paginación y filtros",
  })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "facultyId", required: false, description: "Filtrar por facultad" })
  @ApiQuery({ name: "active", required: false, type: Boolean })
  @ApiResponse({ status: 200, description: "Departamentos obtenidos exitosamente" })
  async findAll(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("facultyId") facultyId?: string,
    @Query("active") active?: string,
  ) {
    const filter: Record<string, any> = {};
    if (active !== undefined) filter.isActive = active === "true";
    else filter.isActive = true;
    if (facultyId) filter.facultyId = facultyId;

    const pageNum = page ? Number(page) : 1;
    const limitNum = limit ? Number(limit) : 50;
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      this.departmentModel.find(filter).sort({ name: 1 }).skip(skip).limit(limitNum).exec(),
      this.departmentModel.countDocuments(filter).exec(),
    ]);

    return ResponseUtil.success(
      { data, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } },
      "Departments retrieved successfully",
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener departamento por ID" })
  @ApiParam({ name: "id", description: "ID del departamento" })
  @ApiResponse({ status: 200, description: "Departamento encontrado" })
  @ApiResponse({ status: 404, description: "Departamento no encontrado" })
  async findById(@Param("id") id: string) {
    const department = await this.departmentModel.findById(id).exec();
    if (!department) throw new NotFoundException(`Department ${id} not found`);
    return ResponseUtil.success(department, "Department retrieved successfully");
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Actualizar departamento (solo admin)" })
  @ApiParam({ name: "id" })
  @ApiResponse({ status: 200, description: "Departamento actualizado" })
  @ApiResponse({ status: 404, description: "Departamento no encontrado" })
  async update(
    @Param("id") id: string,
    @Body() dto: { name?: string; description?: string; facultyId?: string; ownerId?: string; ownerName?: string; ownerEmail?: string; isActive?: boolean },
    @CurrentUser("sub") userId: string,
  ) {
    const updated = await this.departmentModel.findByIdAndUpdate(
      id,
      { $set: { ...dto, "audit.updatedBy": userId } },
      { new: true },
    ).exec();
    if (!updated) throw new NotFoundException(`Department ${id} not found`);
    return ResponseUtil.success(updated, "Department updated successfully");
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Desactivar departamento (solo admin)" })
  @ApiParam({ name: "id" })
  @ApiResponse({ status: 200, description: "Departamento desactivado" })
  @ApiResponse({ status: 404, description: "Departamento no encontrado" })
  async deactivate(
    @Param("id") id: string,
    @CurrentUser("sub") userId: string,
  ) {
    const updated = await this.departmentModel.findByIdAndUpdate(
      id,
      { $set: { isActive: false, deletedAt: new Date(), "audit.deletedBy": userId } },
      { new: true },
    ).exec();
    if (!updated) throw new NotFoundException(`Department ${id} not found`);
    return ResponseUtil.success(updated, "Department deactivated successfully");
  }
}
