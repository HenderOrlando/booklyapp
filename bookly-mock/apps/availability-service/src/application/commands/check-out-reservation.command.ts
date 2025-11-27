/**
 * Check-Out Reservation Command
 * Command para realizar check-out de una reserva
 */
export class CheckOutReservationCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string
  ) {}
}
