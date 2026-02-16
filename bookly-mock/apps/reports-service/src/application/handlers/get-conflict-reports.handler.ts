import { createLogger } from "@libs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetConflictReportsQuery } from "../queries/get-conflict-reports.query";
import { ConflictReportService } from "../services/conflict-report.service";

const logger = createLogger("GetConflictReportsHandler");

/**
 * Handler para obtener reportes de conflictos (RF-38)
 */
@QueryHandler(GetConflictReportsQuery)
export class GetConflictReportsHandler
  implements IQueryHandler<GetConflictReportsQuery>
{
  constructor(
    private readonly conflictReportService: ConflictReportService
  ) {}

  async execute(query: GetConflictReportsQuery): Promise<any> {
    logger.info("Executing GetConflictReportsQuery");
    return await this.conflictReportService.getConflictReports(
      query.pagination,
      query.filters
    );
  }
}
