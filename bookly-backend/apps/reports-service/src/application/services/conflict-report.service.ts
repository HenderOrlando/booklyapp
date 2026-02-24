import { PaginationMeta, PaginationQuery } from "@libs/common";
import { createLogger } from "@libs/common";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ConflictReportEntity } from '@reports/domain/entities/conflict-report.entity';
import { IConflictReportRepository } from '@reports/domain/repositories/conflict-report.repository.interface';

const logger = createLogger("ConflictReportService");

/**
 * Conflict Report Service
 * Servicio para gestión de reportes de conflictos de reserva (RF-38)
 */
@Injectable()
export class ConflictReportService {
  constructor(
    @Inject("IConflictReportRepository")
    private readonly conflictReportRepository: IConflictReportRepository
  ) {}

  /**
   * Generar reporte de conflictos para un recurso
   */
  async generateConflictReport(data: {
    resourceId: string;
    resourceName: string;
    resourceType: string;
    startDate: Date;
    endDate: Date;
    totalConflicts: number;
    resolvedConflicts: number;
    unresolvedConflicts: number;
    conflictTypesBreakdown: Record<string, number>;
    peakConflictPeriods: Array<{
      date: Date;
      hour: number;
      conflictCount: number;
    }>;
    averageResolutionTimeMinutes: number;
    resolutionMethodsBreakdown: Record<string, number>;
    affectedUsers: number;
    metadata?: Record<string, any>;
  }): Promise<ConflictReportEntity> {
    const report = new ConflictReportEntity(
      "",
      data.resourceId,
      data.resourceName,
      data.resourceType,
      data.startDate,
      data.endDate,
      data.totalConflicts,
      data.resolvedConflicts,
      data.unresolvedConflicts,
      data.conflictTypesBreakdown,
      data.peakConflictPeriods,
      data.averageResolutionTimeMinutes,
      data.resolutionMethodsBreakdown,
      data.affectedUsers,
      data.metadata,
      new Date(),
      new Date()
    );

    const createdReport = await this.conflictReportRepository.create(report);

    logger.info("Conflict report generated", {
      reportId: createdReport.id,
      resourceId: createdReport.resourceId,
      totalConflicts: createdReport.totalConflicts,
    });

    return createdReport;
  }

  /**
   * Obtener reporte por ID
   */
  async getConflictReportById(id: string): Promise<ConflictReportEntity> {
    const report = await this.conflictReportRepository.findById(id);
    if (!report) {
      throw new NotFoundException(`Conflict report with ID ${id} not found`);
    }
    return report;
  }

  /**
   * Obtener reportes con filtros
   */
  async getConflictReports(
    query: PaginationQuery,
    filters?: {
      resourceId?: string;
      resourceType?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ reports: ConflictReportEntity[]; meta: PaginationMeta }> {
    return await this.conflictReportRepository.findMany(query, filters);
  }

  /**
   * Obtener reportes por recurso
   */
  async getConflictReportsByResource(
    resourceId: string,
    query: PaginationQuery
  ): Promise<{ reports: ConflictReportEntity[]; meta: PaginationMeta }> {
    return await this.conflictReportRepository.findByResource(
      resourceId,
      query
    );
  }

  /**
   * Eliminar reporte
   */
  async deleteConflictReport(id: string): Promise<boolean> {
    const report = await this.getConflictReportById(id);
    const deleted = await this.conflictReportRepository.delete(report.id);

    logger.info("Conflict report deleted", { reportId: id });

    return deleted;
  }
}
