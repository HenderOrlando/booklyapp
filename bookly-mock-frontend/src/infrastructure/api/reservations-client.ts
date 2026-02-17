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
      AVAILABILITY_ENDPOINTS.RESERVATIONS,
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
      AVAILABILITY_ENDPOINTS.RESERVATION_BY_ID(id),
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
    data: CreateReservationDto,
  ): Promise<ApiResponse<Reservation>> {
    return await httpClient.post<Reservation>(
      AVAILABILITY_ENDPOINTS.RESERVATIONS,
      data,
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
    data: Partial<UpdateReservationDto>,
  ): Promise<ApiResponse<Reservation>> {
    return await httpClient.patch<Reservation>(
      AVAILABILITY_ENDPOINTS.RESERVATION_BY_ID(id),
      data,
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
      AVAILABILITY_ENDPOINTS.RESERVATION_BY_ID(id),
    );
  }

  // ============================================
  // RESERVAS RECURRENTES
  // ============================================

  /**
   * Crea una serie de reservas recurrentes
   *
   * @param data - Datos de la reserva recurrente
   * @returns Serie creada con instancias
   * @example
   * ```typescript
   * const series = await ReservationsClient.createRecurring({
   *   baseReservation: {
   *     resourceId: "res_001",
   *     startDate: "2025-11-26T10:00:00",
   *     endDate: "2025-11-26T12:00:00",
   *     purpose: "Reunión semanal"
   *   },
   *   recurringPattern: {
   *     type: "WEEKLY",
   *     interval: 1,
   *     daysOfWeek: [1, 3, 5], // Lunes, Miércoles, Viernes
   *     endDate: "2026-02-26T23:59:59"
   *   }
   * });
   * ```
   */
  static async createRecurring(data: any): Promise<ApiResponse<any>> {
    return await httpClient.post<any>(AVAILABILITY_ENDPOINTS.RECURRING, data);
  }

  /**
   * Previsualiza una serie recurrente sin crear reservas
   *
   * @param data - Datos para previsualizar
   * @returns Preview de instancias y validación
   */
  static async previewRecurring(data: any): Promise<ApiResponse<any>> {
    return await httpClient.post<any>(
      `${AVAILABILITY_ENDPOINTS.RECURRING}/preview`,
      data,
    );
  }

  /**
   * Obtiene series recurrentes del usuario
   *
   * @param filters - Filtros opcionales
   * @returns Lista de series recurrentes
   */
  static async getRecurringSeries(filters?: any): Promise<ApiResponse<any[]>> {
    return await httpClient.get<any[]>(AVAILABILITY_ENDPOINTS.RECURRING, {
      params: filters,
    });
  }

  /**
   * Obtiene una serie recurrente específica
   *
   * @param seriesId - ID de la serie
   * @param includeInstances - Incluir instancias individuales
   * @returns Serie con sus instancias
   */
  static async getRecurringSeriesById(
    seriesId: string,
    includeInstances: boolean = true,
  ): Promise<ApiResponse<any>> {
    return await httpClient.get<any>(
      `${AVAILABILITY_ENDPOINTS.RECURRING_BY_ID(seriesId)}?includeInstances=${includeInstances}`,
    );
  }

  /**
   * Actualiza una serie recurrente completa
   *
   * @param seriesId - ID de la serie
   * @param data - Datos de actualización
   * @returns Serie actualizada
   */
  static async updateRecurringSeries(
    seriesId: string,
    data: any,
  ): Promise<ApiResponse<any>> {
    return await httpClient.patch<any>(
      AVAILABILITY_ENDPOINTS.RECURRING_BY_ID(seriesId),
      data,
    );
  }

  /**
   * Cancela una serie recurrente completa
   *
   * @param seriesId - ID de la serie
   * @param reason - Motivo de cancelación
   * @returns Confirmación de cancelación
   */
  static async cancelRecurringSeries(
    seriesId: string,
    reason: string,
  ): Promise<ApiResponse<any>> {
    return await httpClient.delete<any>(
      `${AVAILABILITY_ENDPOINTS.RECURRING_BY_ID(seriesId)}/cancel`,
      { data: { reason } },
    );
  }

  /**
   * Cancela una instancia individual de una serie
   *
   * @param instanceId - ID de la instancia
   * @param reason - Motivo de cancelación
   * @returns Confirmación de cancelación
   */
  static async cancelRecurringInstance(
    instanceId: string,
    reason: string,
  ): Promise<ApiResponse<any>> {
    return await httpClient.post<any>(
      `${AVAILABILITY_ENDPOINTS.RECURRING}/series/instances/${instanceId}/cancel`,
      { reason },
    );
  }

  /**
   * Modifica una instancia individual de una serie
   *
   * @param instanceId - ID de la instancia
   * @param data - Datos de modificación
   * @returns Instancia modificada
   */
  static async modifyRecurringInstance(
    instanceId: string,
    data: any,
  ): Promise<ApiResponse<any>> {
    return await httpClient.patch<any>(
      `${AVAILABILITY_ENDPOINTS.RECURRING}/series/instances/${instanceId}`,
      data,
    );
  }

  /**
   * Obtiene analytics de series recurrentes
   *
   * @param filters - Filtros para analytics
   * @returns Métricas y estadísticas
   */
  static async getRecurringAnalytics(filters?: any): Promise<ApiResponse<any>> {
    return await httpClient.get<any>(
      `${AVAILABILITY_ENDPOINTS.RECURRING}/analytics`,
      { params: filters },
    );
  }

  // ============================================
  // CHECK-IN / CHECK-OUT
  // ============================================

  /**
   * Realiza check-in de una reserva
   *
   * @param id - ID de la reserva
   * @returns Confirmación de check-in
   * @example
   * ```typescript
   * const checkin = await ReservationsClient.checkIn("rsv_001");
   * console.log(checkin.data.message); // "Check-in completed successfully"
   * ```
   */
  static async checkIn(id: string): Promise<ApiResponse<any>> {
    return await httpClient.post<any>(
      `${AVAILABILITY_ENDPOINTS.RESERVATION_BY_ID(id)}/check-in`,
    );
  }

  /**
   * Realiza check-out de una reserva
   *
   * @param id - ID de la reserva
   * @returns Confirmación de check-out
   * @example
   * ```typescript
   * const checkout = await ReservationsClient.checkOut("rsv_001");
   * console.log(checkout.data.message); // "Check-out completed successfully"
   * ```
   */
  static async checkOut(id: string): Promise<ApiResponse<any>> {
    return await httpClient.post<any>(
      `${AVAILABILITY_ENDPOINTS.RESERVATION_BY_ID(id)}/check-out`,
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
      buildUrl(AVAILABILITY_ENDPOINTS.RESERVATIONS, filters),
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
    resourceId: string,
  ): Promise<ApiResponse<PaginatedResponse<Reservation>>> {
    return await httpClient.get<PaginatedResponse<Reservation>>(
      buildUrl(AVAILABILITY_ENDPOINTS.RESERVATIONS, { resourceId }),
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
    userId: string,
  ): Promise<ApiResponse<PaginatedResponse<Reservation>>> {
    return await httpClient.get<PaginatedResponse<Reservation>>(
      buildUrl(AVAILABILITY_ENDPOINTS.RESERVATIONS, { userId }),
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
    endDate: string,
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
      }),
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
