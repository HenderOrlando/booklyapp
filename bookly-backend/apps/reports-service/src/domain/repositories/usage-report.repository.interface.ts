import { PaginationMeta, PaginationQuery } from "@libs/common";
import { UsageReportEntity } from "../entities";

/**
 * Usage Report Repository Interface
 * Interfaz para el repositorio de reportes de uso
 */
export interface IUsageReportRepository {
  /**
   * Crear reporte de uso
   */
  create(report: UsageReportEntity): Promise<UsageReportEntity>;

  /**
   * Buscar reporte por ID
   */
  findById(id: string): Promise<UsageReportEntity | null>;

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
  ): Promise<{ reports: UsageReportEntity[]; meta: PaginationMeta }>;

  /**
   * Buscar reportes por recurso
   */
  findByResource(
    resourceId: string,
    query: PaginationQuery
  ): Promise<{ reports: UsageReportEntity[]; meta: PaginationMeta }>;

  /**
   * Buscar reportes por tipo de recurso
   */
  findByResourceType(
    resourceType: string,
    query: PaginationQuery
  ): Promise<{ reports: UsageReportEntity[]; meta: PaginationMeta }>;

  /**
   * Buscar reportes por rango de fechas
   */
  findByDateRange(
    startDate: Date,
    endDate: Date,
    query: PaginationQuery
  ): Promise<{ reports: UsageReportEntity[]; meta: PaginationMeta }>;

  /**
   * Actualizar reporte
   */
  update(
    id: string,
    data: Partial<UsageReportEntity>
  ): Promise<UsageReportEntity>;

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
