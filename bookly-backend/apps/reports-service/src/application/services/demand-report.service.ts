import { PaginationMeta, PaginationQuery } from "@libs/common";
import { createLogger } from "@libs/common";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { DemandReportEntity } from '@reports/domain/entities';
import { IDemandReportRepository } from '@reports/domain/repositories';

/**
 * Demand Report Service
 * Servicio para gestión de reportes de demanda
 */
@Injectable()
export class DemandReportService {
  private readonly logger = createLogger("DemandReportService");

  constructor(
    @Inject("IDemandReportRepository")
    private readonly demandReportRepository: IDemandReportRepository
  ) {}

  /**
   * Generar reporte de demanda insatisfecha
   */
  async generateDemandReport(data: {
    resourceType: string;
    programId: string;
    startDate: Date;
    endDate: Date;
    totalDenials: number;
    reasonsBreakdown: Record<string, number>;
    peakDemandPeriods: Array<{ date: Date; hour: number; denialCount: number }>;
    alternativeResourcesSuggested: Record<string, number>;
    waitingListEntries: number;
    averageWaitTime: number;
    metadata?: Record<string, any>;
  }): Promise<DemandReportEntity> {
    const report = new DemandReportEntity(
      "",
      data.resourceType,
      data.programId,
      data.startDate,
      data.endDate,
      data.totalDenials,
      data.reasonsBreakdown,
      data.peakDemandPeriods,
      data.alternativeResourcesSuggested,
      data.waitingListEntries,
      data.averageWaitTime,
      data.metadata,
      new Date(),
      new Date()
    );

    const createdReport = await this.demandReportRepository.create(report);

    this.logger.info("Demand report generated", {
      reportId: createdReport.id,
      resourceType: createdReport.resourceType,
    });

    return createdReport;
  }

  /**
   * Obtener reporte por ID
   */
  async getDemandReportById(id: string): Promise<DemandReportEntity> {
    const report = await this.demandReportRepository.findById(id);
    if (!report) {
      throw new NotFoundException(`Demand report with ID ${id} not found`);
    }
    return report;
  }

  /**
   * Obtener reportes con filtros
   */
  async getDemandReports(
    query: PaginationQuery,
    filters?: {
      resourceType?: string;
      programId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ reports: DemandReportEntity[]; meta: PaginationMeta }> {
    return await this.demandReportRepository.findMany(query, filters);
  }

  /**
   * Eliminar reporte
   */
  async deleteDemandReport(id: string): Promise<boolean> {
    const report = await this.getDemandReportById(id);
    const deleted = await this.demandReportRepository.delete(report.id);

    this.logger.info("Demand report deleted", { reportId: id });

    return deleted;
  }
}
