import { PaginationMeta, PaginationQuery } from "@libs/common";
import { createLogger } from "@libs/common";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UserReportEntity } from '@reports/domain/entities";
import { IUserReportRepository } from '@reports/domain/repositories";

/**
 * User Report Service
 * Servicio para gestión de reportes de usuario
 */
@Injectable()
export class UserReportService {
  private readonly logger = createLogger("UserReportService");

  constructor(
    @Inject("IUserReportRepository")
    private readonly userReportRepository: IUserReportRepository
  ) {}

  /**
   * Generar reporte de usuario
   */
  async generateUserReport(data: {
    userId: string;
    userName: string;
    userType: string;
    startDate: Date;
    endDate: Date;
    totalReservations: number;
    confirmedReservations: number;
    cancelledReservations: number;
    noShowCount: number;
    totalHoursReserved: number;
    resourceTypesUsed: Record<string, number>;
    favoriteResources: Array<{
      resourceId: string;
      resourceName: string;
      usageCount: number;
    }>;
    peakUsageDays: string[];
    averageAdvanceBooking: number;
    penaltiesCount: number;
    feedbackSubmitted: number;
    metadata?: Record<string, any>;
  }): Promise<UserReportEntity> {
    const report = new UserReportEntity(
      "",
      data.userId,
      data.userName,
      data.userType,
      data.startDate,
      data.endDate,
      data.totalReservations,
      data.confirmedReservations,
      data.cancelledReservations,
      data.noShowCount,
      data.totalHoursReserved,
      data.resourceTypesUsed,
      data.favoriteResources,
      data.peakUsageDays,
      data.averageAdvanceBooking,
      data.penaltiesCount,
      data.feedbackSubmitted,
      data.metadata,
      new Date(),
      new Date()
    );

    const createdReport = await this.userReportRepository.create(report);

    this.logger.info("User report generated", {
      reportId: createdReport.id,
      userId: createdReport.userId,
    });

    return createdReport;
  }

  /**
   * Obtener reporte por ID
   */
  async getUserReportById(id: string): Promise<UserReportEntity> {
    const report = await this.userReportRepository.findById(id);
    if (!report) {
      throw new NotFoundException(`User report with ID ${id} not found`);
    }
    return report;
  }

  /**
   * Obtener reportes con filtros
   */
  async getUserReports(
    query: PaginationQuery,
    filters?: {
      userId?: string;
      userType?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ reports: UserReportEntity[]; meta: PaginationMeta }> {
    return await this.userReportRepository.findMany(query, filters);
  }

  /**
   * Eliminar reporte
   */
  async deleteUserReport(id: string): Promise<boolean> {
    const report = await this.getUserReportById(id);
    const deleted = await this.userReportRepository.delete(report.id);

    this.logger.info("User report deleted", { reportId: id });

    return deleted;
  }
}
