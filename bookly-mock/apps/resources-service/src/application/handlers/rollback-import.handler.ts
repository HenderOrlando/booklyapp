import { ImportJobStatus } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { RollbackResultDto } from "../../infrastructure/dto/import-advanced.dto";
import { ImportJobRepository } from "../../infrastructure/repositories/import-job.repository";
import { ResourceRepository } from "../../infrastructure/repositories/resource.repository";
import { RollbackImportCommand } from "../commands/rollback-import.command";

/**
 * Handler para revertir una importación
 */
@CommandHandler(RollbackImportCommand)
export class RollbackImportHandler
  implements ICommandHandler<RollbackImportCommand>
{
  private readonly logger = createLogger("RollbackImportHandler");

  constructor(
    private readonly importJobRepository: ImportJobRepository,
    private readonly resourceRepository: ResourceRepository
  ) {}

  async execute(command: RollbackImportCommand): Promise<RollbackResultDto> {
    this.logger.info(`Rolling back import job ${command.jobId}`);

    // Buscar el job
    const job = await this.importJobRepository.findById(command.jobId);

    if (!job) {
      throw new Error(`Import job ${command.jobId} not found`);
    }

    // Verificar permisos (solo el dueño puede hacer rollback)
    if (job.userId !== command.userId) {
      throw new Error("You don't have permission to rollback this import");
    }

    // Verificar que el job esté completo
    if (job.status !== ImportJobStatus.COMPLETED) {
      throw new Error(
        "Only completed imports can be rolled back. Current status: " +
          job.status
      );
    }

    const deletedIds: string[] = [];
    let deletedCount = 0;

    try {
      // Eliminar recursos creados
      for (const resourceId of job.resourceIds) {
        try {
          await this.resourceRepository.delete(resourceId);
          deletedIds.push(resourceId);
          deletedCount++;
        } catch (error) {
          this.logger.warn(`Failed to delete resource ${resourceId}`, error);
        }
      }

      // Marcar job como revertido
      job.rollback();
      await this.importJobRepository.update(command.jobId, {
        status: ImportJobStatus.ROLLED_BACK,
        resourceIds: [],
      });

      this.logger.info(`Rollback completed: ${deletedCount} resources deleted`);

      return {
        jobId: command.jobId,
        deletedCount,
        deletedResourceIds: deletedIds,
        success: true,
      };
    } catch (error) {
      this.logger.error(`Rollback failed for job ${command.jobId}`, error);
      throw error;
    }
  }
}
