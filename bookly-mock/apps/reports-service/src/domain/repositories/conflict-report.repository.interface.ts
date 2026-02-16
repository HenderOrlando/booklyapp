import { PaginationMeta, PaginationQuery } from "@libs/common";
import { ConflictReportEntity } from "../entities/conflict-report.entity";

/**
 * Conflict Report Repository Interface
 * Interfaz para el repositorio de reportes de conflictos (RF-38)
 */
export interface IConflictReportRepository {
  /**
   * Crear reporte de conflictos
   */
  create(report: ConflictReportEntity): Promise<ConflictReportEntity>;

  /**
   * Buscar reporte por ID
   */
  findById(id: string): Promise<ConflictReportEntity | null>;

  /**
   * Buscar reportes con paginación
   */
  findMany(
    query: PaginationQuery,
    filters?: {
      resourceId?: string;
      resourceType?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ reports: ConflictReportEntity[]; meta: PaginationMeta }>;

  /**
   * Buscar reportes por recurso
   */
  findByResource(
    resourceId: string,
    query: PaginationQuery
  ): Promise<{ reports: ConflictReportEntity[]; meta: PaginationMeta }>;

  /**
   * Eliminar reporte
   */
  delete(id: string): Promise<boolean>;

  /**
   * Contar reportes
   */
  count(filters?: {
    resourceId?: string;
    resourceType?: string;
  }): Promise<number>;
}
