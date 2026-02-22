import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ApprovalFlowEntity } from "@stockpile/domain/entities";
import { ActivateApprovalFlowCommand } from "../commands/activate-approval-flow.command";
import { ApprovalFlowService } from "../services";

const logger = createLogger("ActivateApprovalFlowHandler");

/**
 * Activate Approval Flow Handler
 * Handler para activar un flujo de aprobación desactivado
 */
@CommandHandler(ActivateApprovalFlowCommand)
export class ActivateApprovalFlowHandler
  implements ICommandHandler<ActivateApprovalFlowCommand>
{
  constructor(private readonly approvalFlowService: ApprovalFlowService) {}

  async execute(
    command: ActivateApprovalFlowCommand,
  ): Promise<ApprovalFlowEntity> {
    logger.info("Executing ActivateApprovalFlowCommand", {
      flowId: command.flowId,
    });

    return await this.approvalFlowService.activateApprovalFlow({
      flowId: command.flowId,
      updatedBy: command.updatedBy,
    });
  }
}
