import { CancelInstanceDto } from "@availability/infrastructure/dtos";

/**
 * Cancel Recurring Instance Command
 * Command para cancelar una instancia individual de una serie recurrente
 */
export class CancelRecurringInstanceCommand {
  constructor(
    public readonly dto: CancelInstanceDto,
    public readonly userId: string
  ) {}
}
