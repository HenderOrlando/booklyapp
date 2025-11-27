import { createLogger } from "@libs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetUserReportsQuery } from "../queries";
import { UserReportService } from "../services";

const logger = createLogger("GetUserReportsHandler");

@QueryHandler(GetUserReportsQuery)
export class GetUserReportsHandler
  implements IQueryHandler<GetUserReportsQuery>
{
  constructor(private readonly userReportService: UserReportService) {}

  async execute(query: GetUserReportsQuery): Promise<any> {
    logger.info("Executing GetUserReportsQuery");
    return await this.userReportService.getUserReports(
      query.pagination,
      query.filters
    );
  }
}
