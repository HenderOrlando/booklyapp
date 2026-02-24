/**
 * Demand Report Entity
 * Entidad que representa un reporte de demanda insatisfecha
 */
export class DemandReportEntity {
  constructor(
    public readonly id: string,
    public readonly resourceType: string,
    public readonly programId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly totalDenials: number,
    public readonly reasonsBreakdown: Record<string, number>,
    public readonly peakDemandPeriods: Array<{
      date: Date;
      hour: number;
      denialCount: number;
    }>,
    public readonly alternativeResourcesSuggested: Record<string, number>,
    public readonly waitingListEntries: number,
    public readonly averageWaitTime: number,
    public readonly metadata?: Record<string, any>,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  /**
   * Obtener tasa de demanda insatisfecha
   */
  getUnsatisfiedDemandRate(totalAttempts: number): number {
    if (totalAttempts === 0) return 0;
    return (this.totalDenials / totalAttempts) * 100;
  }

  /**
   * Obtener razón principal de negación
   */
  getTopDenialReason(): string | null {
    if (Object.keys(this.reasonsBreakdown).length === 0) return null;

    return Object.entries(this.reasonsBreakdown).reduce(
      (max, [reason, count]) => {
        return count > (this.reasonsBreakdown[max] || 0) ? reason : max;
      },
      Object.keys(this.reasonsBreakdown)[0]
    );
  }

  /**
   * Obtener período de mayor demanda
   */
  getPeakDemandPeriod(): {
    date: Date;
    hour: number;
    denialCount: number;
  } | null {
    if (this.peakDemandPeriods.length === 0) return null;

    return this.peakDemandPeriods.reduce((max, period) => {
      return period.denialCount > max.denialCount ? period : max;
    }, this.peakDemandPeriods[0]);
  }
}
