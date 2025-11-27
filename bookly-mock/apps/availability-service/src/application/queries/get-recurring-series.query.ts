/**
 * Get Recurring Series Query
 * Query para obtener una serie recurrente por su ID con todas sus instancias
 */
export class GetRecurringSeriesQuery {
  constructor(
    public readonly seriesId: string,
    public readonly includeInstances: boolean = true
  ) {}
}
