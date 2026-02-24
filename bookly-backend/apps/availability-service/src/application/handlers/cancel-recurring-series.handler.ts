import { CancelRecurringSeriesCommand } from "@availability/application/commands/cancel-recurring-series.command";
import { RecurringReservationService } from "@availability/application/services/recurring-reservation.service";
import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";

const logger = createLogger("CancelRecurringSeriesHandler");

/**
 * Cancel Recurring Series Handler
 * Handler para el comando de cancelar serie recurrente
 */
@CommandHandler(CancelRecurringSeriesCommand)
export class CancelRecurringSeriesHandler
  implements ICommandHandler<CancelRecurringSeriesCommand>
{
  constructor(
    private readonly recurringReservationService: RecurringReservationService
  ) {}

  async execute(command: CancelRecurringSeriesCommand): Promise<any> {
    logger.info("Executing CancelRecurringSeriesCommand", {
      seriesId: command.seriesId,
      userId: command.userId,
    });

    const result = await this.recurringReservationService.cancelRecurringSeries(
      command.seriesId,
      command.dto,
      command.userId
    );

    logger.info("Recurring series cancelled successfully", {
      seriesId: command.seriesId,
      cancelledInstances: result.cancelledInstances,
    });

    return result;
  }
}
