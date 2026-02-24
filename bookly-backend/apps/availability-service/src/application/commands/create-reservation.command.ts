/**
 * Create Reservation Command
 * Command para crear una nueva reserva
 */
export class CreateReservationCommand {
  constructor(
    public readonly resourceId: string,
    public readonly userId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly purpose: string,
    public readonly isRecurring?: boolean,
    public readonly recurringPattern?: {
      frequency: "daily" | "weekly" | "monthly";
      interval: number;
      endDate?: Date;
      daysOfWeek?: number[];
    },
    public readonly participants?: {
      userId: string;
      name: string;
      email: string;
    }[],
    public readonly notes?: string,
    public readonly externalCalendarId?: string,
    public readonly externalCalendarEventId?: string,
    public readonly createdBy?: string
  ) {}
}
