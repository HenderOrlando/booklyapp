/**
 * Cliente HTTP Type-Safe para Reservations Service
 *
 * Wrapper sobre BaseHttpClient que proporciona:
 * - Type safety completo con TypeScript
 * - Autocomplete en IDE
 * - Métodos descriptivos
 * - Centralización de rutas API
 * - Interceptors automáticos (auth, logging, error handling)
 * - Auto-refresh de tokens
 * - Fácil migración a fetch/axios cuando se integre backend real
 *
 * @example
 * ```typescript
 * // Antes (MockService directo)
 * const response = await MockService.mockRequest<any>("/reservations", "GET");
 *
 * // Ahora (Con interceptors automáticos)
 * const response = await ReservationsClient.getAll();
 * // ✅ Token agregado automáticamente
 * // ✅ Logging de request/response
 * // ✅ Auto-refresh si token expira
 * ```
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import type { ApiResponse } from "@/types/api/response";
import type {
  CreateReservationDto,
  Reservation,
  UpdateReservationDto,
} from "@/types/entities/reservation";
import { AVAILABILITY_ENDPOINTS, buildUrl } from "./endpoints";
import type { PaginatedResponse } from "./types";

/**
 * Cliente HTTP para operaciones de reservas
 */
export class ReservationsClient {
  /**
   * Obtiene todas las reservas
   *
   * @returns Lista paginada de reservas
   * @example
   * ```typescript
   * const { data } = await ReservationsClient.getAll();
   * console.log(data.items); // Reservation[]
   * ```
   */
  static async getAll(): Promise<ApiResponse<PaginatedResponse<Reservation>>> {
    return await httpClient.get<PaginatedResponse<Reservation>>(
      AVAILABILITY_ENDPOINTS.RESERVATIONS
    );
  }

  /**
   * Obtiene una reserva por su ID
   *
   * @param id - ID de la reserva
   * @returns Reserva encontrada o error 404
   * @example
   * ```typescript
   * const { data, success } = await ReservationsClient.getById("rsv_001");
   * if (success) {
   *   console.log(data.title); // string
   * }
   * ```
   */
  static async getById(id: string): Promise<ApiResponse<Reservation>> {
    return await httpClient.get<Reservation>(
      AVAILABILITY_ENDPOINTS.RESERVATION_BY_ID(id)
    );
  }

  /**
   * Crea una nueva reserva
   *
   * @param data - Datos de la reserva a crear
   * @returns Reserva creada con ID generado
   * @example
   * ```typescript
   * const newReservation = await ReservationsClient.create({
   *   resourceId: "res_001",
   *   userId: "user_001",
   *   title: "Reunión de equipo",
   *   startDate: "2025-11-26T10:00:00",
   *   endDate: "2025-11-26T12:00:00",
   * });
   * ```
   */
  static async create(
    data: CreateReservationDto
  ): Promise<ApiResponse<Reservation>> {
    return await httpClient.post<Reservation>(
      AVAILABILITY_ENDPOINTS.RESERVATIONS,
      data
    );
  }

  /**
   * Actualiza una reserva existente
   *
   * @param id - ID de la reserva a actualizar
   * @param data - Campos a actualizar (parcial)
   * @returns Reserva actualizada
   * @example
   * ```typescript
   * const updated = await ReservationsClient.update("rsv_001", {
   *   title: "Nuevo título",
   *   status: "CONFIRMED",
   * });
   * ```
   */
  static async update(
    id: string,
    data: Partial<UpdateReservationDto>
  ): Promise<ApiResponse<Reservation>> {
    return await httpClient.patch<Reservation>(
      AVAILABILITY_ENDPOINTS.RESERVATION_BY_ID(id),
      data
    );
  }

  /**
   * Cancela una reserva (soft delete)
   *
   * @param id - ID de la reserva a cancelar
   * @returns Reserva con status CANCELLED
   * @example
   * ```typescript
   * const cancelled = await ReservationsClient.cancel("rsv_001");
   * console.log(cancelled.data.status); // "CANCELLED"
   * ```
   */
  static async cancel(id: string): Promise<ApiResponse<Reservation>> {
    return await httpClient.delete<Reservation>(
      AVAILABILITY_ENDPOINTS.RESERVATION_BY_ID(id)
    );
  }

  // ============================================
  // MÉTODOS ADICIONALES (FUTUROS)
  // ============================================

  /**
   * Busca reservas con filtros avanzados
   *
   * @param filters - Filtros de búsqueda
   * @returns Lista filtrada de reservas
   * @future Implementar cuando backend esté disponible
   */
  static async search(filters: {
    resourceId?: string;
    userId?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<Reservation>>> {
    return await httpClient.get<PaginatedResponse<Reservation>>(
      buildUrl(AVAILABILITY_ENDPOINTS.RESERVATIONS, filters)
    );
  }

  /**
   * Obtiene reservas por recurso
   *
   * @param resourceId - ID del recurso
   * @returns Reservas del recurso
   * @future Implementar cuando backend esté disponible
   */
  static async getByResource(
    resourceId: string
  ): Promise<ApiResponse<PaginatedResponse<Reservation>>> {
    return await httpClient.get<PaginatedResponse<Reservation>>(
      buildUrl(AVAILABILITY_ENDPOINTS.RESERVATIONS, { resourceId })
    );
  }

  /**
   * Obtiene reservas por usuario
   *
   * @param userId - ID del usuario
   * @returns Reservas del usuario
   * @future Implementar cuando backend esté disponible
   */
  static async getByUser(
    userId: string
  ): Promise<ApiResponse<PaginatedResponse<Reservation>>> {
    return await httpClient.get<PaginatedResponse<Reservation>>(
      buildUrl(AVAILABILITY_ENDPOINTS.RESERVATIONS, { userId })
    );
  }

  /**
   * Verifica conflictos de horario
   *
   * @param resourceId - ID del recurso
   * @param startDate - Fecha/hora de inicio
   * @param endDate - Fecha/hora de fin
   * @returns true si hay conflicto, false si está disponible
   * @future Implementar cuando backend esté disponible
   */
  static async checkConflicts(
    resourceId: string,
    startDate: string,
    endDate: string
  ): Promise<
    ApiResponse<{
      hasConflict: boolean;
      conflictingReservations: Reservation[];
    }>
  > {
    return await httpClient.get<{
      hasConflict: boolean;
      conflictingReservations: Reservation[];
    }>(
      buildUrl(AVAILABILITY_ENDPOINTS.CHECK_AVAILABILITY, {
        resourceId,
        startDate,
        endDate,
      })
    );
  }
}

/**
 * Hook personalizado para usar con React
 * @future Crear cuando se implemente con SWR o React Query
 */
// export function useReservations() {
//   return useSWR('/reservations', () => ReservationsClient.getAll());
// }
