import { PaginationMeta, PaginationQuery } from "@libs/common";
import { DemandReportEntity } from "../entities";

/**
 * Demand Report Repository Interface
 * Interfaz para el repositorio de reportes de demanda
 */
export interface IDemandReportRepository {
  /**
   * Crear reporte de demanda
   */
  create(report: DemandReportEntity): Promise<DemandReportEntity>;

  /**
   * Buscar reporte por ID
   */
  findById(id: string): Promise<DemandReportEntity | null>;

  /**
   * Buscar reportes con paginación
   */
  findMany(
    query: PaginationQuery,
    filters?: {
      resourceType?: string;
      programId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ reports: DemandReportEntity[]; meta: PaginationMeta }>;

  /**
   * Buscar reportes por tipo de recurso
   */
  findByResourceType(
    resourceType: string,
    query: PaginationQuery
  ): Promise<{ reports: DemandReportEntity[]; meta: PaginationMeta }>;

  /**
   * Buscar reportes por programa
   */
  findByProgram(
    programId: string,
    query: PaginationQuery
  ): Promise<{ reports: DemandReportEntity[]; meta: PaginationMeta }>;

  /**
   * Buscar reportes por rango de fechas
   */
  findByDateRange(
    startDate: Date,
    endDate: Date,
    query: PaginationQuery
  ): Promise<{ reports: DemandReportEntity[]; meta: PaginationMeta }>;

  /**
   * Actualizar reporte
   */
  update(
    id: string,
    data: Partial<DemandReportEntity>
  ): Promise<DemandReportEntity>;

  /**
   * Eliminar reporte
   */
  delete(id: string): Promise<boolean>;

  /**
   * Contar reportes
   */
  count(filters?: {
    resourceType?: string;
    programId?: string;
  }): Promise<number>;
}
