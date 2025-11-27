import { PaginationMeta, PaginationQuery } from "@libs/common";
import { createLogger } from "@libs/common";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UsageReportEntity } from "../../domain/entities";
import { IUsageReportRepository } from "../../domain/repositories";

/**
 * Usage Report Service
 * Servicio para gestión de reportes de uso
 */
@Injectable()
export class UsageReportService {
  private readonly logger = createLogger("UsageReportService");

  constructor(
    @Inject("IUsageReportRepository")
    private readonly usageReportRepository: IUsageReportRepository
  ) {}

  /**
   * Generar reporte de uso para un recurso
   */
  async generateUsageReport(data: {
    resourceId: string;
    resourceName: string;
    resourceType: string;
    startDate: Date;
    endDate: Date;
    totalReservations: number;
    confirmedReservations: number;
    cancelledReservations: number;
    noShowReservations: number;
    totalHoursReserved: number;
    totalHoursUsed: number;
    occupancyRate: number;
    averageSessionDuration: number;
    peakUsageHours: string[];
    programsBreakdown: Record<string, number>;
    metadata?: Record<string, any>;
  }): Promise<UsageReportEntity> {
    const report = new UsageReportEntity(
      "",
      data.resourceId,
      data.resourceName,
      data.resourceType,
      data.startDate,
      data.endDate,
      data.totalReservations,
      data.confirmedReservations,
      data.cancelledReservations,
      data.noShowReservations,
      data.totalHoursReserved,
      data.totalHoursUsed,
      data.occupancyRate,
      data.averageSessionDuration,
      data.peakUsageHours,
      data.programsBreakdown,
      data.metadata,
      new Date(),
      new Date()
    );

    const createdReport = await this.usageReportRepository.create(report);

    this.logger.info("Usage report generated", {
      reportId: createdReport.id,
      resourceId: createdReport.resourceId,
    });

    return createdReport;
  }

  /**
   * Obtener reporte por ID
   */
  async getUsageReportById(id: string): Promise<UsageReportEntity> {
    const report = await this.usageReportRepository.findById(id);
    if (!report) {
      throw new NotFoundException(`Usage report with ID ${id} not found`);
    }
    return report;
  }

  /**
   * Obtener reportes con filtros
   */
  async getUsageReports(
    query: PaginationQuery,
    filters?: {
      resourceId?: string;
      resourceType?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ reports: UsageReportEntity[]; meta: PaginationMeta }> {
    return await this.usageReportRepository.findMany(query, filters);
  }

  /**
   * Obtener reportes por recurso
   */
  async getUsageReportsByResource(
    resourceId: string,
    query: PaginationQuery
  ): Promise<{ reports: UsageReportEntity[]; meta: PaginationMeta }> {
    return await this.usageReportRepository.findByResource(resourceId, query);
  }

  /**
   * Obtener reportes por tipo de recurso
   */
  async getUsageReportsByResourceType(
    resourceType: string,
    query: PaginationQuery
  ): Promise<{ reports: UsageReportEntity[]; meta: PaginationMeta }> {
    return await this.usageReportRepository.findByResourceType(
      resourceType,
      query
    );
  }

  /**
   * Eliminar reporte
   */
  async deleteUsageReport(id: string): Promise<boolean> {
    const report = await this.getUsageReportById(id);
    const deleted = await this.usageReportRepository.delete(report.id);

    this.logger.info("Usage report deleted", { reportId: id });

    return deleted;
  }
}
