/**
 * Conflict Report Entity
 * Entidad que representa un reporte de conflictos de reserva (RF-38)
 */
export class ConflictReportEntity {
  constructor(
    public readonly id: string,
    public readonly resourceId: string,
    public readonly resourceName: string,
    public readonly resourceType: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly totalConflicts: number,
    public readonly resolvedConflicts: number,
    public readonly unresolvedConflicts: number,
    public readonly conflictTypesBreakdown: Record<string, number>,
    public readonly peakConflictPeriods: Array<{
      date: Date;
      hour: number;
      conflictCount: number;
    }>,
    public readonly averageResolutionTimeMinutes: number,
    public readonly resolutionMethodsBreakdown: Record<string, number>,
    public readonly affectedUsers: number,
    public readonly metadata?: Record<string, any>,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  /**
   * Obtener tasa de resolución de conflictos
   */
  getResolutionRate(): number {
    if (this.totalConflicts === 0) return 100;
    return (this.resolvedConflicts / this.totalConflicts) * 100;
  }

  /**
   * Obtener tipo de conflicto más frecuente
   */
  getTopConflictType(): string | null {
    if (Object.keys(this.conflictTypesBreakdown).length === 0) return null;

    return Object.entries(this.conflictTypesBreakdown).reduce(
      (max, [type, count]) => {
        return count > (this.conflictTypesBreakdown[max] || 0) ? type : max;
      },
      Object.keys(this.conflictTypesBreakdown)[0]
    );
  }

  /**
   * Obtener período con más conflictos
   */
  getPeakConflictPeriod(): {
    date: Date;
    hour: number;
    conflictCount: number;
  } | null {
    if (this.peakConflictPeriods.length === 0) return null;

    return this.peakConflictPeriods.reduce((max, period) => {
      return period.conflictCount > max.conflictCount ? period : max;
    }, this.peakConflictPeriods[0]);
  }
}
