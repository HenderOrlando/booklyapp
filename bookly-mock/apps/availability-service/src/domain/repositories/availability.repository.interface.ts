import { WeekDay } from "@libs/common/enums";
import { PaginationMeta, PaginationQuery } from "@libs/common";
import { AvailabilityEntity } from "../entities/availability.entity";

/**
 * Availability Repository Interface
 * Define los métodos para acceso y persistencia de disponibilidad
 */
export interface IAvailabilityRepository {
  /**
   * Crea una nueva disponibilidad
   */
  create(availability: AvailabilityEntity): Promise<AvailabilityEntity>;

  /**
   * Busca una disponibilidad por ID
   */
  findById(id: string): Promise<AvailabilityEntity | null>;

  /**
   * Busca múltiples disponibilidades con paginación
   */
  findMany(
    query: PaginationQuery,
    filters?: {
      resourceId?: string;
      dayOfWeek?: WeekDay;
      isAvailable?: boolean;
    }
  ): Promise<{ availabilities: AvailabilityEntity[]; meta: PaginationMeta }>;

  /**
   * Busca disponibilidades por recurso
   */
  findByResource(resourceId: string): Promise<AvailabilityEntity[]>;

  /**
   * Busca disponibilidades por día de la semana
   */
  findByDayOfWeek(
    resourceId: string,
    dayOfWeek: WeekDay
  ): Promise<AvailabilityEntity[]>;

  /**
   * Busca disponibilidades activas en una fecha específica
   */
  findActiveOn(resourceId: string, date: Date): Promise<AvailabilityEntity[]>;

  /**
   * Busca disponibilidades que se solapan con un horario
   */
  findOverlapping(
    resourceId: string,
    dayOfWeek: WeekDay,
    startTime: string,
    endTime: string
  ): Promise<AvailabilityEntity[]>;

  /**
   * Actualiza una disponibilidad
   */
  update(
    id: string,
    data: Partial<AvailabilityEntity>
  ): Promise<AvailabilityEntity>;

  /**
   * Elimina una disponibilidad
   */
  delete(id: string): Promise<boolean>;

  /**
   * Cuenta disponibilidades con filtros opcionales
   */
  count(filters?: {
    resourceId?: string;
    isAvailable?: boolean;
  }): Promise<number>;

  /**
   * Verifica si existe disponibilidad para un recurso
   */
  existsForResource(resourceId: string): Promise<boolean>;

  /**
   * Busca disponibilidades en un rango de fechas
   * Retorna los recursos que tienen disponibilidad configurada
   */
  findAvailableInDateRange(
    startDate: Date,
    endDate: Date,
    filters?: {
      timeStart?: string;
      timeEnd?: string;
      isAvailable?: boolean;
    }
  ): Promise<AvailabilityEntity[]>;

  /**
   * Busca disponibilidades por múltiples IDs de recursos
   */
  findByResourceIds(resourceIds: string[]): Promise<AvailabilityEntity[]>;
}
