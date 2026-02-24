import { UsageStatisticType } from "@libs/common/enums";

/**
 * Usage Statistic Entity
 * Entidad que representa estadísticas de uso de recursos (RF-31, RF-32)
 */
export class UsageStatisticEntity {
  constructor(
    public readonly id: string,
    public readonly statisticType: UsageStatisticType,
    public readonly referenceId: string, // resourceId, userId o programId
    public readonly referenceName: string,
    public readonly periodStart: Date,
    public readonly periodEnd: Date,
    public readonly totalReservations: number,
    public readonly confirmedReservations: number,
    public readonly cancelledReservations: number,
    public readonly completedReservations: number,
    public readonly totalHoursReserved: number,
    public readonly totalHoursUsed: number,
    public readonly averageRating?: number,
    public readonly uniqueUsers?: number,
    public readonly peakUsageTimes?: string[],
    public readonly mostUsedResources?: Array<{
      resourceId: string;
      resourceName: string;
      count: number;
    }>,
    public readonly metadata?: Record<string, any>,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  /**
   * Calcula la tasa de ocupación
   */
  getOccupancyRate(): number {
    if (this.totalHoursReserved === 0) return 0;
    return (this.totalHoursUsed / this.totalHoursReserved) * 100;
  }

  /**
   * Calcula la tasa de confirmación
   */
  getConfirmationRate(): number {
    if (this.totalReservations === 0) return 0;
    return (this.confirmedReservations / this.totalReservations) * 100;
  }

  /**
   * Calcula la tasa de cancelación
   */
  getCancellationRate(): number {
    if (this.totalReservations === 0) return 0;
    return (this.cancelledReservations / this.totalReservations) * 100;
  }

  /**
   * Calcula la tasa de completitud
   */
  getCompletionRate(): number {
    if (this.totalReservations === 0) return 0;
    return (this.completedReservations / this.totalReservations) * 100;
  }

  /**
   * Calcula el promedio de horas por reserva
   */
  getAverageHoursPerReservation(): number {
    if (this.totalReservations === 0) return 0;
    return this.totalHoursReserved / this.totalReservations;
  }

  /**
   * Verifica si el rating promedio es bueno (>= 4.0)
   */
  hasGoodRating(): boolean {
    return !!this.averageRating && this.averageRating >= 4.0;
  }

  /**
   * Obtiene la duración del período en días
   */
  getPeriodDurationInDays(): number {
    const diffTime = Math.abs(
      this.periodEnd.getTime() - this.periodStart.getTime()
    );
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calcula el promedio de reservas por día
   */
  getAverageReservationsPerDay(): number {
    const days = this.getPeriodDurationInDays();
    if (days === 0) return 0;
    return this.totalReservations / days;
  }

  /**
   * Verifica si es estadística de recurso
   */
  isResourceStatistic(): boolean {
    return this.statisticType === UsageStatisticType.RESOURCE;
  }

  /**
   * Verifica si es estadística de usuario
   */
  isUserStatistic(): boolean {
    return this.statisticType === UsageStatisticType.USER;
  }

  /**
   * Verifica si es estadística de programa
   */
  isProgramStatistic(): boolean {
    return this.statisticType === UsageStatisticType.PROGRAM;
  }

  /**
   * Convierte la entidad a objeto plano
   */
  toObject(): any {
    return {
      id: this.id,
      statisticType: this.statisticType,
      referenceId: this.referenceId,
      referenceName: this.referenceName,
      periodStart: this.periodStart,
      periodEnd: this.periodEnd,
      totalReservations: this.totalReservations,
      confirmedReservations: this.confirmedReservations,
      cancelledReservations: this.cancelledReservations,
      completedReservations: this.completedReservations,
      totalHoursReserved: this.totalHoursReserved,
      totalHoursUsed: this.totalHoursUsed,
      averageRating: this.averageRating,
      uniqueUsers: this.uniqueUsers,
      peakUsageTimes: this.peakUsageTimes,
      mostUsedResources: this.mostUsedResources,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Crea una entidad desde un objeto plano
   */
  static fromObject(obj: any): UsageStatisticEntity {
    return new UsageStatisticEntity(
      obj.id || obj._id?.toString(),
      obj.statisticType,
      obj.referenceId,
      obj.referenceName,
      obj.periodStart,
      obj.periodEnd,
      obj.totalReservations,
      obj.confirmedReservations,
      obj.cancelledReservations,
      obj.completedReservations,
      obj.totalHoursReserved,
      obj.totalHoursUsed,
      obj.averageRating,
      obj.uniqueUsers,
      obj.peakUsageTimes,
      obj.mostUsedResources,
      obj.metadata,
      obj.createdAt,
      obj.updatedAt
    );
  }
}
