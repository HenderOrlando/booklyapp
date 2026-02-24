import { WeekDay } from "@libs/common/enums";

/**
 * Create Availability Command
 * Command para crear una nueva disponibilidad
 */
export class CreateAvailabilityCommand {
  constructor(
    public readonly resourceId: string,
    public readonly dayOfWeek: WeekDay,
    public readonly startTime: string,
    public readonly endTime: string,
    public readonly isAvailable?: boolean,
    public readonly maxConcurrentReservations?: number,
    public readonly effectiveFrom?: Date,
    public readonly effectiveUntil?: Date,
    public readonly notes?: string,
    public readonly createdBy?: string
  ) {}
}
