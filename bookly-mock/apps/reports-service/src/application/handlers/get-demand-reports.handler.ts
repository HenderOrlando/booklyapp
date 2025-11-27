import { createLogger } from "@libs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetDemandReportsQuery } from "../queries";
import { DemandReportService } from "../services";

const logger = createLogger("GetDemandReportsHandler");

@QueryHandler(GetDemandReportsQuery)
export class GetDemandReportsHandler
  implements IQueryHandler<GetDemandReportsQuery>
{
  constructor(private readonly demandReportService: DemandReportService) {}

  async execute(query: GetDemandReportsQuery): Promise<any> {
    logger.info("Executing GetDemandReportsQuery");
    return await this.demandReportService.getDemandReports(
      query.pagination,
      query.filters
    );
  }
}
