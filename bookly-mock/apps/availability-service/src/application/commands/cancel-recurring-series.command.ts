import { CancelRecurringSeriesDto } from "@availability/infrastructure/dtos";

/**
 * Cancel Recurring Series Command
 * Command para cancelar una serie recurrente completa o instancias futuras
 */
export class CancelRecurringSeriesCommand {
  constructor(
    public readonly seriesId: string,
    public readonly dto: CancelRecurringSeriesDto,
    public readonly userId: string
  ) {}
}
