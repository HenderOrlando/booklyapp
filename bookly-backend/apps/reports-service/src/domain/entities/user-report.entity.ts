/**
 * User Report Entity
 * Entidad que representa un reporte de actividad por usuario
 */
export class UserReportEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly userName: string,
    public readonly userType: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly totalReservations: number,
    public readonly confirmedReservations: number,
    public readonly cancelledReservations: number,
    public readonly noShowCount: number,
    public readonly totalHoursReserved: number,
    public readonly resourceTypesUsed: Record<string, number>,
    public readonly favoriteResources: Array<{
      resourceId: string;
      resourceName: string;
      usageCount: number;
    }>,
    public readonly peakUsageDays: string[],
    public readonly averageAdvanceBooking: number,
    public readonly penaltiesCount: number,
    public readonly feedbackSubmitted: number,
    public readonly metadata?: Record<string, any>,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  /**
   * Calcular tasa de asistencia
   */
  getAttendanceRate(): number {
    if (this.confirmedReservations === 0) return 0;
    const attended = this.confirmedReservations - this.noShowCount;
    return (attended / this.confirmedReservations) * 100;
  }

  /**
   * Calcular tasa de cancelación
   */
  getCancellationRate(): number {
    if (this.totalReservations === 0) return 0;
    return (this.cancelledReservations / this.totalReservations) * 100;
  }

  /**
   * Obtener recurso más usado
   */
  getMostUsedResource(): {
    resourceId: string;
    resourceName: string;
    usageCount: number;
  } | null {
    if (this.favoriteResources.length === 0) return null;

    return this.favoriteResources.reduce((max, resource) => {
      return resource.usageCount > max.usageCount ? resource : max;
    }, this.favoriteResources[0]);
  }

  /**
   * Verificar si el usuario es confiable
   */
  isReliableUser(): boolean {
    return this.getAttendanceRate() >= 90 && this.getCancellationRate() <= 10;
  }

  /**
   * Verificar si el usuario tiene penalizaciones activas
   */
  hasPenalties(): boolean {
    return this.penaltiesCount > 0;
  }
}
