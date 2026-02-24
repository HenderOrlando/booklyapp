/**
 * Update Reservation Command
 * Command para actualizar una reserva existente
 */
export class UpdateReservationCommand {
  constructor(
    public readonly id: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly purpose?: string,
    public readonly participants?: {
      userId: string;
      name: string;
      email: string;
    }[],
    public readonly notes?: string,
    public readonly updatedBy?: string
  ) {}
}
