import { ImportJobStatus } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ImportJobEntity } from '@resources/domain/entities/import-job.entity";
import { ImportJobRepository } from '@resources/infrastructure/repositories/import-job.repository";
import { StartAsyncImportCommand } from "../commands/start-async-import.command";
import { ImportResourcesHandler } from "./import-resources.handler";

/**
 * Handler para iniciar importación asíncrona
 */
@CommandHandler(StartAsyncImportCommand)
export class StartAsyncImportHandler
  implements ICommandHandler<StartAsyncImportCommand>
{
  private readonly logger = createLogger("StartAsyncImportHandler");

  constructor(
    private readonly importJobRepository: ImportJobRepository,
    private readonly importResourcesHandler: ImportResourcesHandler
  ) {}

  async execute(command: StartAsyncImportCommand): Promise<ImportJobEntity> {
    this.logger.info(`Starting async import: ${command.fileName}`);

    // Parse CSV para contar filas
    const rows = this.parseCSV(command.csvContent);

    // Crear job de importación
    const job = await this.importJobRepository.create({
      userId: command.userId,
      fileName: command.fileName,
      fileSize: command.fileSize,
      totalRows: rows.length,
      status: ImportJobStatus.PENDING,
      mode: command.mode,
      errors: [],
      resourceIds: [],
    });

    this.logger.info(`Import job created: ${job.id}`);

    // Procesar de forma asíncrona
    this.processImportAsync(
      job.id,
      command.csvContent,
      command.mode,
      command.skipErrors,
      command.userId
    ).catch((error) => {
      this.logger.error(`Async import failed for job ${job.id}`, error);
    });

    return job;
  }

  /**
   * Procesa la importación de forma asíncrona
   */
  private async processImportAsync(
    jobId: string,
    csvContent: string,
    mode: any,
    skipErrors: boolean,
    userId: string
  ): Promise<void> {
    try {
      // Actualizar job a PROCESSING
      await this.importJobRepository.update(jobId, {
        status: ImportJobStatus.PROCESSING,
        startedAt: new Date(),
      });

      // Ejecutar importación usando el handler existente
      const result = await this.importResourcesHandler.execute({
        csvContent,
        mode,
        skipErrors,
        userId,
      });

      // Actualizar job con resultados
      await this.importJobRepository.update(jobId, {
        status: ImportJobStatus.COMPLETED,
        processedRows: result.totalRows,
        successCount: result.successCount,
        errorCount: result.errorCount,
        errors: result.errors.map(
          (e) => `Fila ${e.row}${e.code ? ` (${e.code})` : ""}: ${e.error}`
        ),
        resourceIds: [], // No trackeable fácilmente sin modificar ImportResourcesHandler
        completedAt: new Date(),
      });

      this.logger.info(`Import job ${jobId} completed successfully`);

      // TODO: Enviar notificación por email si notifyOnComplete=true
    } catch (error) {
      this.logger.error(`Import job ${jobId} failed`, error);

      await this.importJobRepository.update(jobId, {
        status: ImportJobStatus.FAILED,
        errors: [error instanceof Error ? error.message : String(error)],
        completedAt: new Date(),
      });
    }
  }

  /**
   * Parse CSV content
   */
  private parseCSV(content: string): any[] {
    const lines = content.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("CSV must have at least a header and one data row");
    }

    return lines.slice(1); // Return all rows except header
  }
}
