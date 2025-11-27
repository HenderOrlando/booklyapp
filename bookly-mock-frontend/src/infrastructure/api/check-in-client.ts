/**
 * Cliente HTTP Type-Safe para Check-in/Check-out
 *
 * Integración con backend Bookly Stockpile Service via API Gateway
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import type { ApiResponse } from "@/types/api/response";
import type {
  CheckInDto,
  CheckInOut,
  CheckOutDto,
} from "@/types/entities/checkInOut";
import { STOCKPILE_ENDPOINTS } from "./endpoints";

export class CheckInClient {
  /**
   * Realiza el check-in de una reserva
   *
   * @param data - Datos del check-in
   * @returns Registro creado
   */
  static async checkIn(data: CheckInDto): Promise<ApiResponse<CheckInOut>> {
    // Adaptar DTO frontend a backend si es necesario
    const payload = {
      reservationId: data.reservationId,
      type: "CHECK_IN",
      notes: data.notes,
      method: data.method,
      qrToken: data.qrCode,
      metadata: {
        location: data.location,
        deviceInfo: navigator.userAgent,
        vigilantId: data.vigilantId,
      },
    };

    return httpClient.post<CheckInOut>(STOCKPILE_ENDPOINTS.CHECKIN, payload);
  }

  /**
   * Realiza el check-out de una reserva
   *
   * @param data - Datos del check-out
   * @returns Registro actualizado
   */
  static async checkOut(data: CheckOutDto): Promise<ApiResponse<CheckInOut>> {
    const payload = {
      checkInId: data.checkInId,
      type: "CHECK_OUT",
      notes: data.notes,
      condition: data.condition,
      issues: data.issues,
      method: data.method,
      metadata: {
        vigilantId: data.vigilantId,
      },
    };

    return httpClient.post<CheckInOut>(STOCKPILE_ENDPOINTS.CHECKOUT, payload);
  }

  /**
   * Obtiene un registro por ID
   *
   * @param id - ID del registro
   * @returns Registro detallado
   */
  static async getById(id: string): Promise<ApiResponse<CheckInOut>> {
    return httpClient.get<CheckInOut>(STOCKPILE_ENDPOINTS.CHECK_IN_BY_ID(id));
  }

  /**
   * Obtiene registro por ID de reserva
   *
   * @param reservationId - ID de la reserva
   * @returns Registro asociado
   */
  static async getByReservation(
    reservationId: string
  ): Promise<ApiResponse<CheckInOut>> {
    return httpClient.get<CheckInOut>(
      STOCKPILE_ENDPOINTS.CHECK_IN_BY_RESERVATION(reservationId)
    );
  }

  /**
   * Obtiene historial del usuario actual
   *
   * @returns Lista de registros
   */
  static async getMyHistory(): Promise<ApiResponse<CheckInOut[]>> {
    return httpClient.get<CheckInOut[]>(STOCKPILE_ENDPOINTS.MY_CHECKIN_HISTORY);
  }

  /**
   * Obtiene todos los check-ins activos (para vigilancia)
   *
   * @returns Lista de registros activos
   */
  static async getActiveCheckIns(): Promise<ApiResponse<CheckInOut[]>> {
    return httpClient.get<CheckInOut[]>(STOCKPILE_ENDPOINTS.ACTIVE_CHECKINS);
  }

  /**
   * Obtiene check-ins vencidos
   *
   * @returns Lista de registros vencidos
   */
  static async getOverdueCheckIns(): Promise<ApiResponse<CheckInOut[]>> {
    return httpClient.get<CheckInOut[]>(STOCKPILE_ENDPOINTS.OVERDUE_CHECKINS);
  }
}
