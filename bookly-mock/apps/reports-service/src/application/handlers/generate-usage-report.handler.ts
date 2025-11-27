import { createLogger } from "@libs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ResourceCache } from "../../infrastructure/schemas/resource-cache.schema";
import { GenerateUsageReportQuery } from "../queries";
import { UsageReportService } from "../services";

const logger = createLogger("GenerateUsageReportHandler");

@QueryHandler(GenerateUsageReportQuery)
export class GenerateUsageReportHandler
  implements IQueryHandler<GenerateUsageReportQuery>
{
  constructor(
    private readonly usageReportService: UsageReportService,
    @InjectModel(ResourceCache.name)
    private readonly resourceCacheModel: Model<ResourceCache>
  ) {}

  async execute(query: GenerateUsageReportQuery): Promise<any> {
    logger.info("Executing GenerateUsageReportQuery", {
      resourceId: query.resourceId,
      startDate: query.startDate,
      endDate: query.endDate,
    });

    // Obtener información del recurso desde cache local (actualizado por eventos)
    const resourceCache = await this.resourceCacheModel.findOne({
      resourceId: query.resourceId,
    });

    if (!resourceCache) {
      logger.warn("Resource not found in cache", {
        resourceId: query.resourceId,
      });
      throw new Error(`Resource ${query.resourceId} not found`);
    }

    logger.info("Resource cache retrieved", {
      resourceId: query.resourceId,
      resourceName: resourceCache.name,
      totalReservations: resourceCache.totalReservations,
    });

    // Las estadísticas ya están calculadas en tiempo real por los eventos
    // Solo necesitamos construir el reporte con los datos del cache
    const reportData = {
      resourceId: query.resourceId,
      resourceName: resourceCache.name,
      resourceType: resourceCache.type,
      startDate: query.startDate,
      endDate: query.endDate,
      totalReservations: resourceCache.totalReservations,
      confirmedReservations: resourceCache.confirmedReservations,
      cancelledReservations: resourceCache.cancelledReservations,
      noShowReservations: resourceCache.noShowReservations,
      totalHoursReserved: resourceCache.totalHoursReserved,
      totalHoursUsed: resourceCache.totalHoursUsed,
      occupancyRate: resourceCache.occupancyRate,
      averageSessionDuration: resourceCache.averageSessionDuration,
      peakUsageHours: resourceCache.peakUsageHours,
      programsBreakdown: resourceCache.programsBreakdown,
    };

    // Generar y persistir el reporte
    const report =
      await this.usageReportService.generateUsageReport(reportData);

    logger.info("Usage report generated successfully from cache", {
      reportId: report.id,
      resourceId: query.resourceId,
      totalReservations: resourceCache.totalReservations,
      occupancyRate: resourceCache.occupancyRate,
    });

    return report;
  }
}
