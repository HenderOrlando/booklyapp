/**
 * Compliance Report Entity
 * Entidad que representa un reporte de cumplimiento de reserva (RF-39)
 */
export class ComplianceReportEntity {
  constructor(
    public readonly id: string,
    public readonly resourceId: string,
    public readonly resourceName: string,
    public readonly resourceType: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly totalReservations: number,
    public readonly checkedInReservations: number,
    public readonly noShowReservations: number,
    public readonly lateCheckIns: number,
    public readonly earlyCheckOuts: number,
    public readonly onTimeCheckIns: number,
    public readonly complianceRate: number,
    public readonly noShowRate: number,
    public readonly averageCheckInDelayMinutes: number,
    public readonly usersWithNoShow: Array<{
      userId: string;
      noShowCount: number;
    }>,
    public readonly complianceByDayOfWeek: Record<string, number>,
    public readonly complianceByHour: Record<string, number>,
    public readonly metadata?: Record<string, any>,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  /**
   * Verificar si la tasa de cumplimiento es aceptable (>= 80%)
   */
  isComplianceAcceptable(): boolean {
    return this.complianceRate >= 80;
  }

  /**
   * Obtener usuarios con mayor no-show
   */
  getTopNoShowUsers(limit: number = 5): Array<{
    userId: string;
    noShowCount: number;
  }> {
    return [...this.usersWithNoShow]
      .sort((a, b) => b.noShowCount - a.noShowCount)
      .slice(0, limit);
  }

  /**
   * Obtener día con peor cumplimiento
   */
  getWorstComplianceDay(): string | null {
    if (Object.keys(this.complianceByDayOfWeek).length === 0) return null;

    return Object.entries(this.complianceByDayOfWeek).reduce(
      (worst, [day, rate]) => {
        return rate < (this.complianceByDayOfWeek[worst] || 100)
          ? day
          : worst;
      },
      Object.keys(this.complianceByDayOfWeek)[0]
    );
  }
}
