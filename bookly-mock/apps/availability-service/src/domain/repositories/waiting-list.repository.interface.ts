import { PaginationMeta, PaginationQuery } from "@libs/common";
import { WaitingListEntity } from "../entities/waiting-list.entity";

/**
 * Waiting List Repository Interface
 * Define los métodos para acceso y persistencia de lista de espera
 */
export interface IWaitingListRepository {
  /**
   * Crea una nueva entrada en lista de espera
   */
  create(waitingList: WaitingListEntity): Promise<WaitingListEntity>;

  /**
   * Busca una entrada por ID
   */
  findById(id: string): Promise<WaitingListEntity | null>;

  /**
   * Busca múltiples entradas con paginación y filtros
   */
  findMany(
    query: PaginationQuery,
    filters?: {
      resourceId?: string;
      userId?: string;
      isActive?: boolean;
    }
  ): Promise<{ waitingLists: WaitingListEntity[]; meta: PaginationMeta }>;

  /**
   * Busca entradas por usuario
   */
  findByUser(
    userId: string,
    query: PaginationQuery
  ): Promise<{ waitingLists: WaitingListEntity[]; meta: PaginationMeta }>;

  /**
   * Busca entradas por recurso
   */
  findByResource(
    resourceId: string,
    query: PaginationQuery
  ): Promise<{ waitingLists: WaitingListEntity[]; meta: PaginationMeta }>;

  /**
   * Busca entradas activas por recurso ordenadas por prioridad
   */
  findActiveByResource(resourceId: string): Promise<WaitingListEntity[]>;

  /**
   * Busca entradas activas en un rango de fechas
   */
  findActiveInDateRange(
    resourceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<WaitingListEntity[]>;

  /**
   * Busca entradas que han expirado
   */
  findExpired(): Promise<WaitingListEntity[]>;

  /**
   * Busca la siguiente entrada en la lista de espera
   */
  findNext(resourceId: string): Promise<WaitingListEntity | null>;

  /**
   * Actualiza una entrada
   */
  update(
    id: string,
    data: Partial<WaitingListEntity>
  ): Promise<WaitingListEntity>;

  /**
   * Elimina una entrada
   */
  delete(id: string): Promise<boolean>;

  /**
   * Cuenta entradas con filtros opcionales
   */
  count(filters?: {
    resourceId?: string;
    userId?: string;
    isActive?: boolean;
  }): Promise<number>;

  /**
   * Verifica si un usuario ya está en lista de espera para un recurso
   */
  existsForUser(
    userId: string,
    resourceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<boolean>;
}
