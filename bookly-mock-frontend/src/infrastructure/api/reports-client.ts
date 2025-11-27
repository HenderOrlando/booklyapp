/**
 * ReportsClient - Cliente HTTP para gestión de reportes
 *
 * Proporciona métodos type-safe para:
 * - Generar reportes de uso, recursos, usuarios
 * - Obtener dashboards y KPIs
 * - Exportar reportes en diferentes formatos
 * - Analíticas del sistema
 *
 * Todos los métodos usan BaseHttpClient para aprovechar interceptors.
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import type { ApiResponse } from "@/types/api/response";
import type {
  Analytics,
  DashboardData,
  DemandFilters,
  DemandReport,
  KPIs,
  OccupancyFilters,
  OccupancyReport,
  ResourceReport,
  UsageFilters,
  UsageReport,
  UserReport,
} from "@/types/entities/report";

export class ReportsClient {
  /**
   * Obtener reporte de uso general
   */
  static async getUsageReport(
    filters?: UsageFilters
  ): Promise<ApiResponse<UsageReport>> {
    return await httpClient.get<UsageReport>("usage-reports", {
      params: filters,
    });
  }

  /**
   * Obtener reporte de un recurso específico
   */
  static async getResourceReport(
    resourceId: string
  ): Promise<ApiResponse<ResourceReport>> {
    return await httpClient.get<ResourceReport>(
      `dashboard/occupancy?resourceId=${resourceId}`
    );
  }

  /**
   * Obtener reporte de un usuario específico
   */
  static async getUserReport(userId: string): Promise<ApiResponse<UserReport>> {
    return await httpClient.get<UserReport>(`user-reports?userId=${userId}`);
  }

  /**
   * Obtener reporte de demanda
   */
  static async getDemandReport(
    filters?: DemandFilters
  ): Promise<ApiResponse<DemandReport>> {
    return await httpClient.get<DemandReport>("demand-reports", {
      params: filters,
    });
  }

  /**
   * Obtener reporte de ocupación
   */
  static async getOccupancyReport(
    filters?: OccupancyFilters
  ): Promise<ApiResponse<OccupancyReport>> {
    return await httpClient.get<OccupancyReport>("dashboard/occupancy", {
      params: filters,
    });
  }

  /**
   * Exportar reporte a CSV
   */
  static async exportToCSV(reportId: string): Promise<ApiResponse<Blob>> {
    return await httpClient.get<Blob>(`${reportId}/export/csv`);
  }

  /**
   * Exportar reporte a PDF
   */
  static async exportToPDF(reportId: string): Promise<ApiResponse<Blob>> {
    return await httpClient.get<Blob>(`${reportId}/export/pdf`);
  }

  /**
   * Obtener datos del dashboard
   */
  static async getDashboardData(
    dashboardId: string
  ): Promise<ApiResponse<DashboardData>> {
    return await httpClient.get<DashboardData>(`dashboard/${dashboardId}`);
  }

  /**
   * Obtener KPIs generales
   */
  static async getKPIs(): Promise<ApiResponse<KPIs>> {
    return await httpClient.get<KPIs>("dashboard/kpis");
  }

  /**
   * Obtener analíticas por período
   */
  static async getAnalytics(period: string): Promise<ApiResponse<Analytics>> {
    return await httpClient.get<Analytics>(`dashboard/trends?period=${period}`);
  }
}
