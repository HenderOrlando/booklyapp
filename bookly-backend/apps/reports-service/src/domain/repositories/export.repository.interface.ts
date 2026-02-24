import { ReportsExportStatus } from "@libs/common/enums";
import { ExportEntity } from "../entities";

/**
 * Export Repository Interface
 * Define contrato para persistencia de exportaciones
 */
export interface IExportRepository {
  /**
   * Guardar exportación
   */
  save(exportEntity: ExportEntity): Promise<ExportEntity>;

  /**
   * Buscar por ID
   */
  findById(id: string): Promise<ExportEntity | null>;

  /**
   * Buscar por usuario
   */
  findByUser(
    userId: string,
    page: number,
    limit: number
  ): Promise<{ exports: ExportEntity[]; total: number }>;

  /**
   * Buscar por estado
   */
  findByStatus(
    status: ReportsExportStatus,
    page: number,
    limit: number
  ): Promise<ExportEntity[]>;

  /**
   * Actualizar estado
   */
  updateStatus(
    id: string,
    status: ReportsExportStatus,
    filePath?: string,
    fileSize?: number,
    errorMessage?: string
  ): Promise<ExportEntity | null>;

  /**
   * Eliminar exportaciones antiguas
   */
  deleteOlderThan(date: Date): Promise<number>;
}
