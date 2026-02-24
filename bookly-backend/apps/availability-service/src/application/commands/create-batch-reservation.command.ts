/**
 * Create Batch Reservation Command (RF-19)
 * Command para crear reservas múltiples de forma atómica
 */
export class CreateBatchReservationCommand {
  constructor(
    public readonly userId: string,
    public readonly reservations: Array<{
      resourceId: string;
      startDate: Date;
      endDate: Date;
      purpose: string;
      notes?: string;
    }>,
    public readonly failOnConflict: boolean = true,
    public readonly createdBy?: string
  ) {}
}
