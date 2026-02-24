import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CancelReservationCommand } from "../commands/cancel-reservation.command";
import { ReservationService } from "../services/reservation.service";

const logger = createLogger("CancelReservationHandler");

/**
 * Cancel Reservation Handler
 * Handler para el comando de cancelar reserva
 */
@CommandHandler(CancelReservationCommand)
export class CancelReservationHandler
  implements ICommandHandler<CancelReservationCommand>
{
  constructor(private readonly reservationService: ReservationService) {}

  async execute(command: CancelReservationCommand): Promise<any> {
    logger.info("Executing CancelReservationCommand", {
      reservationId: command.id,
    });

    const reservation = await this.reservationService.cancelReservation(
      command.id,
      command.cancelledBy,
      command.cancellationReason
    );

    logger.info("Reservation cancelled successfully", {
      reservationId: reservation.id,
    });

    return reservation;
  }
}
