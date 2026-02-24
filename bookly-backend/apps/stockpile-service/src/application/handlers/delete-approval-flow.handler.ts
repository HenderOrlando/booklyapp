import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { DeleteApprovalFlowCommand } from "../commands/delete-approval-flow.command";
import { ApprovalFlowService } from "../services";

const logger = createLogger("DeleteApprovalFlowHandler");

/**
 * Delete Approval Flow Handler
 * Handler para eliminar permanentemente un flujo de aprobación
 */
@CommandHandler(DeleteApprovalFlowCommand)
export class DeleteApprovalFlowHandler
  implements ICommandHandler<DeleteApprovalFlowCommand>
{
  constructor(private readonly approvalFlowService: ApprovalFlowService) {}

  async execute(command: DeleteApprovalFlowCommand): Promise<boolean> {
    logger.info("Executing DeleteApprovalFlowCommand", {
      flowId: command.flowId,
    });

    return await this.approvalFlowService.deleteApprovalFlow(command.flowId);
  }
}
