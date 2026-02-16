import { createLogger } from "@libs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetComplianceReportsQuery } from "../queries/get-compliance-reports.query";
import { ComplianceReportService } from "../services/compliance-report.service";

const logger = createLogger("GetComplianceReportsHandler");

/**
 * Handler para obtener reportes de cumplimiento (RF-39)
 */
@QueryHandler(GetComplianceReportsQuery)
export class GetComplianceReportsHandler
  implements IQueryHandler<GetComplianceReportsQuery>
{
  constructor(
    private readonly complianceReportService: ComplianceReportService
  ) {}

  async execute(query: GetComplianceReportsQuery): Promise<any> {
    logger.info("Executing GetComplianceReportsQuery");
    return await this.complianceReportService.getComplianceReports(
      query.pagination,
      query.filters
    );
  }
}
