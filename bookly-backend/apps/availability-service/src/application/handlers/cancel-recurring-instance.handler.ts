import { CancelRecurringInstanceCommand } from "@availability/application/commands/cancel-recurring-instance.command";
import { RecurringReservationService } from "@availability/application/services/recurring-reservation.service";
import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

const logger = createLogger("CancelRecurringInstanceHandler");

/**
 * Cancel Recurring Instance Handler
 * Handler para el comando de cancelar instancia individual
 */
@CommandHandler(CancelRecurringInstanceCommand)
export class CancelRecurringInstanceHandler
  implements ICommandHandler<CancelRecurringInstanceCommand>
{
  constructor(
    private readonly recurringReservationService: RecurringReservationService
  ) {}

  async execute(command: CancelRecurringInstanceCommand): Promise<any> {
    logger.info("Executing CancelRecurringInstanceCommand", {
      instanceId: command.dto.instanceId,
      userId: command.userId,
    });

    const result =
      await this.recurringReservationService.cancelRecurringInstance(
        command.dto,
        command.userId
      );

    logger.info("Recurring instance cancelled successfully", {
      instanceId: command.dto.instanceId,
      seriesId: result.seriesId,
    });

    return result;
  }
}
