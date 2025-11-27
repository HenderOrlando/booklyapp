import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ResourceCache } from "../../infrastructure/schemas/resource-cache.schema";
import { UsageReport } from "../../infrastructure/schemas/usage-report.schema";

const logger = createLogger("MetricsAggregationService");

/**
 * Metrics Aggregation Service
 * Servicio para agregar métricas desde múltiples fuentes
 */
@Injectable()
export class MetricsAggregationService {
  constructor(
    @InjectModel(ResourceCache.name)
    private readonly resourceCacheModel: Model<ResourceCache>,
    @InjectModel(UsageReport.name)
    private readonly usageReportModel: Model<UsageReport>
  ) {}

  /**
   * Calcular métricas de ocupación global
   */
  async calculateOccupancyMetrics(): Promise<{
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
      const resources = await this.resourceCacheModel
        .find({ isActive: true })
        .exec();

      const totalResources = resources.length;
      const activeResources = resources.filter(
        (r) => r.totalReservations > 0
      ).length;

      const totalReservations = resources.reduce(
        (sum, r) => sum + r.totalReservations,
        0
      );

      const totalHoursUsed = resources.reduce(
        (sum, r) => sum + r.totalHoursUsed,
        0
      );

      const totalOccupancy = resources.reduce(
        (sum, r) => sum + r.occupancyRate,
        0
      );

      const averageOccupancyRate =
        totalResources > 0 ? totalOccupancy / totalResources : 0;

      // Agrupar por tipo
      const resourcesByType: Record<string, number> = {};
      resources.forEach((r) => {
        resourcesByType[r.type] = (resourcesByType[r.type] || 0) + 1;
      });

      // Top 10 recursos más usados
      const topResources = resources
        .sort((a, b) => b.occupancyRate - a.occupancyRate)
        .slice(0, 10)
        .map((r) => ({
          resourceId: r.resourceId,
          name: r.name,
          occupancyRate: r.occupancyRate,
        }));

      logger.debug("Occupancy metrics calculated", {
        totalResources,
        activeResources,
        averageOccupancyRate,
      });

      return {
        averageOccupancyRate,
        totalResources,
        activeResources,
        totalReservations,
        totalHoursUsed,
        resourcesByType,
        topResources,
      };
    } catch (error: any) {
      logger.error("Failed to calculate occupancy metrics", error);
      throw error;
    }
  }

  /**
   * Calcular KPIs generales
   */
  async calculateOverviewKPIs(): Promise<{
    totalReservations: number;
    totalReservationsToday: number;
    totalHoursUsed: number;
    averageOccupancyRate: number;
    cancelledRate: number;
    noShowRate: number;
    completionRate: number;
  }> {
    try {
      const resources = await this.resourceCacheModel
        .find({ isActive: true })
        .exec();

      const totalReservations = resources.reduce(
        (sum, r) => sum + r.totalReservations,
        0
      );

      const confirmedReservations = resources.reduce(
        (sum, r) => sum + r.confirmedReservations,
        0
      );

      const cancelledReservations = resources.reduce(
        (sum, r) => sum + r.cancelledReservations,
        0
      );

      const noShowReservations = resources.reduce(
        (sum, r) => sum + r.noShowReservations,
        0
      );

      const completedReservations = resources.reduce(
        (sum, r) => sum + r.completedReservations,
        0
      );

      const totalHoursUsed = resources.reduce(
        (sum, r) => sum + r.totalHoursUsed,
        0
      );

      const totalOccupancy = resources.reduce(
        (sum, r) => sum + r.occupancyRate,
        0
      );

      const averageOccupancyRate =
        resources.length > 0 ? totalOccupancy / resources.length : 0;

      const cancelledRate =
        totalReservations > 0
          ? (cancelledReservations / totalReservations) * 100
          : 0;

      const noShowRate =
        totalReservations > 0
          ? (noShowReservations / totalReservations) * 100
          : 0;

      const completionRate =
        confirmedReservations > 0
          ? (completedReservations / confirmedReservations) * 100
          : 0;

      // Reservas de hoy (aproximado por última actualización)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const totalReservationsToday = resources.filter(
        (r) => r.lastReservationDate && new Date(r.lastReservationDate) >= today
      ).length;

      logger.debug("Overview KPIs calculated", {
        totalReservations,
        averageOccupancyRate,
        cancelledRate,
      });

      return {
        totalReservations,
        totalReservationsToday,
        totalHoursUsed,
        averageOccupancyRate,
        cancelledRate,
        noShowRate,
        completionRate,
      };
    } catch (error: any) {
      logger.error("Failed to calculate overview KPIs", error);
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
      const resources = await this.resourceCacheModel
        .find({
          resourceId: { $in: resourceIds },
          isActive: true,
        })
        .exec();

      const comparison = resources.map((r) => ({
        resourceId: r.resourceId,
        name: r.name,
        type: r.type,
        totalReservations: r.totalReservations,
        occupancyRate: r.occupancyRate,
        totalHoursUsed: r.totalHoursUsed,
        cancelledRate:
          r.totalReservations > 0
            ? (r.cancelledReservations / r.totalReservations) * 100
            : 0,
        noShowRate:
          r.totalReservations > 0
            ? (r.noShowReservations / r.totalReservations) * 100
            : 0,
      }));

      logger.debug("Resources compared", {
        resourceCount: comparison.length,
      });

      return { resources: comparison };
    } catch (error: any) {
      logger.error("Failed to compare resources", error);
      throw error;
    }
  }
}
