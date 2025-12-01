import { ReportsExportStatus } from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ExportEntity } from '@reports/domain/entities";
import { IExportRepository } from '@reports/domain/repositories/export.repository.interface";
import { Export } from "../schemas/export.schema";

const logger = createLogger("ExportRepository");

/**
 * Export Repository
 * Implementación de persistencia para exportaciones con Mongoose
 */
@Injectable()
export class ExportRepository implements IExportRepository {
  constructor(
    @InjectModel(Export.name)
    private readonly exportModel: Model<Export>
  ) {}

  /**
   * Guardar exportación
   */
  async save(exportEntity: ExportEntity): Promise<ExportEntity> {
    try {
      const exportData = {
        userId: exportEntity.userId,
        reportType: exportEntity.reportType,
        format: exportEntity.format,
        status: exportEntity.status,
        filters: exportEntity.filters,
        filePath: exportEntity.filePath,
        fileSize: exportEntity.fileSize,
        errorMessage: exportEntity.errorMessage,
        metadata: exportEntity.metadata,
        requestedAt: exportEntity.requestedAt,
        completedAt: exportEntity.completedAt,
      };

      let savedExport: any;

      if (exportEntity.id) {
        // Actualizar existente
        savedExport = await this.exportModel.findByIdAndUpdate(
          exportEntity.id,
          exportData,
          { new: true }
        );
      } else {
        // Crear nuevo
        savedExport = await this.exportModel.create(exportData);
      }

      logger.debug("Export saved", {
        exportId: savedExport._id,
        userId: exportEntity.userId,
        format: exportEntity.format,
      });

      return this.toDomain(savedExport);
    } catch (error: any) {
      logger.error("Failed to save export", error);
      throw error;
    }
  }

  /**
   * Buscar por ID
   */
  async findById(id: string): Promise<ExportEntity | null> {
    try {
      const exportDoc = await this.exportModel.findById(id).exec();
      return exportDoc ? this.toDomain(exportDoc) : null;
    } catch (error: any) {
      logger.error("Failed to find export by id", error, { id });
      throw error;
    }
  }

  /**
   * Buscar por usuario
   */
  async findByUser(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ exports: ExportEntity[]; total: number }> {
    try {
      const skip = (page - 1) * limit;

      const [exports, total] = await Promise.all([
        this.exportModel
          .find({ userId })
          .sort({ requestedAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.exportModel.countDocuments({ userId }),
      ]);

      return {
        exports: exports.map((e) => this.toDomain(e)),
        total,
      };
    } catch (error: any) {
      logger.error("Failed to find exports by user", error, { userId });
      throw error;
    }
  }

  /**
   * Buscar por estado
   */
  async findByStatus(
    status: ReportsExportStatus,
    page: number = 1,
    limit: number = 50
  ): Promise<ExportEntity[]> {
    try {
      const skip = (page - 1) * limit;

      const exports = await this.exportModel
        .find({ status })
        .sort({ requestedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      return exports.map((e) => this.toDomain(e));
    } catch (error: any) {
      logger.error("Failed to find exports by status", error, { status });
      throw error;
    }
  }

  /**
   * Actualizar estado
   */
  async updateStatus(
    id: string,
    status: ReportsExportStatus,
    filePath?: string,
    fileSize?: number,
    errorMessage?: string
  ): Promise<ExportEntity | null> {
    try {
      const updateData: any = {
        status,
      };

      if (filePath) updateData.filePath = filePath;
      if (fileSize) updateData.fileSize = fileSize;
      if (errorMessage) updateData.errorMessage = errorMessage;

      if (
        status === ReportsExportStatus.COMPLETED ||
        status === ReportsExportStatus.FAILED
      ) {
        updateData.completedAt = new Date();
      }

      const updated = await this.exportModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );

      if (updated) {
        logger.info("Export status updated", {
          exportId: id,
          status,
        });
        return this.toDomain(updated);
      }

      return null;
    } catch (error: any) {
      logger.error("Failed to update export status", error, { id, status });
      throw error;
    }
  }

  /**
   * Eliminar exportaciones antiguas
   */
  async deleteOlderThan(date: Date): Promise<number> {
    try {
      const result = await this.exportModel.deleteMany({
        requestedAt: { $lt: date },
        status: {
          $in: [ReportsExportStatus.COMPLETED, ReportsExportStatus.FAILED],
        },
      });

      logger.info("Deleted old exports", {
        deletedCount: result.deletedCount,
        beforeDate: date,
      });

      return result.deletedCount || 0;
    } catch (error: any) {
      logger.error("Failed to delete old exports", error);
      throw error;
    }
  }

  /**
   * Convertir documento Mongoose a entidad de dominio
   */
  private toDomain(doc: any): ExportEntity {
    return new ExportEntity(
      doc._id.toString(),
      doc.userId,
      doc.reportType,
      doc.format,
      doc.status,
      doc.filters,
      doc.filePath,
      doc.fileSize,
      doc.errorMessage,
      doc.metadata,
      doc.requestedAt,
      doc.completedAt
    );
  }
}
