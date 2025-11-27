import { PaginationMeta, PaginationQuery } from "@libs/common";
import { UserReportEntity } from "../entities";

/**
 * User Report Repository Interface
 * Interfaz para el repositorio de reportes de usuario
 */
export interface IUserReportRepository {
  /**
   * Crear reporte de usuario
   */
  create(report: UserReportEntity): Promise<UserReportEntity>;

  /**
   * Buscar reporte por ID
   */
  findById(id: string): Promise<UserReportEntity | null>;

  /**
   * Buscar reportes con paginación
   */
  findMany(
    query: PaginationQuery,
    filters?: {
      userId?: string;
      userType?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ reports: UserReportEntity[]; meta: PaginationMeta }>;

  /**
   * Buscar reportes por usuario
   */
  findByUser(
    userId: string,
    query: PaginationQuery
  ): Promise<{ reports: UserReportEntity[]; meta: PaginationMeta }>;

  /**
   * Buscar reportes por tipo de usuario
   */
  findByUserType(
    userType: string,
    query: PaginationQuery
  ): Promise<{ reports: UserReportEntity[]; meta: PaginationMeta }>;

  /**
   * Buscar reportes por rango de fechas
   */
  findByDateRange(
    startDate: Date,
    endDate: Date,
    query: PaginationQuery
  ): Promise<{ reports: UserReportEntity[]; meta: PaginationMeta }>;

  /**
   * Buscar usuarios confiables
   */
  findReliableUsers(
    query: PaginationQuery
  ): Promise<{ reports: UserReportEntity[]; meta: PaginationMeta }>;

  /**
   * Buscar usuarios con penalizaciones
   */
  findUsersWithPenalties(
    query: PaginationQuery
  ): Promise<{ reports: UserReportEntity[]; meta: PaginationMeta }>;

  /**
   * Actualizar reporte
   */
  update(
    id: string,
    data: Partial<UserReportEntity>
  ): Promise<UserReportEntity>;

  /**
   * Eliminar reporte
   */
  delete(id: string): Promise<boolean>;

  /**
   * Contar reportes
   */
  count(filters?: { userId?: string; userType?: string }): Promise<number>;
}
