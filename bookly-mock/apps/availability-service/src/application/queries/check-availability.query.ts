/**
 * Check Availability Query
 * Query para verificar disponibilidad de un recurso en un periodo
 */
export class CheckAvailabilityQuery {
  constructor(
    public readonly resourceId: string,
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {}
}
