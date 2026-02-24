import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ApprovalFlowEntity } from '@stockpile/domain/entities';
import { DeactivateApprovalFlowCommand } from "../commands";
import { ApprovalFlowService } from "../services";

const logger = createLogger("DeactivateApprovalFlowHandler");

/**
 * Deactivate Approval Flow Handler
 * Handler para desactivar un flujo de aprobación
 */
@CommandHandler(DeactivateApprovalFlowCommand)
export class DeactivateApprovalFlowHandler
  implements ICommandHandler<DeactivateApprovalFlowCommand>
{
  constructor(private readonly approvalFlowService: ApprovalFlowService) {}

  async execute(
    command: DeactivateApprovalFlowCommand
  ): Promise<ApprovalFlowEntity> {
    logger.info("Executing DeactivateApprovalFlowCommand", {
      flowId: command.flowId,
    });

    return await this.approvalFlowService.deactivateApprovalFlow({
      flowId: command.flowId,
      updatedBy: command.updatedBy,
    });
  }
}
