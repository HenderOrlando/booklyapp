import {
  ReportMetricType,
  ReportTrendPeriod,
  ReportTrendType,
} from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Inject, Injectable } from "@nestjs/common";
import { DashboardMetricEntity } from '@reports/domain/entities";
import { IDashboardMetricRepository } from '@reports/domain/repositories/dashboard-metric.repository.interface";
import { MetricsAggregationService } from "./metrics-aggregation.service";
import { TrendAnalysisService } from "./trend-analysis.service";

const logger = createLogger("DashboardService");

/**
 * Dashboard Service
 * Servicio principal para gestión de métricas del dashboard
 */
@Injectable()
export class DashboardService {
  constructor(
    @Inject("IDashboardMetricRepository")
    private readonly dashboardMetricRepository: IDashboardMetricRepository,
    private readonly metricsAggregationService: MetricsAggregationService,
    private readonly trendAnalysisService: TrendAnalysisService
  ) {}

  /**
   * Obtener vista general del dashboard
   */
  async getOverview(): Promise<{
    kpis: {
      totalReservations: number;
      totalReservationsToday: number;
      totalHoursUsed: number;
      averageOccupancyRate: number;
      cancelledRate: number;
      noShowRate: number;
      completionRate: number;
    };
    recentActivity: {
      lastUpdate: Date;
      activeResources: number;
      totalResources: number;
    };
  }> {
    try {
      logger.info("Getting dashboard overview");

      // Calcular KPIs
      const kpis = await this.metricsAggregationService.calculateOverviewKPIs();

      // Calcular métricas de ocupación para actividad reciente
      const occupancyMetrics =
        await this.metricsAggregationService.calculateOccupancyMetrics();

      const overview = {
        kpis,
        recentActivity: {
          lastUpdate: new Date(),
          activeResources: occupancyMetrics.activeResources,
          totalResources: occupancyMetrics.totalResources,
        },
      };

      // Guardar métrica para cache
      await this.saveDashboardMetric(
        ReportMetricType.OVERVIEW,
        ReportTrendPeriod.DAILY,
        overview
      );

      logger.info("Dashboard overview generated", {
        totalReservations: kpis.totalReservations,
        averageOccupancyRate: kpis.averageOccupancyRate,
      });

      return overview;
    } catch (error: any) {
      logger.error("Failed to get dashboard overview", error);
      throw error;
    }
  }

  /**
   * Obtener métricas de ocupación
   */
  async getOccupancyMetrics(): Promise<{
    averageOccupancyRate: number;
    totalResources: number;
    activeResources: number;
    totalReservations: number;
    totalHoursUsed: number;
    resourcesByType: Record<string, number>;
    topResources: Array<{
      resourceId: string;
      name: string;
      occupancyRate: number;
    }>;
  }> {
    try {
      logger.info("Getting occupancy metrics");

      const metrics =
        await this.metricsAggregationService.calculateOccupancyMetrics();

      // Guardar métrica para cache
      await this.saveDashboardMetric(
        ReportMetricType.OCCUPANCY,
        ReportTrendPeriod.DAILY,
        metrics
      );

      logger.info("Occupancy metrics generated", {
        averageOccupancyRate: metrics.averageOccupancyRate,
        activeResources: metrics.activeResources,
      });

      return metrics;
    } catch (error: any) {
      logger.error("Failed to get occupancy metrics", error);
      throw error;
    }
  }

  /**
   * Obtener análisis de tendencias
   */
  async getTrendAnalysis(
    period: ReportTrendPeriod,
    startDate: Date,
    endDate: Date
  ): Promise<{
    period: ReportTrendPeriod;
    dataPoints: Array<{
      date: string;
      occupancyRate: number;
      totalReservations: number;
      totalHoursUsed: number;
    }>;
    trend: ReportTrendType;
    averageGrowth: number;
  }> {
    try {
      logger.info("Getting trend analysis", {
        period,
        startDate,
        endDate,
      });

      const analysis = await this.trendAnalysisService.analyzeTrends(
        period,
        startDate,
        endDate
      );

      // Guardar métrica para cache
      await this.saveDashboardMetric(ReportMetricType.TRENDS, period, analysis);

      logger.info("Trend analysis generated", {
        period,
        dataPointsCount: analysis.dataPoints.length,
        trend: analysis.trend,
      });

      return analysis;
    } catch (error: any) {
      logger.error("Failed to get trend analysis", error);
      throw error;
    }
  }

  /**
   * Comparar recursos
   */
  async compareResources(resourceIds: string[]): Promise<{
    resources: Array<{
      resourceId: string;
      name: string;
      type: string;
      totalReservations: number;
      occupancyRate: number;
      totalHoursUsed: number;
      cancelledRate: number;
      noShowRate: number;
    }>;
  }> {
    try {
      logger.info("Comparing resources", {
        resourceCount: resourceIds.length,
      });

      const comparison =
        await this.metricsAggregationService.compareResources(resourceIds);

      // Guardar métrica para cache
      await this.saveDashboardMetric(
        ReportMetricType.COMPARISON,
        ReportTrendPeriod.DAILY,
        {
          ...comparison,
          comparedAt: new Date(),
        }
      );

      logger.info("Resources compared", {
        resourceCount: comparison.resources.length,
      });

      return comparison;
    } catch (error: any) {
      logger.error("Failed to compare resources", error);
      throw error;
    }
  }

  /**
   * Obtener KPIs principales
   */
  async getMainKPIs(): Promise<{
    totalReservations: number;
    totalReservationsToday: number;
    totalHoursUsed: number;
    averageOccupancyRate: number;
    cancelledRate: number;
    noShowRate: number;
    completionRate: number;
    topResources: Array<{
      resourceId: string;
      name: string;
      occupancyRate: number;
    }>;
    usagePatterns: {
      peakHours: string[];
      peakDays: string[];
      lowUsageHours: string[];
    };
  }> {
    try {
      logger.info("Getting main KPIs");

      const [kpis, occupancyMetrics, patterns] = await Promise.all([
        this.metricsAggregationService.calculateOverviewKPIs(),
        this.metricsAggregationService.calculateOccupancyMetrics(),
        this.trendAnalysisService.detectUsagePatterns(),
      ]);

      const mainKPIs = {
        ...kpis,
        topResources: occupancyMetrics.topResources,
        usagePatterns: {
          peakHours: patterns.peakHours,
          peakDays: patterns.peakDays,
          lowUsageHours: patterns.lowUsageHours,
        },
      };

      logger.info("Main KPIs generated", {
        totalReservations: kpis.totalReservations,
        averageOccupancyRate: kpis.averageOccupancyRate,
      });

      return mainKPIs;
    } catch (error: any) {
      logger.error("Failed to get main KPIs", error);
      throw error;
    }
  }

  /**
   * Guardar métrica del dashboard
   */
  private async saveDashboardMetric(
    metricType: ReportMetricType,
    period: ReportTrendPeriod,
    data: any
  ): Promise<void> {
    try {
      const metric = new DashboardMetricEntity(
        "",
        metricType,
        period,
        new Date(),
        data,
        { generatedAt: new Date().toISOString() }
      );

      await this.dashboardMetricRepository.save(metric);

      logger.debug("Dashboard metric saved", { metricType, period });
    } catch (error: any) {
      // No fallar si no se puede guardar el cache
      logger.warn("Failed to save dashboard metric", {
        metricType,
        period,
        error: error.message,
      });
    }
  }

  /**
   * Limpiar métricas antiguas (más de 90 días)
   */
  async cleanupOldMetrics(): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);

      const deletedCount =
        await this.dashboardMetricRepository.deleteOlderThan(cutoffDate);

      logger.info("Old dashboard metrics cleaned", { deletedCount });

      return deletedCount;
    } catch (error: any) {
      logger.error("Failed to cleanup old metrics", error);
      throw error;
    }
  }
}
