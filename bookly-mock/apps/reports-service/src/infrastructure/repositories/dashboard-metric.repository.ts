import { ReportMetricType, ReportTrendPeriod } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { DashboardMetricEntity } from '@reports/domain/entities";
import { IDashboardMetricRepository } from '@reports/domain/repositories/dashboard-metric.repository.interface";
import { DashboardMetric } from "../schemas/dashboard-metric.schema";

const logger = createLogger("DashboardMetricRepository");

/**
 * Dashboard Metric Repository
 * Implementación de persistencia para métricas del dashboard con Mongoose
 */
@Injectable()
export class DashboardMetricRepository implements IDashboardMetricRepository {
  constructor(
    @InjectModel(DashboardMetric.name)
    private readonly dashboardMetricModel: Model<DashboardMetric>
  ) {}

  /**
   * Guardar métrica
   */
  async save(metric: DashboardMetricEntity): Promise<DashboardMetricEntity> {
    try {
      const metricData = {
        metricType: metric.metricType,
        period: metric.period,
        date: metric.date,
        data: metric.data,
        metadata: metric.metadata,
      };

      let savedMetric: any;

      if (metric.id) {
        // Actualizar existente
        savedMetric = await this.dashboardMetricModel.findByIdAndUpdate(
          metric.id,
          metricData,
          { new: true }
        );
      } else {
        // Crear nuevo
        savedMetric = await this.dashboardMetricModel.create(metricData);
      }

      logger.debug("Dashboard metric saved", {
        metricType: metric.metricType,
        period: metric.period,
      });

      return this.toDomain(savedMetric);
    } catch (error: any) {
      logger.error("Failed to save dashboard metric", error);
      throw error;
    }
  }

  /**
   * Buscar por tipo y período
   */
  async findByTypeAndPeriod(
    metricType: ReportMetricType,
    period: ReportTrendPeriod,
    startDate: Date,
    endDate: Date
  ): Promise<DashboardMetricEntity[]> {
    try {
      const metrics = await this.dashboardMetricModel
        .find({
          metricType,
          period,
          date: {
            $gte: startDate,
            $lte: endDate,
          },
        })
        .sort({ date: -1 })
        .exec();

      return metrics.map((metric) => this.toDomain(metric));
    } catch (error: any) {
      logger.error("Failed to find dashboard metrics", error);
      throw error;
    }
  }

  /**
   * Obtener métrica más reciente por tipo y período
   */
  async findLatestByTypeAndPeriod(
    metricType: ReportMetricType,
    period: ReportTrendPeriod
  ): Promise<DashboardMetricEntity | null> {
    try {
      const metric = await this.dashboardMetricModel
        .findOne({ metricType, period })
        .sort({ date: -1 })
        .exec();

      return metric ? this.toDomain(metric) : null;
    } catch (error: any) {
      logger.error("Failed to find latest dashboard metric", error);
      throw error;
    }
  }

  /**
   * Eliminar métricas antiguas
   */
  async deleteOlderThan(date: Date): Promise<number> {
    try {
      const result = await this.dashboardMetricModel.deleteMany({
        date: { $lt: date },
      });

      logger.info("Deleted old dashboard metrics", {
        deletedCount: result.deletedCount,
        beforeDate: date,
      });

      return result.deletedCount || 0;
    } catch (error: any) {
      logger.error("Failed to delete old dashboard metrics", error);
      throw error;
    }
  }

  /**
   * Convertir documento Mongoose a entidad de dominio
   */
  private toDomain(doc: any): DashboardMetricEntity {
    return new DashboardMetricEntity(
      doc._id.toString(),
      doc.metricType,
      doc.period,
      doc.date,
      doc.data,
      doc.metadata,
      doc.createdAt,
      doc.updatedAt
    );
  }
}
