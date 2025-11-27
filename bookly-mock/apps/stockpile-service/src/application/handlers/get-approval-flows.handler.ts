import { PaginationMeta } from "@libs/common";
import { createLogger } from "@libs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ApprovalFlowEntity } from "../../domain/entities";
import { GetApprovalFlowsQuery } from "../queries";
import { ApprovalFlowService } from "../services";

const logger = createLogger("GetApprovalFlowsHandler");

/**
 * Get Approval Flows Handler
 * Handler para obtener flujos de aprobación con filtros
 */
@QueryHandler(GetApprovalFlowsQuery)
export class GetApprovalFlowsHandler
  implements IQueryHandler<GetApprovalFlowsQuery>
{
  constructor(private readonly approvalFlowService: ApprovalFlowService) {}

  async execute(query: GetApprovalFlowsQuery): Promise<{
    flows: ApprovalFlowEntity[];
    meta: PaginationMeta;
  }> {
    logger.info("Executing GetApprovalFlowsQuery", {
      filters: query.filters,
    });

    return await this.approvalFlowService.getApprovalFlows(
      query.pagination,
      query.filters
    );
  }
}
