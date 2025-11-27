/**
 * Check-In Reservation Command
 * Command para realizar check-in de una reserva
 */
export class CheckInReservationCommand {
  constructor(
    public readonly id: string,
    public readonly userId: string
  ) {}
}
