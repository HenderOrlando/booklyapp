import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ApprovalFlowEntity } from '@stockpile/domain/entities";
import { CreateApprovalFlowCommand } from "../commands";
import { ApprovalFlowService } from "../services";

const logger = createLogger("CreateApprovalFlowHandler");

/**
 * Create Approval Flow Handler
 * Handler para crear un nuevo flujo de aprobación
 */
@CommandHandler(CreateApprovalFlowCommand)
export class CreateApprovalFlowHandler
  implements ICommandHandler<CreateApprovalFlowCommand>
{
  constructor(private readonly approvalFlowService: ApprovalFlowService) {}

  async execute(
    command: CreateApprovalFlowCommand
  ): Promise<ApprovalFlowEntity> {
    logger.info("Executing CreateApprovalFlowCommand", {
      name: command.name,
    });

    return await this.approvalFlowService.createApprovalFlow({
      name: command.name,
      description: command.description,
      resourceTypes: command.resourceTypes,
      steps: command.steps,
      autoApproveConditions: command.autoApproveConditions,
      createdBy: command.createdBy,
    });
  }
}
