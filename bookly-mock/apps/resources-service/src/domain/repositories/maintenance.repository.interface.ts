import { MaintenanceStatus, MaintenanceType } from "@libs/common/enums";
import { PaginationMeta, PaginationQuery } from "@libs/common";
import { MaintenanceEntity } from "../entities/maintenance.entity";

/**
 * Maintenance Repository Interface
 * Define los métodos para acceder y persistir mantenimientos
 */
export interface IMaintenanceRepository {
  /**
   * Crear un nuevo mantenimiento
   */
  create(maintenance: MaintenanceEntity): Promise<MaintenanceEntity>;

  /**
   * Buscar mantenimiento por ID
   */
  findById(id: string): Promise<MaintenanceEntity | null>;

  /**
   * Buscar múltiples mantenimientos
   */
  findMany(
    query: PaginationQuery,
    filters?: {
      resourceId?: string;
      type?: MaintenanceType;
      status?: MaintenanceStatus;
    }
  ): Promise<{
    maintenances: MaintenanceEntity[];
    meta: PaginationMeta;
  }>;

  /**
   * Buscar mantenimientos por recurso
   */
  findByResource(
    resourceId: string,
    query: PaginationQuery
  ): Promise<{
    maintenances: MaintenanceEntity[];
    meta: PaginationMeta;
  }>;

  /**
   * Buscar mantenimientos programados
   */
  findScheduled(query: PaginationQuery): Promise<{
    maintenances: MaintenanceEntity[];
    meta: PaginationMeta;
  }>;

  /**
   * Buscar mantenimientos en progreso
   */
  findInProgress(): Promise<MaintenanceEntity[]>;

  /**
   * Buscar mantenimientos en un rango de fechas
   */
  findByDateRange(
    startDate: Date,
    endDate: Date,
    query: PaginationQuery
  ): Promise<{
    maintenances: MaintenanceEntity[];
    meta: PaginationMeta;
  }>;

  /**
   * Buscar próximos mantenimientos para un recurso
   */
  findUpcomingByResource(resourceId: string): Promise<MaintenanceEntity[]>;

  /**
   * Actualizar mantenimiento
   */
  update(
    id: string,
    data: Partial<MaintenanceEntity>
  ): Promise<MaintenanceEntity>;

  /**
   * Eliminar mantenimiento
   */
  delete(id: string): Promise<boolean>;

  /**
   * Contar mantenimientos
   */
  count(filters?: { status?: MaintenanceStatus }): Promise<number>;

  /**
   * Actualizar estado de mantenimiento
   */
  updateStatus(id: string, status: MaintenanceStatus): Promise<void>;
}
