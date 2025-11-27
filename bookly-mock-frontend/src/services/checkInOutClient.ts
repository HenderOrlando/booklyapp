import { httpClient } from "@/infrastructure/http/httpClient";
import type {
  ActiveReservationView,
  CheckInDto,
  CheckInOut,
  CheckInOutStats,
  CheckOutDto,
  VigilanceAlert,
} from "@/types/entities/checkInOut";

/**
 * Cliente HTTP para el servicio de Check-in/Check-out (Stockpile Service)
 *
 * Endpoints base: /api/v1/check-in-out
 */

const BASE_PATH = "/api/v1/check-in-out";

/**
 * Realizar check-in de una reserva
 */
export async function performCheckIn(data: CheckInDto): Promise<CheckInOut> {
  const response = await httpClient.post<CheckInOut>(
    `${BASE_PATH}/check-in`,
    data
  );
  return response.data;
}

/**
 * Realizar check-out de una reserva
 */
export async function performCheckOut(data: CheckOutDto): Promise<CheckInOut> {
  const response = await httpClient.post<CheckInOut>(
    `${BASE_PATH}/check-out`,
    data
  );
  return response.data;
}

/**
 * Obtener historial de check-in/check-out de una reserva
 */
export async function getCheckInOutHistory(
  reservationId: string
): Promise<CheckInOut[]> {
  const response = await httpClient.get<CheckInOut[]>(
    `${BASE_PATH}/history/${reservationId}`
  );
  return response.data;
}

/**
 * Obtener todas las reservas activas (para panel de vigilancia)
 */
export async function getActiveReservations(): Promise<
  ActiveReservationView[]
> {
  const response = await httpClient.get<ActiveReservationView[]>(
    `${BASE_PATH}/active/all`
  );
  return response.data;
}

/**
 * Obtener reservas con retraso (overdue)
 */
export async function getOverdueReservations(): Promise<
  ActiveReservationView[]
> {
  const response = await httpClient.get<ActiveReservationView[]>(
    `${BASE_PATH}/overdue/all`
  );
  return response.data;
}

/**
 * Obtener estadísticas de check-in/check-out
 */
export async function getCheckInOutStats(
  startDate?: string,
  endDate?: string
): Promise<CheckInOutStats> {
  const params = new URLSearchParams();
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const queryString = params.toString();
  const url = queryString
    ? `${BASE_PATH}/stats?${queryString}`
    : `${BASE_PATH}/stats`;

  const response = await httpClient.get<CheckInOutStats>(url);
  return response.data;
}

/**
 * Obtener alertas de vigilancia activas
 */
export async function getVigilanceAlerts(): Promise<VigilanceAlert[]> {
  const response = await httpClient.get<VigilanceAlert[]>(
    `${BASE_PATH}/vigilance/alerts`
  );
  return response.data;
}

/**
 * Marcar alerta como resuelta
 */
export async function resolveVigilanceAlert(alertId: string): Promise<void> {
  await httpClient.patch(`${BASE_PATH}/vigilance/alerts/${alertId}/resolve`);
}

/**
 * Validar si una reserva puede hacer check-in
 */
export async function validateCheckIn(
  reservationId: string
): Promise<{ valid: boolean; reason?: string }> {
  const response = await httpClient.get<{ valid: boolean; reason?: string }>(
    `${BASE_PATH}/validate/check-in/${reservationId}`
  );
  return response.data;
}

/**
 * Validar si una reserva puede hacer check-out
 */
export async function validateCheckOut(
  reservationId: string
): Promise<{ valid: boolean; reason?: string }> {
  const response = await httpClient.get<{ valid: boolean; reason?: string }>(
    `${BASE_PATH}/validate/check-out/${reservationId}`
  );
  return response.data;
}
