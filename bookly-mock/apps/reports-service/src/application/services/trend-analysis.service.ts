import { ReportTrendPeriod, ReportTrendType } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UsageReport } from "../../infrastructure/schemas/usage-report.schema";

const logger = createLogger("TrendAnalysisService");

/**
 * Trend Analysis Service
 * Servicio para análisis de tendencias temporales
 */
@Injectable()
export class TrendAnalysisService {
  constructor(
    @InjectModel(UsageReport.name)
    private readonly usageReportModel: Model<UsageReport>
  ) {}

  /**
   * Analizar tendencias de ocupación por período
   */
  async analyzeTrends(
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
      // Obtener reportes del período
      const reports = await this.usageReportModel
        .find({
          startDate: { $gte: startDate },
          endDate: { $lte: endDate },
        })
        .sort({ startDate: 1 })
        .exec();

      if (reports.length === 0) {
        return {
          period,
          dataPoints: [],
          trend: ReportTrendType.STABLE,
          averageGrowth: 0,
        };
      }

      // Agrupar por período
      const grouped = this.groupByPeriod(reports, period);

      // Calcular dataPoints
      const dataPoints = Object.entries(grouped).map(([date, data]) => ({
        date,
        occupancyRate: data.totalOccupancy / data.count,
        totalReservations: data.totalReservations,
        totalHoursUsed: data.totalHoursUsed,
      }));

      // Calcular tendencia
      const { trend, averageGrowth } = this.calculateTrend(dataPoints);

      logger.debug("Trends analyzed", {
        period,
        dataPointsCount: dataPoints.length,
        trend,
      });

      return {
        period,
        dataPoints,
        trend,
        averageGrowth,
      };
    } catch (error: any) {
      logger.error("Failed to analyze trends", error);
      throw error;
    }
  }

  /**
   * Detectar patrones de uso
   */
  async detectUsagePatterns(): Promise<{
    peakHours: string[];
    peakDays: string[];
    lowUsageHours: string[];
    seasonalPatterns: Array<{
      month: string;
      averageOccupancy: number;
    }>;
  }> {
    try {
      const reports = await this.usageReportModel
        .find({
          startDate: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }, // Últimos 90 días
        })
        .exec();

      // Analizar horas pico
      const hourCounts: Record<string, number> = {};
      reports.forEach((report) => {
        report.peakUsageHours.forEach((hour) => {
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });
      });

      const sortedHours = Object.entries(hourCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([hour]) => hour);

      const peakHours = sortedHours.slice(0, 5);
      const lowUsageHours = sortedHours.slice(-5).reverse();

      // Analizar días (simulado - en producción vendría de datos reales)
      const peakDays = ["Lunes", "Martes", "Miércoles"];

      // Patrones estacionales (simulado)
      const seasonalPatterns = [
        { month: "Enero", averageOccupancy: 65 },
        { month: "Febrero", averageOccupancy: 72 },
        { month: "Marzo", averageOccupancy: 78 },
        { month: "Abril", averageOccupancy: 81 },
        { month: "Mayo", averageOccupancy: 75 },
        { month: "Junio", averageOccupancy: 45 },
      ];

      logger.debug("Usage patterns detected", {
        peakHoursCount: peakHours.length,
        peakDaysCount: peakDays.length,
      });

      return {
        peakHours,
        peakDays,
        lowUsageHours,
        seasonalPatterns,
      };
    } catch (error: any) {
      logger.error("Failed to detect usage patterns", error);
      throw error;
    }
  }

  /**
   * Agrupar reportes por período
   */
  private groupByPeriod(
    reports: any[],
    period: ReportTrendPeriod
  ): Record<string, any> {
    const grouped: Record<string, any> = {};

    reports.forEach((report) => {
      const date = new Date(report.startDate);
      let key: string;

      switch (period) {
        case ReportTrendPeriod.DAILY:
          key = date.toISOString().split("T")[0];
          break;
        case ReportTrendPeriod.WEEKLY:
          const weekNumber = this.getWeekNumber(date);
          key = `${date.getFullYear()}-W${weekNumber}`;
          break;
        case ReportTrendPeriod.MONTHLY:
          key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
          break;
      }

      if (!grouped[key]) {
        grouped[key] = {
          totalOccupancy: 0,
          totalReservations: 0,
          totalHoursUsed: 0,
          count: 0,
        };
      }

      grouped[key].totalOccupancy += report.occupancyRate;
      grouped[key].totalReservations += report.totalReservations;
      grouped[key].totalHoursUsed += report.totalHoursUsed;
      grouped[key].count += 1;
    });

    return grouped;
  }

  /**
   * Calcular tendencia
   */
  private calculateTrend(
    dataPoints: Array<{ date: string; occupancyRate: number }>
  ): { trend: ReportTrendType; averageGrowth: number } {
    if (dataPoints.length < 2) {
      return { trend: ReportTrendType.STABLE, averageGrowth: 0 };
    }

    let totalGrowth = 0;
    let growthCount = 0;

    for (let i = 1; i < dataPoints.length; i++) {
      const growth =
        ((dataPoints[i].occupancyRate - dataPoints[i - 1].occupancyRate) /
          dataPoints[i - 1].occupancyRate) *
        100;
      totalGrowth += growth;
      growthCount++;
    }

    const averageGrowth = totalGrowth / growthCount;

    let trend: ReportTrendType;
    if (averageGrowth > 2) {
      trend = ReportTrendType.INCREASING;
    } else if (averageGrowth < -2) {
      trend = ReportTrendType.DECREASING;
    } else {
      trend = ReportTrendType.STABLE;
    }

    return { trend, averageGrowth };
  }

  /**
   * Obtener número de semana del año
   */
  private getWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }
}
