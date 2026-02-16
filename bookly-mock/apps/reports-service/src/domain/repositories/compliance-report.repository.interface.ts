import { PaginationMeta, PaginationQuery } from "@libs/common";
import { ComplianceReportEntity } from "../entities/compliance-report.entity";

/**
 * Compliance Report Repository Interface
 * Interfaz para el repositorio de reportes de cumplimiento (RF-39)
 */
export interface IComplianceReportRepository {
  /**
   * Crear reporte de cumplimiento
   */
  create(report: ComplianceReportEntity): Promise<ComplianceReportEntity>;

  /**
   * Buscar reporte por ID
   */
  findById(id: string): Promise<ComplianceReportEntity | null>;

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
  ): Promise<{ reports: ComplianceReportEntity[]; meta: PaginationMeta }>;

  /**
   * Buscar reportes por recurso
   */
  findByResource(
    resourceId: string,
    query: PaginationQuery
  ): Promise<{ reports: ComplianceReportEntity[]; meta: PaginationMeta }>;

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
