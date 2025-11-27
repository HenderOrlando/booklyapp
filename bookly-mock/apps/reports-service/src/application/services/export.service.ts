import {
  ReportDataType,
  ReportsExportFormat,
  ReportsExportStatus,
} from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import { Inject, Injectable } from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { ExportEntity } from "../../domain/entities";
import { IExportRepository } from "../../domain/repositories/export.repository.interface";

const logger = createLogger("ExportService");

/**
 * Export Service
 * Servicio principal para gestión de exportaciones
 */
@Injectable()
export class ExportService {
  constructor(
    @Inject("IExportRepository")
    private readonly exportRepository: IExportRepository,
    private readonly eventBus: EventBusService
  ) {}

  /**
   * Crear solicitud de exportación
   */
  async requestExport(
    userId: string,
    reportType: ReportDataType,
    format: ReportsExportFormat,
    filters: Record<string, any>
  ): Promise<ExportEntity> {
    try {
      logger.info("Creating export request", {
        userId,
        reportType,
        format,
      });

      // Crear entidad de exportación
      const exportEntity = new ExportEntity(
        "",
        userId,
        reportType,
        format,
        ReportsExportStatus.PENDING,
        filters,
        undefined,
        undefined,
        undefined,
        { createdBy: userId }
      );

      // Guardar en base de datos
      const savedExport = await this.exportRepository.save(exportEntity);

      // Publicar evento para procesamiento asíncrono
      await this.eventBus.publish("reports.export.requested", {
        eventId: uuidv4(),
        eventType: "reports.export.requested",
        timestamp: new Date(),
        service: "reports-service",
        data: {
          exportId: savedExport.id,
          userId: savedExport.userId,
          reportType: savedExport.reportType,
          format: savedExport.format,
          filters: savedExport.filters,
        },
        metadata: {
          aggregateId: savedExport.id,
        },
      });

      logger.info("Export request created", {
        exportId: savedExport.id,
        userId,
      });

      return savedExport;
    } catch (error: any) {
      logger.error("Failed to create export request", error);
      throw error;
    }
  }

  /**
   * Obtener estado de exportación
   */
  async getExportStatus(exportId: string): Promise<ExportEntity | null> {
    try {
      const exportEntity = await this.exportRepository.findById(exportId);

      if (!exportEntity) {
        logger.warn("Export not found", { exportId });
        return null;
      }

      return exportEntity;
    } catch (error: any) {
      logger.error("Failed to get export status", error);
      throw error;
    }
  }

  /**
   * Obtener historial de exportaciones del usuario
   */
  async getUserExportHistory(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    exports: ExportEntity[];
    total: number;
    page: number;
    pages: number;
  }> {
    try {
      const { exports, total } = await this.exportRepository.findByUser(
        userId,
        page,
        limit
      );

      const pages = Math.ceil(total / limit);

      logger.debug("User export history retrieved", {
        userId,
        exportsCount: exports.length,
        total,
      });

      return {
        exports,
        total,
        page,
        pages,
      };
    } catch (error: any) {
      logger.error("Failed to get user export history", error);
      throw error;
    }
  }

  /**
   * Actualizar estado de exportación (usado por procesadores)
   */
  async updateExportStatus(
    exportId: string,
    status: ReportsExportStatus,
    filePath?: string,
    fileSize?: number,
    errorMessage?: string
  ): Promise<ExportEntity | null> {
    try {
      const updated = await this.exportRepository.updateStatus(
        exportId,
        status,
        filePath,
        fileSize,
        errorMessage
      );

      if (updated) {
        // Publicar evento de estado actualizado
        await this.eventBus.publish("reports.export.statusChanged", {
          eventId: uuidv4(),
          eventType: "reports.export.statusChanged",
          timestamp: new Date(),
          service: "reports-service",
          data: {
            exportId,
            status,
            filePath,
            fileSize,
            errorMessage,
          },
          metadata: {
            aggregateId: exportId,
          },
        });

        logger.info("Export status updated", {
          exportId,
          status,
        });
      }

      return updated;
    } catch (error: any) {
      logger.error("Failed to update export status", error);
      throw error;
    }
  }

  /**
   * Limpiar exportaciones antiguas (más de 30 días)
   */
  async cleanupOldExports(): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);

      const deletedCount =
        await this.exportRepository.deleteOlderThan(cutoffDate);

      logger.info("Old exports cleaned", { deletedCount });

      return deletedCount;
    } catch (error: any) {
      logger.error("Failed to cleanup old exports", error);
      throw error;
    }
  }

  /**
   * Obtener información de archivo para descarga
   */
  async getExportFile(
    exportId: string,
    userId: string
  ): Promise<{
    filePath: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
  } | null> {
    try {
      const exportEntity = await this.exportRepository.findById(exportId);

      if (!exportEntity) {
        logger.warn("Export not found for download", { exportId });
        return null;
      }

      // Verificar que el export pertenece al usuario
      if (exportEntity.userId !== userId) {
        logger.warn("Unauthorized export download attempt", {
          exportId,
          requestUserId: userId,
          exportUserId: exportEntity.userId,
        });
        return null;
      }

      // Verificar que el export está completado
      if (exportEntity.status !== ReportsExportStatus.COMPLETED) {
        logger.warn("Export not completed yet", {
          exportId,
          status: exportEntity.status,
        });
        return null;
      }

      // Verificar que existe el filePath
      if (!exportEntity.filePath) {
        logger.error(
          "Export completed but no file path",
          new Error(`Export ${exportId} has no file path`)
        );
        return null;
      }

      // Determinar MIME type según formato
      const mimeType = this.getMimeType(exportEntity.format);

      // Generar nombre de archivo
      const fileName = this.generateFileName(
        exportEntity.reportType,
        exportEntity.format
      );

      logger.debug("Export file info retrieved", {
        exportId,
        fileName,
        mimeType,
      });

      return {
        filePath: exportEntity.filePath,
        fileName,
        mimeType,
        fileSize: exportEntity.fileSize || 0,
      };
    } catch (error: any) {
      logger.error("Failed to get export file info", error);
      throw error;
    }
  }

  /**
   * Obtener MIME type según formato
   */
  private getMimeType(format: ReportsExportFormat): string {
    const mimeTypes: Record<ReportsExportFormat, string> = {
      [ReportsExportFormat.CSV]: "text/csv",
      [ReportsExportFormat.PDF]: "application/pdf",
      [ReportsExportFormat.EXCEL]:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };

    return mimeTypes[format] || "application/octet-stream";
  }

  /**
   * Generar nombre de archivo
   */
  private generateFileName(
    reportType: ReportDataType,
    format: ReportsExportFormat
  ): string {
    const extensions: Record<ReportsExportFormat, string> = {
      [ReportsExportFormat.CSV]: "csv",
      [ReportsExportFormat.PDF]: "pdf",
      [ReportsExportFormat.EXCEL]: "xlsx",
    };

    const timestamp = new Date().toISOString().split("T")[0];
    const extension = extensions[format];

    return `reporte_${reportType.toLowerCase()}_${timestamp}.${extension}`;
  }

  /**
   * Generar URL de descarga
   */
  getDownloadUrl(exportId: string): string {
    return `/api/v1/reports/export/${exportId}/download`;
  }
}
