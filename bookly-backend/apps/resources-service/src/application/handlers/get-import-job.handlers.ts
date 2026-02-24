import { createLogger } from "@libs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ImportJobEntity } from '@resources/domain/entities/import-job.entity';
import { ImportJobRepository } from '@resources/infrastructure/repositories/import-job.repository';
import {
  GetImportJobQuery,
  GetUserImportJobsQuery,
} from "../queries/get-import-job.query";

/**
 * Handler para obtener un job de importación por ID
 */
@QueryHandler(GetImportJobQuery)
export class GetImportJobHandler implements IQueryHandler<GetImportJobQuery> {
  private readonly logger = createLogger("GetImportJobHandler");

  constructor(private readonly importJobRepository: ImportJobRepository) {}

  async execute(query: GetImportJobQuery): Promise<ImportJobEntity | null> {
    this.logger.info(`Getting import job ${query.jobId}`);

    const job = await this.importJobRepository.findById(query.jobId);

    if (!job) {
      return null;
    }

    // Verificar permisos (solo el dueño puede ver el job)
    if (job.userId !== query.userId) {
      throw new Error("You don't have permission to view this import job");
    }

    return job;
  }
}

/**
 * Handler para listar jobs de importación de un usuario
 */
@QueryHandler(GetUserImportJobsQuery)
export class GetUserImportJobsHandler
  implements IQueryHandler<GetUserImportJobsQuery>
{
  private readonly logger = createLogger("GetUserImportJobsHandler");

  constructor(private readonly importJobRepository: ImportJobRepository) {}

  async execute(query: GetUserImportJobsQuery): Promise<ImportJobEntity[]> {
    this.logger.info(`Getting import jobs for user ${query.userId}`);

    return await this.importJobRepository.findByUserId(
      query.userId,
      query.limit
    );
  }
}
