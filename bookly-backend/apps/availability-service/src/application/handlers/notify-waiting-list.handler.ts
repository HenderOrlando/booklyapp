import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { NotifyWaitingListCommand } from "../commands";
import { WaitingListService } from "../services/waiting-list.service";

@CommandHandler(NotifyWaitingListCommand)
export class NotifyWaitingListHandler
  implements ICommandHandler<NotifyWaitingListCommand>
{
  constructor(private readonly waitingListService: WaitingListService) {}

  async execute(command: NotifyWaitingListCommand): Promise<any> {
    return await this.waitingListService.notifyNextInLine(
      command.resourceId,
      command.availableFrom,
      command.availableUntil,
      command.notifyTop
    );
  }
}
