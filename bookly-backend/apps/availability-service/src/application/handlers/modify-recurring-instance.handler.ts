import { ModifyRecurringInstanceCommand } from "@availability/application/commands/modify-recurring-instance.command";
import { RecurringReservationService } from "@availability/application/services/recurring-reservation.service";
import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

const logger = createLogger("ModifyRecurringInstanceHandler");

/**
 * Modify Recurring Instance Handler
 * Handler para el comando de modificar instancia individual
 */
@CommandHandler(ModifyRecurringInstanceCommand)
export class ModifyRecurringInstanceHandler
  implements ICommandHandler<ModifyRecurringInstanceCommand>
{
  constructor(
    private readonly recurringReservationService: RecurringReservationService
  ) {}

  async execute(command: ModifyRecurringInstanceCommand): Promise<any> {
    logger.info("Executing ModifyRecurringInstanceCommand", {
      instanceId: command.dto.instanceId,
      userId: command.userId,
    });

    const result =
      await this.recurringReservationService.modifyRecurringInstance(
        command.dto,
        command.userId
      );

    logger.info("Recurring instance modified successfully", {
      instanceId: command.dto.instanceId,
      seriesId: result.seriesId,
    });

    return result;
  }
}
