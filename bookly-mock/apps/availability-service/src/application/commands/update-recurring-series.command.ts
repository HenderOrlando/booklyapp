import { UpdateRecurringSeriesDto } from "@availability/infrastructure/dtos";

/**
 * Update Recurring Series Command
 * Command para actualizar una serie recurrente completa o instancias futuras
 */
export class UpdateRecurringSeriesCommand {
  constructor(
    public readonly seriesId: string,
    public readonly dto: UpdateRecurringSeriesDto,
    public readonly userId: string
  ) {}
}
