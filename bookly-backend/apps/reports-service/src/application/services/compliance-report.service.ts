import { createLogger, PaginationMeta, PaginationQuery } from "@libs/common";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ComplianceReportEntity } from "../../domain/entities/compliance-report.entity";
import { IComplianceReportRepository } from "../../domain/repositories/compliance-report.repository.interface";

const logger = createLogger("ComplianceReportService");

/**
 * Compliance Report Service
 * Servicio para gestión de reportes de cumplimiento de reserva (RF-39)
 * Consume datos de check-in/out desde availability-service
 */
@Injectable()
export class ComplianceReportService {
  constructor(
    @Inject("IComplianceReportRepository")
    private readonly complianceReportRepository: IComplianceReportRepository,
  ) {}

  /**
   * Generar reporte de cumplimiento para un recurso
   */
  async generateComplianceReport(data: {
    resourceId: string;
    resourceName: string;
    resourceType: string;
    startDate: Date;
    endDate: Date;
    totalReservations: number;
    checkedInReservations: number;
    noShowReservations: number;
    lateCheckIns: number;
    earlyCheckOuts: number;
    onTimeCheckIns: number;
    complianceRate: number;
    noShowRate: number;
    averageCheckInDelayMinutes: number;
    usersWithNoShow: Array<{
      userId: string;
      noShowCount: number;
    }>;
    complianceByDayOfWeek: Record<string, number>;
    complianceByHour: Record<string, number>;
    metadata?: Record<string, any>;
  }): Promise<ComplianceReportEntity> {
    const report = new ComplianceReportEntity(
      "",
      data.resourceId,
      data.resourceName,
      data.resourceType,
      data.startDate,
      data.endDate,
      data.totalReservations,
      data.checkedInReservations,
      data.noShowReservations,
      data.lateCheckIns,
      data.earlyCheckOuts,
      data.onTimeCheckIns,
      data.complianceRate,
      data.noShowRate,
      data.averageCheckInDelayMinutes,
      data.usersWithNoShow,
      data.complianceByDayOfWeek,
      data.complianceByHour,
      data.metadata,
      new Date(),
      new Date(),
    );

    const createdReport = await this.complianceReportRepository.create(report);

    logger.info("Compliance report generated", {
      reportId: createdReport.id,
      resourceId: createdReport.resourceId,
      complianceRate: createdReport.complianceRate,
      noShowRate: createdReport.noShowRate,
    });

    return createdReport;
  }

  /**
   * Obtener reporte por ID
   */
  async getComplianceReportById(id: string): Promise<ComplianceReportEntity> {
    const report = await this.complianceReportRepository.findById(id);
    if (!report) {
      throw new NotFoundException(`Compliance report with ID ${id} not found`);
    }
    return report;
  }

  /**
   * Obtener reportes con filtros
   */
  async getComplianceReports(
    query: PaginationQuery,
    filters?: {
      resourceId?: string;
      resourceType?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<{ reports: ComplianceReportEntity[]; meta: PaginationMeta }> {
    return await this.complianceReportRepository.findMany(query, filters);
  }

  /**
   * Obtener reportes por recurso
   */
  async getComplianceReportsByResource(
    resourceId: string,
    query: PaginationQuery,
  ): Promise<{ reports: ComplianceReportEntity[]; meta: PaginationMeta }> {
    return await this.complianceReportRepository.findByResource(
      resourceId,
      query,
    );
  }

  /**
   * Eliminar reporte
   */
  async deleteComplianceReport(id: string): Promise<boolean> {
    const report = await this.getComplianceReportById(id);
    const deleted = await this.complianceReportRepository.delete(report.id);

    logger.info("Compliance report deleted", { reportId: id });

    return deleted;
  }
}
