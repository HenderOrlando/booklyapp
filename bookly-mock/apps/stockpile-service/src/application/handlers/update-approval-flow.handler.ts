import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ApprovalFlowEntity } from "../../domain/entities";
import { UpdateApprovalFlowCommand } from "../commands";
import { ApprovalFlowService } from "../services";

const logger = createLogger("UpdateApprovalFlowHandler");

/**
 * Update Approval Flow Handler
 * Handler para actualizar un flujo de aprobación
 */
@CommandHandler(UpdateApprovalFlowCommand)
export class UpdateApprovalFlowHandler
  implements ICommandHandler<UpdateApprovalFlowCommand>
{
  constructor(private readonly approvalFlowService: ApprovalFlowService) {}

  async execute(
    command: UpdateApprovalFlowCommand
  ): Promise<ApprovalFlowEntity> {
    logger.info("Executing UpdateApprovalFlowCommand", {
      flowId: command.flowId,
    });

    return await this.approvalFlowService.updateApprovalFlow({
      flowId: command.flowId,
      name: command.name,
      description: command.description,
      resourceTypes: command.resourceTypes,
      steps: command.steps,
      autoApproveConditions: command.autoApproveConditions,
      updatedBy: command.updatedBy,
    });
  }
}
