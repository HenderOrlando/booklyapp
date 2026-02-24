import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UpdateWaitingListPriorityCommand } from "../commands";
import { WaitingListService } from "../services/waiting-list.service";

@CommandHandler(UpdateWaitingListPriorityCommand)
export class UpdateWaitingListPriorityHandler
  implements ICommandHandler<UpdateWaitingListPriorityCommand>
{
  constructor(private readonly waitingListService: WaitingListService) {}

  async execute(command: UpdateWaitingListPriorityCommand): Promise<any> {
    return await this.waitingListService.updatePriority(
      command.id,
      command.priority,
      command.reason
    );
  }
}
