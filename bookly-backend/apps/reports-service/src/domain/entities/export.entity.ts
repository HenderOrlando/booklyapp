import {
  ReportDataType,
  ReportsExportFormat,
  ReportsExportStatus,
} from "@libs/common/enums";

/**
 * Export Entity
 * Entidad para gestión de exportaciones de reportes
 */
export class ExportEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly reportType: ReportDataType,
    public readonly format: ReportsExportFormat,
    public readonly status: ReportsExportStatus,
    public readonly filters: Record<string, any>,
    public readonly filePath?: string,
    public readonly fileSize?: number,
    public readonly errorMessage?: string,
    public readonly metadata?: Record<string, any>,
    public readonly requestedAt: Date = new Date(),
    public readonly completedAt?: Date
  ) {}

  /**
   * Marcar como completado
   */
  markAsCompleted(filePath: string, fileSize: number): ExportEntity {
    return new ExportEntity(
      this.id,
      this.userId,
      this.reportType,
      this.format,
      ReportsExportStatus.COMPLETED,
      this.filters,
      filePath,
      fileSize,
      undefined,
      this.metadata,
      this.requestedAt,
      new Date()
    );
  }

  /**
   * Marcar como fallido
   */
  markAsFailed(errorMessage: string): ExportEntity {
    return new ExportEntity(
      this.id,
      this.userId,
      this.reportType,
      this.format,
      ReportsExportStatus.FAILED,
      this.filters,
      this.filePath,
      this.fileSize,
      errorMessage,
      this.metadata,
      this.requestedAt,
      new Date()
    );
  }

  /**
   * Convertir a objeto plano
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      userId: this.userId,
      reportType: this.reportType,
      format: this.format,
      status: this.status,
      filters: this.filters,
      filePath: this.filePath,
      fileSize: this.fileSize,
      errorMessage: this.errorMessage,
      metadata: this.metadata,
      requestedAt: this.requestedAt,
      completedAt: this.completedAt,
    };
  }

  /**
   * Crear desde datos planos
   */
  static fromData(data: any): ExportEntity {
    return new ExportEntity(
      data.id || data._id?.toString(),
      data.userId,
      data.reportType,
      data.format,
      data.status,
      data.filters,
      data.filePath,
      data.fileSize,
      data.errorMessage,
      data.metadata,
      data.requestedAt instanceof Date
        ? data.requestedAt
        : new Date(data.requestedAt),
      data.completedAt instanceof Date
        ? data.completedAt
        : data.completedAt
          ? new Date(data.completedAt)
          : undefined
    );
  }
}
