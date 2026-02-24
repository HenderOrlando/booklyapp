import { ReportMetricType, ReportTrendPeriod } from "@libs/common/enums";
import { DashboardMetricEntity } from "../entities";

/**
 * Dashboard Metric Repository Interface
 * Define contrato para persistencia de métricas del dashboard
 */
export interface IDashboardMetricRepository {
  /**
   * Guardar métrica
   */
  save(metric: DashboardMetricEntity): Promise<DashboardMetricEntity>;

  /**
   * Buscar por tipo y período
   */
  findByTypeAndPeriod(
    metricType: ReportMetricType,
    period: ReportTrendPeriod,
    startDate: Date,
    endDate: Date
  ): Promise<DashboardMetricEntity[]>;

  /**
   * Obtener métrica más reciente por tipo y período
   */
  findLatestByTypeAndPeriod(
    metricType: ReportMetricType,
    period: ReportTrendPeriod
  ): Promise<DashboardMetricEntity | null>;

  /**
   * Eliminar métricas antiguas
   */
  deleteOlderThan(date: Date): Promise<number>;
}
