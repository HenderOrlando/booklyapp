import { Permissions } from "@libs/decorators/permissions.decorator";
import { JwtAuthGuard } from "@libs/guards";
import { PermissionsGuard } from "@libs/guards/permissions.guard";
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Response } from "express";
import * as fs from "fs";
import { createReadStream } from "fs";
import { RequestExportCommand } from '@reports/application/commands/export.commands';
import {
  GetExportStatusQuery,
  GetUserExportHistoryQuery,
} from '@reports/application/queries/export.queries';
import { ExportService } from '@reports/application/services/export.service';
import { RequestExportDto } from "../dto/request-export.dto";

/**
 * Export Controller
 * Endpoints para exportación de reportes (RF-33)
 */
@ApiTags("Exports")
@ApiBearerAuth()
@Controller("reports/export")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExportController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly exportService: ExportService
  ) {}

  /**
   * POST /api/v1/reports/export
   * Solicitar exportación de reporte
   */
  @Post()
  @Permissions("reports:export")
  @ApiOperation({
    summary: "Solicitar exportación",
    description:
      "Crear solicitud de exportación de reporte en formato CSV, PDF o Excel",
  })
  @ApiResponse({
    status: 201,
    description: "Exportación solicitada exitosamente",
  })
  async requestExport(
    @Req() req: any,
    @Body() body: RequestExportDto
  ): Promise<any> {
    const userId = req.user.userId;

    const command = new RequestExportCommand(
      userId,
      body.reportType,
      body.format,
      body.filters || {}
    );

    return await this.commandBus.execute(command);
  }

  /**
   * GET /api/v1/reports/export/:id
   * Obtener estado de exportación
   */
  @Get(":id")
  @Permissions("reports:export")
  @ApiOperation({
    summary: "Estado de exportación",
    description: "Obtener el estado actual de una exportación solicitada",
  })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({
    status: 200,
    description: "Estado de exportación obtenido exitosamente",
  })
  async getExportStatus(@Param("id") exportId: string): Promise<any> {
    const query = new GetExportStatusQuery(exportId);
    return await this.queryBus.execute(query);
  }

  /**
   * GET /api/v1/reports/export/:id/download
   * Descargar archivo exportado
   */
  @Get(":id/download")
  @Permissions("reports:export")
  @ApiOperation({
    summary: "Descargar exportación",
    description: "Descargar el archivo generado de una exportación completada",
  })
  @ApiParam({ name: "id", type: String })
  @ApiResponse({
    status: 200,
    description: "Archivo descargado exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Exportación no encontrada o no disponible",
  })
  async downloadExport(
    @Param("id") exportId: string,
    @Req() req: any,
    @Res({ passthrough: true }) res: Response
  ): Promise<StreamableFile> {
    const userId = req.user.userId;

    // Obtener información del archivo
    const fileInfo = await this.exportService.getExportFile(exportId, userId);

    if (!fileInfo) {
      throw new NotFoundException(
        "Export not found, not completed, or not authorized"
      );
    }

    // Verificar que el archivo existe
    if (!fs.existsSync(fileInfo.filePath)) {
      throw new NotFoundException("Export file not found on disk");
    }

    // Configurar headers de respuesta
    res.set({
      "Content-Type": fileInfo.mimeType,
      "Content-Disposition": `attachment; filename="${fileInfo.fileName}"`,
      "Content-Length": fileInfo.fileSize,
    });

    // Crear stream del archivo
    const file = createReadStream(fileInfo.filePath);

    return new StreamableFile(file);
  }

  /**
   * GET /api/v1/reports/export/history
   * Obtener historial de exportaciones del usuario
   */
  @Get()
  @Permissions("reports:export")
  @ApiOperation({
    summary: "Historial de exportaciones",
    description:
      "Obtener el historial de exportaciones solicitadas por el usuario",
  })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: "Historial obtenido exitosamente",
  })
  async getUserExportHistory(
    @Req() req: any,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 20
  ): Promise<any> {
    const userId = req.user.userId;

    const query = new GetUserExportHistoryQuery(
      userId,
      Number(page),
      Number(limit)
    );

    return await this.queryBus.execute(query);
  }
}
