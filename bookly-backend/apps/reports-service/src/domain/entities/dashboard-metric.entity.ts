import { ReportMetricType, ReportTrendPeriod } from "@libs/common/enums";

/**
 * Dashboard Metric Entity
 * Entidad para métricas precalculadas del dashboard
 */
export class DashboardMetricEntity {
  constructor(
    public readonly id: string,
    public readonly metricType: ReportMetricType, // 'OVERVIEW', 'OCCUPANCY', 'TRENDS', 'COMPARISON'
    public readonly period: ReportTrendPeriod, // 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'
    public readonly date: Date,
    public readonly data: Record<string, any>,
    public readonly metadata?: Record<string, any>,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  /**
   * Convertir entidad a objeto plano
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      metricType: this.metricType,
      period: this.period,
      date: this.date,
      data: this.data,
      metadata: this.metadata,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  /**
   * Crear desde datos planos
   */
  static fromData(data: any): DashboardMetricEntity {
    return new DashboardMetricEntity(
      data.id || data._id?.toString(),
      data.metricType,
      data.period,
      data.date instanceof Date ? data.date : new Date(data.date),
      data.data,
      data.metadata,
      data.createdAt instanceof Date
        ? data.createdAt
        : new Date(data.createdAt),
      data.updatedAt instanceof Date ? data.updatedAt : new Date(data.updatedAt)
    );
  }
}
