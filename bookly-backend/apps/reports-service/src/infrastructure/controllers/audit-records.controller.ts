import { AuditAction } from "@libs/common/enums";
import { JwtAuthGuard } from "@libs/guards";
import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
  StreamableFile,
  UseGuards,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { createReadStream } from "fs";
import { writeFile } from "fs/promises";
import { Model } from "mongoose";
import { join } from "path";
import { AuditRecord } from "@reports/modules/audit/schemas/audit-record.schema";

/**
 * Controller para consultar registros de auditoría
 */
@ApiTags("Audit Records")
@ApiBearerAuth()
@Controller("audit")
@UseGuards(JwtAuthGuard)
export class AuditRecordsController {
  constructor(
    @InjectModel(AuditRecord.name)
    private readonly auditRecordModel: Model<AuditRecord>
  ) {}

  /**
   * Obtener registros de auditoría con filtros y paginación
   */
  @Get()
  @ApiOperation({ summary: "Obtener registros de auditoría con filtros" })
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
    description: "Registros por página (default: 20, max: 100)",
  })
  @ApiQuery({ name: "serviceName", required: false, type: String })
  @ApiQuery({ name: "action", required: false, enum: AuditAction })
  @ApiQuery({ name: "entityType", required: false, type: String })
  @ApiQuery({ name: "userId", required: false, type: String })
  @ApiQuery({ name: "entityId", required: false, type: String })
  @ApiQuery({
    name: "startDate",
    required: false,
    type: String,
    description: "ISO 8601",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    type: String,
    description: "ISO 8601",
  })
  @ApiQuery({ name: "ip", required: false, type: String })
  @ApiQuery({
    name: "sortBy",
    required: false,
    type: String,
    description: "default: timestamp",
  })
  @ApiQuery({
    name: "sortOrder",
    required: false,
    enum: ["asc", "desc"],
    description: "default: desc",
  })
  @ApiResponse({
    status: 200,
    description: "Registros obtenidos exitosamente",
  })
  async getRecords(
    @Query("page") page = 1,
    @Query("limit") limit = 20,
    @Query("serviceName") serviceName?: string,
    @Query("action") action?: AuditAction,
    @Query("entityType") entityType?: string,
    @Query("userId") userId?: string,
    @Query("entityId") entityId?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("ip") ip?: string,
    @Query("sortBy") sortBy = "timestamp",
    @Query("sortOrder") sortOrder: "asc" | "desc" = "desc"
  ) {
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Construir filtros
    const filters: any = {};

    if (serviceName) filters.serviceName = serviceName;
    if (action) filters.action = action;
    if (entityType) filters.entityType = entityType;
    if (userId) filters.userId = userId;
    if (entityId) filters.entityId = entityId;
    if (ip) filters.ip = ip;

    if (startDate || endDate) {
      filters.timestamp = {};
      if (startDate) filters.timestamp.$gte = new Date(startDate);
      if (endDate) filters.timestamp.$lte = new Date(endDate);
    }

    // Ejecutar query
    const [records, total] = await Promise.all([
      this.auditRecordModel
        .find(filters)
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limitNum)
        .lean()
        .exec(),
      this.auditRecordModel.countDocuments(filters),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return {
      success: true,
      data: {
        records,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      },
      message: `${records.length} registros obtenidos`,
    };
  }

  /**
   * Obtener un registro específico por ID
   */
  @Get(":id")
  @ApiOperation({ summary: "Obtener detalle de un registro de auditoría" })
  @ApiParam({ name: "id", description: "ID del registro" })
  @ApiResponse({
    status: 200,
    description: "Registro obtenido exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Registro no encontrado",
  })
  async getRecordById(@Param("id") id: string) {
    const record = await this.auditRecordModel.findById(id).lean().exec();

    if (!record) {
      return {
        success: false,
        message: "Registro no encontrado",
      };
    }

    return {
      success: true,
      data: record,
    };
  }

  /**
   * Exportar registros a CSV
   */
  @Post("export")
  @ApiOperation({ summary: "Exportar registros de auditoría" })
  @ApiResponse({
    status: 200,
    description: "Archivo exportado exitosamente",
  })
  @Header("Content-Type", "text/csv")
  @Header("Content-Disposition", "attachment; filename=audit-records.csv")
  async exportRecords(
    @Body()
    body: {
      filters?: {
        serviceName?: string;
        action?: AuditAction;
        entityType?: string;
        userId?: string;
        startDate?: string;
        endDate?: string;
      };
      format?: "csv" | "json";
      fields?: string[];
    }
  ) {
    const { filters = {}, format = "csv", fields } = body;

    // Construir filtros
    const mongoFilters: any = {};
    if (filters.serviceName) mongoFilters.serviceName = filters.serviceName;
    if (filters.action) mongoFilters.action = filters.action;
    if (filters.entityType) mongoFilters.entityType = filters.entityType;
    if (filters.userId) mongoFilters.userId = filters.userId;

    if (filters.startDate || filters.endDate) {
      mongoFilters.timestamp = {};
      if (filters.startDate)
        mongoFilters.timestamp.$gte = new Date(filters.startDate);
      if (filters.endDate)
        mongoFilters.timestamp.$lte = new Date(filters.endDate);
    }

    // Obtener registros (máximo 10,000)
    const records = await this.auditRecordModel
      .find(mongoFilters)
      .limit(10000)
      .lean()
      .exec();

    if (format === "json") {
      return {
        success: true,
        data: records,
        total: records.length,
      };
    }

    // Generar CSV
    const selectedFields = fields || [
      "_id",
      "timestamp",
      "serviceName",
      "action",
      "entityType",
      "entityId",
      "userId",
      "ip",
    ];

    const csvHeader = selectedFields.join(",");
    const csvRows = records.map((record: any) =>
      selectedFields
        .map((field) => {
          const value = record[field];
          if (value === null || value === undefined) return "";
          if (typeof value === "object") return JSON.stringify(value);
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(",")
    );

    const csvContent = [csvHeader, ...csvRows].join("\n");

    // Guardar temporalmente
    const filePath = join(
      process.cwd(),
      "tmp",
      `audit-export-${Date.now()}.csv`
    );
    await writeFile(filePath, csvContent, "utf-8");

    const file = createReadStream(filePath);
    return new StreamableFile(file);
  }
}
