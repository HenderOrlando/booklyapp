import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { AcceptWaitingListOfferCommand } from "../commands";
import { WaitingListService } from "../services/waiting-list.service";

@CommandHandler(AcceptWaitingListOfferCommand)
export class AcceptWaitingListOfferHandler
  implements ICommandHandler<AcceptWaitingListOfferCommand>
{
  constructor(private readonly waitingListService: WaitingListService) {}

  async execute(command: AcceptWaitingListOfferCommand): Promise<any> {
    return await this.waitingListService.acceptOffer(
      command.id,
      command.userId
    );
  }
}
