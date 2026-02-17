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
import { Faculty, FacultyDocument } from "../schemas/faculty.schema";

/**
 * Faculties Controller
 * Controlador CRUD para gestión de facultades
 */
@ApiTags("Faculties")
@Controller("faculties")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class FacultiesController {
  constructor(
    @InjectModel(Faculty.name) private readonly facultyModel: Model<FacultyDocument>,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: "Crear facultad",
    description: "Crea una nueva facultad con un owner (decano/responsable). Solo admin.",
  })
  @ApiResponse({ status: 201, description: "Facultad creada exitosamente" })
  @ApiResponse({ status: 409, description: "El código ya existe" })
  async create(
    @Body() dto: { code: string; name: string; description?: string; ownerId: string; ownerName?: string; ownerEmail?: string },
    @CurrentUser("sub") userId: string,
  ) {
    const faculty = new this.facultyModel({
      ...dto,
      audit: { createdBy: userId },
    });
    const saved = await faculty.save();
    return ResponseUtil.success(saved, "Faculty created successfully");
  }

  @Get()
  @ApiOperation({
    summary: "Listar facultades",
    description: "Retorna todas las facultades activas con paginación",
  })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "active", required: false, type: Boolean })
  @ApiResponse({ status: 200, description: "Facultades obtenidas exitosamente" })
  async findAll(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("active") active?: string,
  ) {
    const filter: Record<string, any> = {};
    if (active !== undefined) filter.isActive = active === "true";
    else filter.isActive = true;

    const pageNum = page ? Number(page) : 1;
    const limitNum = limit ? Number(limit) : 50;
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      this.facultyModel.find(filter).sort({ name: 1 }).skip(skip).limit(limitNum).exec(),
      this.facultyModel.countDocuments(filter).exec(),
    ]);

    return ResponseUtil.success(
      { data, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } },
      "Faculties retrieved successfully",
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener facultad por ID" })
  @ApiParam({ name: "id", description: "ID de la facultad" })
  @ApiResponse({ status: 200, description: "Facultad encontrada" })
  @ApiResponse({ status: 404, description: "Facultad no encontrada" })
  async findById(@Param("id") id: string) {
    const faculty = await this.facultyModel.findById(id).exec();
    if (!faculty) throw new NotFoundException(`Faculty ${id} not found`);
    return ResponseUtil.success(faculty, "Faculty retrieved successfully");
  }

  @Patch(":id")
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Actualizar facultad (solo admin)" })
  @ApiParam({ name: "id" })
  @ApiResponse({ status: 200, description: "Facultad actualizada" })
  @ApiResponse({ status: 404, description: "Facultad no encontrada" })
  async update(
    @Param("id") id: string,
    @Body() dto: { name?: string; description?: string; ownerId?: string; ownerName?: string; ownerEmail?: string; isActive?: boolean },
    @CurrentUser("sub") userId: string,
  ) {
    const updated = await this.facultyModel.findByIdAndUpdate(
      id,
      { $set: { ...dto, "audit.updatedBy": userId } },
      { new: true },
    ).exec();
    if (!updated) throw new NotFoundException(`Faculty ${id} not found`);
    return ResponseUtil.success(updated, "Faculty updated successfully");
  }

  @Delete(":id")
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: "Desactivar facultad (solo admin)" })
  @ApiParam({ name: "id" })
  @ApiResponse({ status: 200, description: "Facultad desactivada" })
  @ApiResponse({ status: 404, description: "Facultad no encontrada" })
  async deactivate(
    @Param("id") id: string,
    @CurrentUser("sub") userId: string,
  ) {
    const updated = await this.facultyModel.findByIdAndUpdate(
      id,
      { $set: { isActive: false, deletedAt: new Date(), "audit.deletedBy": userId } },
      { new: true },
    ).exec();
    if (!updated) throw new NotFoundException(`Faculty ${id} not found`);
    return ResponseUtil.success(updated, "Faculty deactivated successfully");
  }
}
