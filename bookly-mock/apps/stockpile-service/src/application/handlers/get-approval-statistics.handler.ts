import { createLogger } from "@libs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetApprovalStatisticsQuery } from "../queries";
import { ApprovalRequestService } from "../services";

const logger = createLogger("GetApprovalStatisticsHandler");

/**
 * Get Approval Statistics Handler
 * Handler para obtener estadísticas de aprobaciones
 */
@QueryHandler(GetApprovalStatisticsQuery)
export class GetApprovalStatisticsHandler
  implements IQueryHandler<GetApprovalStatisticsQuery>
{
  constructor(
    private readonly approvalRequestService: ApprovalRequestService
  ) {}

  async execute(query: GetApprovalStatisticsQuery): Promise<{
    total: number;
    approved: number;
    rejected: number;
    pending: number;
    averageApprovalTime: number;
  }> {
    logger.info("Executing GetApprovalStatisticsQuery", {
      filters: query.filters,
    });

    return await this.approvalRequestService.getStatistics(query.filters);
  }
}
