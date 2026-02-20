import { ReservationStatus } from "@libs/common/enums";
import { PaginationMeta, PaginationQuery } from "@libs/common";
import { ReservationEntity } from "../entities/reservation.entity";

/**
 * Reservation Repository Interface
 * Define los métodos para acceso y persistencia de reservas
 */
export interface IReservationRepository {
  /**
   * Crea una nueva reserva
   */
  create(reservation: ReservationEntity): Promise<ReservationEntity>;

  /**
   * Busca una reserva por ID
   */
  findById(id: string): Promise<ReservationEntity | null>;

  /**
   * Busca múltiples reservas con paginación y filtros
   */
  findMany(
    query: PaginationQuery,
    filters?: {
      userId?: string;
      resourceId?: string;
      status?: ReservationStatus;
      startDate?: Date;
      endDate?: Date;
      search?: string;
    }
  ): Promise<{ reservations: ReservationEntity[]; meta: PaginationMeta }>;

  /**
   * Obtiene estadísticas de reservas
   */
  getStats(filters?: {
    userId?: string;
    resourceId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    active: number;
    upcoming: number;
    today: number;
  }>;

  /**
   * Busca reservas por usuario
   */
  findByUser(
    userId: string,
    query: PaginationQuery
  ): Promise<{ reservations: ReservationEntity[]; meta: PaginationMeta }>;

  /**
   * Busca reservas por recurso
   */
  findByResource(
    resourceId: string,
    query: PaginationQuery
  ): Promise<{ reservations: ReservationEntity[]; meta: PaginationMeta }>;

  /**
   * Busca reservas activas de un recurso
   */
  findActiveByResource(resourceId: string): Promise<ReservationEntity[]>;

  /**
   * Busca reservas en un rango de fechas
   */
  findByDateRange(
    resourceId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ReservationEntity[]>;

  /**
   * Busca reservas que tengan conflictos con un rango de fechas
   */
  findConflicts(
    resourceId: string,
    startDate: Date,
    endDate: Date,
    excludeReservationId?: string
  ): Promise<ReservationEntity[]>;

  /**
   * Busca reservas próximas a iniciar
   */
  findUpcoming(
    minutesAhead: number,
    query: PaginationQuery
  ): Promise<{ reservations: ReservationEntity[]; meta: PaginationMeta }>;

  /**
   * Busca reservas que requieren check-in
   */
  findPendingCheckIn(): Promise<ReservationEntity[]>;

  /**
   * Busca reservas que requieren check-out
   */
  findPendingCheckOut(): Promise<ReservationEntity[]>;

  /**
   * Busca reservas recurrentes
   */
  findRecurring(
    query: PaginationQuery
  ): Promise<{ reservations: ReservationEntity[]; meta: PaginationMeta }>;

  /**
   * Actualiza una reserva
   */
  update(
    id: string,
    data: Partial<ReservationEntity>
  ): Promise<ReservationEntity>;

  /**
   * Elimina una reserva
   */
  delete(id: string): Promise<boolean>;

  /**
   * Cuenta reservas con filtros opcionales
   */
  count(filters?: {
    userId?: string;
    resourceId?: string;
    status?: ReservationStatus;
  }): Promise<number>;

  /**
   * Actualiza el estado de una reserva
   */
  updateStatus(id: string, status: ReservationStatus): Promise<void>;

  /**
   * Busca reservas por calendario externo
   */
  findByExternalCalendar(
    externalCalendarId: string,
    externalCalendarEventId: string
  ): Promise<ReservationEntity | null>;

  /**
   * Busca reservas con filtros avanzados y opciones de paginación
   */
  find(
    filters: any,
    options?: { skip?: number; limit?: number; sort?: any }
  ): Promise<ReservationEntity[]>;

  /**
   * Busca una única reserva con filtros
   */
  findOne(filters: any): Promise<ReservationEntity | null>;
}
