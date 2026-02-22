/**
 * Cliente HTTP Type-Safe para Monitoreo y Vigilancia
 *
 * Integración con backend Bookly Stockpile Service via MonitoringController
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import type { ApiResponse } from "@/types/api/response";
import type {
  ActiveReservationView,
  CheckInOutStats,
  VigilanceAlert,
} from "@/types/entities/checkInOut";
import { STOCKPILE_ENDPOINTS } from "./endpoints";

export interface MonitoringFilters {
  resourceId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  includeIncidents?: boolean;
}

export class MonitoringClient {
  /**
   * Obtiene check-ins activos para el dashboard de vigilancia
   */
  static async getActiveCheckIns(filters?: MonitoringFilters): Promise<ApiResponse<ActiveReservationView[]>> {
    return httpClient.get<ActiveReservationView[]>(STOCKPILE_ENDPOINTS.MONITORING_ACTIVE, {
      params: filters,
    });
  }

  /**
   * Obtiene check-ins vencidos (sin check-out después de la hora esperada)
   */
  static async getOverdueCheckIns(): Promise<ApiResponse<ActiveReservationView[]>> {
    return httpClient.get<ActiveReservationView[]>(STOCKPILE_ENDPOINTS.MONITORING_OVERDUE);
  }

  /**
   * Obtiene estadísticas generales del dashboard de vigilancia
   */
  static async getStatistics(startDate?: string, endDate?: string): Promise<ApiResponse<CheckInOutStats>> {
    return httpClient.get<CheckInOutStats>(STOCKPILE_ENDPOINTS.MONITORING_STATS, {
      params: { startDate, endDate },
    });
  }

  /**
   * Obtiene alertas activas para el dashboard
   */
  static async getActiveAlerts(): Promise<ApiResponse<VigilanceAlert[]>> {
    return httpClient.get<VigilanceAlert[]>(STOCKPILE_ENDPOINTS.MONITORING_ALERTS);
  }

  /**
   * Resuelve una incidencia/alerta
   */
  static async resolveIncident(incidentId: string, resolution: string): Promise<ApiResponse<any>> {
    return httpClient.post<any>(STOCKPILE_ENDPOINTS.RESOLVE_INCIDENT(incidentId), {
      resolution,
    });
  }
}
