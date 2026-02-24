import { createLogger } from "@libs/common";
import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { CheckOutReservationCommand } from "../commands/check-out-reservation.command";
import { ReservationService } from "../services/reservation.service";

const logger = createLogger("CheckOutReservationHandler");

/**
 * Check-Out Reservation Handler
 * Handler para el comando de check-out de reserva
 */
@CommandHandler(CheckOutReservationCommand)
export class CheckOutReservationHandler
  implements ICommandHandler<CheckOutReservationCommand>
{
  constructor(private readonly reservationService: ReservationService) {}

  async execute(command: CheckOutReservationCommand): Promise<any> {
    logger.info("Executing CheckOutReservationCommand", {
      reservationId: command.id,
      userId: command.userId,
    });

    const reservation = await this.reservationService.checkOut(command.id);

    logger.info("Check-out successful", {
      reservationId: reservation.id,
    });

    return reservation;
  }
}
