import { createLogger } from "@libs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { ApprovalFlowEntity } from '@stockpile/domain/entities";
import { GetApprovalFlowByIdQuery } from "../queries";
import { ApprovalFlowService } from "../services";

const logger = createLogger("GetApprovalFlowByIdHandler");

/**
 * Get Approval Flow By Id Handler
 * Handler para obtener un flujo de aprobación por ID
 */
@QueryHandler(GetApprovalFlowByIdQuery)
export class GetApprovalFlowByIdHandler
  implements IQueryHandler<GetApprovalFlowByIdQuery>
{
  constructor(private readonly approvalFlowService: ApprovalFlowService) {}

  async execute(query: GetApprovalFlowByIdQuery): Promise<ApprovalFlowEntity> {
    logger.info("Executing GetApprovalFlowByIdQuery", {
      flowId: query.flowId,
    });

    return await this.approvalFlowService.getApprovalFlowById(query.flowId);
  }
}
