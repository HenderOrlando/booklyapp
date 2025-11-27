import { PreviewRecurringReservationDto } from "@availability/infrastructure/dtos";

/**
 * Query para preview de serie recurrente
 */
export class PreviewRecurringSeriesQuery {
  constructor(public readonly dto: PreviewRecurringReservationDto) {}
}
