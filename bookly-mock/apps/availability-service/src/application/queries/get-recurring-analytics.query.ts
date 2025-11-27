import { RecurringAnalyticsFiltersDto } from "@availability/infrastructure/dtos";

/**
 * Query para obtener analytics de series recurrentes
 */
export class GetRecurringAnalyticsQuery {
  constructor(public readonly filters: RecurringAnalyticsFiltersDto) {}
}
