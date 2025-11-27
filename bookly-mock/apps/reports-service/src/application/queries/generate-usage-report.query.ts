/**
 * Generate Usage Report Query
 * Query para generar un reporte de uso en tiempo real
 */
export class GenerateUsageReportQuery {
  constructor(
    public readonly resourceId: string,
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {}
}
