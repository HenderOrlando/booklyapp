/**
 * Usage Report Entity
 * Entidad que representa un reporte de uso de recursos
 */
export class UsageReportEntity {
  constructor(
    public readonly id: string,
    public readonly resourceId: string,
    public readonly resourceName: string,
    public readonly resourceType: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly totalReservations: number,
    public readonly confirmedReservations: number,
    public readonly cancelledReservations: number,
    public readonly noShowReservations: number,
    public readonly totalHoursReserved: number,
    public readonly totalHoursUsed: number,
    public readonly occupancyRate: number,
    public readonly averageSessionDuration: number,
    public readonly peakUsageHours: string[],
    public readonly programsBreakdown: Record<string, number>,
    public readonly metadata?: Record<string, any>,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  /**
   * Calcular tasa de utilización
   */
  getUtilizationRate(): number {
    if (this.totalHoursReserved === 0) return 0;
    return (this.totalHoursUsed / this.totalHoursReserved) * 100;
  }

  /**
   * Calcular tasa de cancelación
   */
  getCancellationRate(): number {
    if (this.totalReservations === 0) return 0;
    return (this.cancelledReservations / this.totalReservations) * 100;
  }

  /**
   * Calcular tasa de no-show
   */
  getNoShowRate(): number {
    if (this.totalReservations === 0) return 0;
    return (this.noShowReservations / this.totalReservations) * 100;
  }

  /**
   * Verificar si el reporte es reciente
   */
  isRecent(daysThreshold: number = 7): boolean {
    if (!this.createdAt) return false;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= daysThreshold;
  }
}
