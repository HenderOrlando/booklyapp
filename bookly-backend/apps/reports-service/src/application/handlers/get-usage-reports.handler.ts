import { createLogger } from "@libs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetUsageReportsQuery } from "../queries";
import { UsageReportService } from "../services";

const logger = createLogger("GetUsageReportsHandler");

@QueryHandler(GetUsageReportsQuery)
export class GetUsageReportsHandler
  implements IQueryHandler<GetUsageReportsQuery>
{
  constructor(private readonly usageReportService: UsageReportService) {}

  async execute(query: GetUsageReportsQuery): Promise<any> {
    logger.info("Executing GetUsageReportsQuery");
    return await this.usageReportService.getUsageReports(
      query.pagination,
      query.filters
    );
  }
}
