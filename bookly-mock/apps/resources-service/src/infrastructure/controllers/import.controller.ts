import { ResponseUtil } from "@libs/common";
import { CurrentUser } from "@libs/decorators";
import { JwtAuthGuard } from "@libs/guards";
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import {
  RollbackImportCommand,
  StartAsyncImportCommand,
  ValidateImportCommand,
} from '@resources/application/commands';
import {
  GenerateImportTemplateQuery,
  GetImportJobQuery,
  GetUserImportJobsQuery,
} from '@resources/application/queries';
import { ImportJobEntity } from '@resources/domain/entities/import-job.entity';
import {
  GenerateTemplateDto,
  ImportJobDto,
  RollbackImportDto,
  RollbackResultDto,
  StartAsyncImportDto,
  ValidateImportDto,
  ValidationResultDto,
} from "../dto";

/**
 * Import Controller
 * Controlador para funcionalidades avanzadas de importación
 */
@ApiTags("Import")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("import")
export class ImportController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  /**
   * Valida un CSV sin importarlo (dry-run)
   */
  @Post("validate")
  @ApiOperation({
    summary: "Validar CSV sin importar (dry-run)",
    description:
      "Verifica la estructura y datos del CSV sin crear recursos, útil para detectar errores antes de importar",
  })
  async validateImport(
    @Body() validateDto: ValidateImportDto,
    @CurrentUser("sub") userId: string
  ) {
    const command = new ValidateImportCommand(
      validateDto.csvContent,
      validateDto.mode,
      userId
    );

    const result = await this.commandBus.execute<
      ValidateImportCommand,
      ValidationResultDto
    >(command);

    return ResponseUtil.success(
      result,
      result.isValid ? "CSV válido" : `CSV con ${result.invalidRows} errores`
    );
  }

  /**
   * Inicia una importación asíncrona
   */
  @Post("async")
  @ApiOperation({
    summary: "Iniciar importación asíncrona",
    description:
      "Para archivos grandes (>1000 filas), procesa en background y retorna un job ID para trackear progreso",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Archivo CSV a importar",
        },
        mode: {
          type: "string",
          enum: ["CREATE", "UPDATE", "UPSERT"],
          default: "CREATE",
        },
        skipErrors: {
          type: "boolean",
          default: false,
        },
        notifyOnComplete: {
          type: "boolean",
          default: true,
        },
      },
      required: ["file"],
    },
  })
  @UseInterceptors(FileInterceptor("file"))
  async startAsyncImport(
    @UploadedFile() file: any,
    @Body() importDto: StartAsyncImportDto,
    @CurrentUser("sub") userId: string
  ) {
    if (!file) {
      throw new Error("No file uploaded");
    }

    const csvContent = file.buffer.toString("utf-8");

    const command = new StartAsyncImportCommand(
      file.originalname,
      file.size,
      csvContent,
      importDto.mode,
      importDto.skipErrors,
      importDto.notifyOnComplete,
      userId
    );

    const job = await this.commandBus.execute<
      StartAsyncImportCommand,
      ImportJobEntity
    >(command);

    return ResponseUtil.success(this.mapJobToDto(job), "Import job started");
  }

  /**
   * Obtiene el estado de un job de importación
   */
  @Get("jobs/:id")
  @ApiOperation({
    summary: "Obtener estado de importación",
    description: "Consulta el progreso y resultado de un job de importación",
  })
  async getImportJob(
    @Param("id") jobId: string,
    @CurrentUser("sub") userId: string
  ) {
    const query = new GetImportJobQuery(jobId, userId);

    const job = await this.queryBus.execute<
      GetImportJobQuery,
      ImportJobEntity | null
    >(query);

    if (!job) {
      return ResponseUtil.success(null, "Import job not found");
    }

    return ResponseUtil.success(this.mapJobToDto(job), "Import job retrieved");
  }

  /**
   * Lista jobs de importación del usuario
   */
  @Get("jobs")
  @ApiOperation({
    summary: "Listar mis importaciones",
    description: "Obtiene el historial de importaciones del usuario actual",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Máximo de resultados (default: 20)",
  })
  async getUserImportJobs(
    @Query("limit") limit: number = 20,
    @CurrentUser("sub") userId: string
  ) {
    const query = new GetUserImportJobsQuery(userId, limit);

    const jobs = await this.queryBus.execute<
      GetUserImportJobsQuery,
      ImportJobEntity[]
    >(query);

    return ResponseUtil.success(
      jobs.map((j) => this.mapJobToDto(j)),
      `${jobs.length} import jobs retrieved`
    );
  }

  /**
   * Revierte una importación
   */
  @Post("rollback")
  @ApiOperation({
    summary: "Revertir importación",
    description:
      "Elimina todos los recursos creados en una importación completada",
  })
  async rollbackImport(
    @Body() rollbackDto: RollbackImportDto,
    @CurrentUser("sub") userId: string
  ) {
    const command = new RollbackImportCommand(
      rollbackDto.jobId,
      rollbackDto.reason,
      userId
    );

    const result = await this.commandBus.execute<
      RollbackImportCommand,
      RollbackResultDto
    >(command);

    return ResponseUtil.success(
      result,
      `Rollback completed: ${result.deletedCount} resources deleted`
    );
  }

  /**
   * Genera template CSV dinámico
   */
  @Get("template")
  @ApiOperation({
    summary: "Generar template CSV",
    description:
      "Genera un archivo CSV con headers y ejemplos basados en las categorías existentes",
  })
  @ApiQuery({
    name: "includeExamples",
    required: false,
    type: Boolean,
    description: "Incluir filas de ejemplo (default: true)",
  })
  @ApiQuery({
    name: "categoryCode",
    required: false,
    type: String,
    description: "Generar template para una categoría específica",
  })
  async generateTemplate(@Query() query: GenerateTemplateDto) {
    const templateQuery = new GenerateImportTemplateQuery(
      query.includeExamples ?? true,
      query.categoryCode
    );

    const csvContent = await this.queryBus.execute<
      GenerateImportTemplateQuery,
      string
    >(templateQuery);

    return ResponseUtil.success(csvContent, "Template generated");
  }

  /**
   * Mapea ImportJobEntity a DTO
   */
  private mapJobToDto(job: ImportJobEntity): ImportJobDto {
    return {
      id: job.id,
      userId: job.userId,
      fileName: job.fileName,
      fileSize: job.fileSize,
      totalRows: job.totalRows,
      processedRows: job.processedRows,
      successCount: job.successCount,
      errorCount: job.errorCount,
      status: job.status,
      mode: job.mode,
      progress: job.getProgressPercentage(),
      errors: job.errors,
      resourceIds: job.resourceIds,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
      createdAt: job.createdAt,
    };
  }
}
