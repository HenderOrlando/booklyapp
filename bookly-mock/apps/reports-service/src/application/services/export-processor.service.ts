import {
  ReportDataType,
  ReportsExportFormat,
  ReportsExportStatus,
} from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as fs from "fs/promises";
import { Model } from "mongoose";
import * as path from "path";
import { ExportEntity } from '@reports/domain/entities";
import { IExportRepository } from '@reports/domain/repositories/export.repository.interface";
import { DemandReport } from '@reports/infrastructure/schemas/demand-report.schema";
import { UsageReport } from '@reports/infrastructure/schemas/usage-report.schema";
import { UserReport } from '@reports/infrastructure/schemas/user-report.schema";
import { ExportService } from "./export.service";
import {
  CsvGeneratorService,
  ExcelGeneratorService,
  PdfGeneratorService,
} from "./generators";

const logger = createLogger("ExportProcessorService");

/**
 * Export Processor Service
 * Servicio para procesar exportaciones de forma asíncrona
 */
@Injectable()
export class ExportProcessorService {
  private readonly exportsDir = path.join(process.cwd(), "exports");

  constructor(
    @Inject("IExportRepository")
    private readonly exportRepository: IExportRepository,
    private readonly exportService: ExportService,
    private readonly csvGenerator: CsvGeneratorService,
    private readonly pdfGenerator: PdfGeneratorService,
    private readonly excelGenerator: ExcelGeneratorService,
    @InjectModel(UsageReport.name)
    private readonly usageReportModel: Model<UsageReport>,
    @InjectModel(UserReport.name)
    private readonly userReportModel: Model<UserReport>,
    @InjectModel(DemandReport.name)
    private readonly demandReportModel: Model<DemandReport>
  ) {
    this.ensureExportsDirectory();
  }

  /**
   * Procesar exportación solicitada
   */
  async processExport(exportId: string): Promise<void> {
    try {
      logger.info("Processing export", { exportId });

      // Obtener exportación
      const exportEntity = await this.exportRepository.findById(exportId);

      if (!exportEntity) {
        logger.error(
          "Export not found",
          new Error(`Export ${exportId} not found`)
        );
        return;
      }

      // Actualizar a PROCESSING
      await this.exportService.updateExportStatus(
        exportId,
        ReportsExportStatus.PROCESSING
      );

      // Obtener datos del reporte
      const reportData = await this.getReportData(
        exportEntity.reportType,
        exportEntity.filters
      );

      if (!reportData) {
        throw new Error(
          `No data found for report type: ${exportEntity.reportType}`
        );
      }

      // Generar archivo según formato
      const { filePath, fileSize } = await this.generateFile(
        exportEntity,
        reportData
      );

      // Actualizar a COMPLETED
      await this.exportService.updateExportStatus(
        exportId,
        ReportsExportStatus.COMPLETED,
        filePath,
        fileSize
      );

      logger.info("Export processed successfully", {
        exportId,
        filePath,
        fileSize,
      });
    } catch (error: any) {
      logger.error("Failed to process export", error);

      // Actualizar a FAILED
      await this.exportService.updateExportStatus(
        exportId,
        ReportsExportStatus.FAILED,
        undefined,
        undefined,
        error.message
      );
    }
  }

  /**
   * Obtener datos del reporte
   */
  private async getReportData(
    reportType: ReportDataType,
    filters: Record<string, any>
  ): Promise<any> {
    try {
      switch (reportType) {
        case ReportDataType.USAGE:
          return await this.usageReportModel
            .findOne(filters)
            .sort({ createdAt: -1 })
            .exec();

        case ReportDataType.USER:
          return await this.userReportModel
            .findOne(filters)
            .sort({ createdAt: -1 })
            .exec();

        case ReportDataType.DEMAND:
          return await this.demandReportModel
            .findOne(filters)
            .sort({ createdAt: -1 })
            .exec();

        default:
          logger.warn("Unknown report type", { reportType });
          return null;
      }
    } catch (error: any) {
      logger.error("Failed to get report data", error);
      throw error;
    }
  }

  /**
   * Generar archivo según formato
   */
  private async generateFile(
    exportEntity: ExportEntity,
    reportData: any
  ): Promise<{ filePath: string; fileSize: number }> {
    try {
      const timestamp = Date.now();
      const fileName = `${exportEntity.reportType}_${timestamp}`;
      let content: Buffer | string;
      let extension: string;

      switch (exportEntity.format) {
        case ReportsExportFormat.CSV:
          extension = "csv";
          content = await this.generateCsvContent(
            exportEntity.reportType,
            reportData
          );
          break;

        case ReportsExportFormat.PDF:
          extension = "pdf";
          content = await this.generatePdfContent(
            exportEntity.reportType,
            reportData
          );
          break;

        case ReportsExportFormat.EXCEL:
          extension = "xlsx";
          content = await this.generateExcelContent(
            exportEntity.reportType,
            reportData
          );
          break;

        default:
          throw new Error(`Unsupported format: ${exportEntity.format}`);
      }

      const filePath = path.join(this.exportsDir, `${fileName}.${extension}`);

      // Guardar archivo
      await fs.writeFile(
        filePath,
        typeof content === "string" ? content : content
      );

      // Obtener tamaño del archivo
      const stats = await fs.stat(filePath);

      return {
        filePath: filePath,
        fileSize: stats.size,
      };
    } catch (error: any) {
      logger.error("Failed to generate file", error);
      throw error;
    }
  }

  /**
   * Generar contenido CSV
   */
  private async generateCsvContent(
    reportType: ReportDataType,
    reportData: any
  ): Promise<string> {
    switch (reportType) {
      case ReportDataType.USAGE:
        return await this.csvGenerator.generateUsageReportCsv(reportData);

      case ReportDataType.USER:
        return await this.csvGenerator.generateUserReportCsv(reportData);

      default:
        return await this.csvGenerator.generate([reportData]);
    }
  }

  /**
   * Generar contenido PDF
   */
  private async generatePdfContent(
    reportType: ReportDataType,
    reportData: any
  ): Promise<Buffer> {
    switch (reportType) {
      case ReportDataType.USAGE:
        return await this.pdfGenerator.generateUsageReportPdf(reportData);

      case ReportDataType.USER:
        return await this.pdfGenerator.generateUserReportPdf(reportData);

      case ReportDataType.DEMAND:
        return await this.pdfGenerator.generateDemandReportPdf(reportData);

      default:
        throw new Error(`PDF generation not supported for ${reportType}`);
    }
  }

  /**
   * Generar contenido Excel
   */
  private async generateExcelContent(
    reportType: ReportDataType,
    reportData: any
  ): Promise<Buffer> {
    switch (reportType) {
      case ReportDataType.USAGE:
        return await this.excelGenerator.generateUsageReportExcel(reportData);

      case ReportDataType.USER:
        return await this.excelGenerator.generateUserReportExcel(reportData);

      default:
        return await this.excelGenerator.generate([reportData]);
    }
  }

  /**
   * Asegurar que existe el directorio de exportaciones
   */
  private async ensureExportsDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.exportsDir, { recursive: true });
      logger.debug("Exports directory ready", { path: this.exportsDir });
    } catch (error: any) {
      logger.error("Failed to create exports directory", error);
    }
  }
}
