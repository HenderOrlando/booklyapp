import { ResponseUtil } from "@libs/common";
import { JwtAuthGuard } from "@libs/guards";
import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Model } from "mongoose";
import { Program } from "../schemas";

/**
 * Programs Controller
 * Controlador REST para consulta de programas académicos
 */
@ApiTags("Programs")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("programs")
export class ProgramsController {
  constructor(
    @InjectModel(Program.name)
    private readonly programModel: Model<Program>,
  ) {}

  @Get()
  @ApiOperation({ summary: "Listar programas académicos" })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "facultyId", required: false, type: String })
  @ApiQuery({ name: "departmentId", required: false, type: String })
  @ApiResponse({ status: 200, description: "Lista de programas" })
  async findAll(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("facultyId") facultyId?: string,
    @Query("departmentId") departmentId?: string,
  ) {
    const currentPage = page ? Number(page) : 1;
    const pageSize = limit ? Number(limit) : 50;
    const filter: Record<string, any> = { isActive: true };

    if (facultyId) filter.facultyId = facultyId;
    if (departmentId) filter.departmentId = departmentId;

    const [data, total] = await Promise.all([
      this.programModel
        .find(filter)
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize)
        .sort({ name: 1 })
        .exec(),
      this.programModel.countDocuments(filter).exec(),
    ]);

    return ResponseUtil.paginated(
      data,
      total,
      currentPage,
      pageSize,
      "Programs retrieved successfully",
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener programa por ID" })
  @ApiResponse({ status: 200, description: "Programa encontrado" })
  @ApiResponse({ status: 404, description: "Programa no encontrado" })
  async findOne(@Param("id") id: string) {
    const program = await this.programModel.findById(id).exec();
    if (!program) {
      throw new NotFoundException("Program not found");
    }
    return ResponseUtil.success(program, "Program retrieved successfully");
  }
}
