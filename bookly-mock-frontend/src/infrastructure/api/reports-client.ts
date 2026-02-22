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

import { buildUrl, REPORTS_ENDPOINTS } from "@/infrastructure/api/endpoints";
import { httpClient } from "@/infrastructure/http/httpClient";
import type { ApiResponse } from "@/types/api/response";
import type {
  Analytics,
  DashboardAggregatedResponse,
  DashboardData,
  DashboardIncludeSection,
  DashboardPeriodFilter,
  DashboardQueryFilters,
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

const DEFAULT_DASHBOARD_PERIOD: DashboardPeriodFilter = "last30";
const DEFAULT_DASHBOARD_INCLUDE: DashboardIncludeSection[] = [
  "kpis",
  "summary",
  "trend",
  "activity",
  "recentReservations",
  "topResources",
];

function normalizeDashboardPeriod(
  period?: string | DashboardPeriodFilter,
): DashboardPeriodFilter {
  const normalized = String(period || DEFAULT_DASHBOARD_PERIOD).toLowerCase();

  if (normalized === "today" || normalized === "day") {
    return "today";
  }

  if (normalized === "week" || normalized === "weekly") {
    return "week";
  }

  if (normalized === "month" || normalized === "monthly") {
    return "month";
  }

  if (normalized === "custom") {
    return "custom";
  }

  return DEFAULT_DASHBOARD_PERIOD;
}

function mapDashboardPeriodToLegacyTimePeriod(
  period: DashboardPeriodFilter,
): DashboardData["period"] {
  if (period === "today") {
    return "TODAY";
  }

  if (period === "week") {
    return "WEEK";
  }

  if (period === "month" || period === "last30") {
    return "MONTH";
  }

  return "CUSTOM";
}

function mapAggregatedToDashboardData(
  payload: DashboardAggregatedResponse,
): DashboardData {
  return {
    period: mapDashboardPeriodToLegacyTimePeriod(payload.filters.period),
    startDate: payload.filters.from,
    endDate: payload.filters.to,
    kpis: {
      totalReservations: payload.kpis?.totalReservations || 0,
      totalUsers: payload.kpis?.activeReservations || 0,
      totalResources: payload.kpis?.totalResources || 0,
      averageOccupancy: payload.kpis?.utilizationRate || 0,
      satisfactionRate: payload.kpis?.satisfactionRate || 0,
    },
    trends: {
      reservationsChange: payload.kpis?.delta.totalReservationsPct || 0,
      usersChange: payload.kpis?.delta.activeReservationsPct || 0,
      occupancyChange: payload.kpis?.delta.utilizationRatePct || 0,
    },
    topResources: (payload.topResources || []).map((resource) => ({
      id: resource.resourceId,
      name: resource.name,
      reservations: resource.reservations,
    })),
    recentActivity: (payload.recentActivity || []).map((activity) => ({
      id: activity.id,
      type: activity.type,
      description: activity.description,
      timestamp: activity.at,
    })),
  };
}

function mapAggregatedToLegacyKpis(payload: DashboardAggregatedResponse): KPIs {
  return {
    totalReservations: payload.kpis?.totalReservations || 0,
    activeUsers: payload.kpis?.activeReservations || 0,
    totalResources: payload.kpis?.totalResources || 0,
    averageOccupancy: payload.kpis?.utilizationRate || 0,
    satisfactionRate: payload.kpis?.satisfactionRate || 0,
    cancelRate: 0,
    noShowRate: 0,
    period: mapDashboardPeriodToLegacyTimePeriod(payload.filters.period),
    comparedToPrevious: {
      reservations: payload.kpis?.delta.totalReservationsPct || 0,
      users: payload.kpis?.delta.activeReservationsPct || 0,
      occupancy: payload.kpis?.delta.utilizationRatePct || 0,
    },
  };
}

function mapAggregatedToAnalytics(
  payload: DashboardAggregatedResponse,
): Analytics {
  const totalReservations = payload.kpis?.totalReservations || 0;

  return {
    period: payload.filters.period,
    metrics: {
      totalViews: totalReservations,
      totalReservations,
      conversionRate: payload.kpis?.utilizationRate || 0,
      averageSessionDuration: 0,
    },
    userBehavior: {
      mostViewedResources: (payload.topResources || []).map((resource) => ({
        id: resource.resourceId,
        name: resource.name,
        views: resource.reservations,
      })),
      mostReservedResources: (payload.topResources || []).map((resource) => ({
        id: resource.resourceId,
        name: resource.name,
        reservations: resource.reservations,
      })),
      peakActivityHours: [],
    },
    performance: {
      averageLoadTime: 0,
      errorRate: 0,
      apiResponseTime: 0,
    },
  };
}

export class ReportsClient {
  /**
   * Obtener reporte de uso general
   */
  static async getUsageReport(
    filters?: UsageFilters,
  ): Promise<ApiResponse<UsageReport>> {
    return await httpClient.get<UsageReport>(REPORTS_ENDPOINTS.USAGE, {
      params: filters,
    });
  }

  /**
   * Obtener reporte de un recurso específico
   */
  static async getResourceReport(
    resourceId: string,
  ): Promise<ApiResponse<ResourceReport>> {
    return await httpClient.get<ResourceReport>(
      buildUrl(REPORTS_ENDPOINTS.DASHBOARD_OCCUPANCY, { resourceId }),
    );
  }

  /**
   * Obtener reporte de un usuario específico
   */
  static async getUserReport(userId: string): Promise<ApiResponse<UserReport>> {
    return await httpClient.get<UserReport>(REPORTS_ENDPOINTS.USAGE_BY_USER(userId));
  }

  /**
   * Obtener reporte de demanda
   */
  static async getDemandReport(
    filters?: DemandFilters,
  ): Promise<ApiResponse<DemandReport>> {
    return await httpClient.get<DemandReport>(REPORTS_ENDPOINTS.UNSATISFIED_DEMAND, {
      params: filters,
    });
  }

  /**
   * Obtener reporte de ocupación
   */
  static async getOccupancyReport(
    filters?: OccupancyFilters,
  ): Promise<ApiResponse<OccupancyReport>> {
    return await httpClient.get<OccupancyReport>(REPORTS_ENDPOINTS.DASHBOARD_OCCUPANCY, {
      params: filters,
    });
  }

  /**
   * Exportar reporte a CSV
   */
  static async exportToCSV(reportId: string): Promise<ApiResponse<Blob>> {
    return await httpClient.get<Blob>(REPORTS_ENDPOINTS.EXPORT_DOWNLOAD(reportId));
  }

  /**
   * Exportar reporte a PDF
   */
  static async exportToPDF(reportId: string): Promise<ApiResponse<Blob>> {
    return await httpClient.get<Blob>(`${REPORTS_ENDPOINTS.EXPORT}/${reportId}/pdf`);
  }

  /**
   * Obtener datos del dashboard
   */
  static async getDashboardData(
    dashboardId: string,
  ): Promise<ApiResponse<DashboardData>> {
    const normalizedPeriod = normalizeDashboardPeriod(dashboardId);

    const response = await this.getAggregatedDashboard({
      period: normalizedPeriod,
      include: ["kpis", "summary", "activity", "topResources"],
    });

    if (!response.data) {
      return {
        success: true,
        data: {
          period: mapDashboardPeriodToLegacyTimePeriod(normalizedPeriod),
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          kpis: {
            totalReservations: 0,
            totalUsers: 0,
            totalResources: 0,
            averageOccupancy: 0,
            satisfactionRate: 0,
          },
          trends: {
            reservationsChange: 0,
            usersChange: 0,
            occupancyChange: 0,
          },
          topResources: [],
          recentActivity: [],
        },
      };
    }

    return {
      success: response.success,
      data: mapAggregatedToDashboardData(response.data),
      message: response.message,
      timestamp: response.timestamp,
    };
  }

  /**
   * Obtener dashboard agregado para la vista principal
   */
  static async getAggregatedDashboard(
    filters: DashboardQueryFilters = {},
  ): Promise<ApiResponse<DashboardAggregatedResponse>> {
    const include =
      filters.include && filters.include.length > 0
        ? filters.include
        : DEFAULT_DASHBOARD_INCLUDE;

    const endpoint = buildUrl(REPORTS_ENDPOINTS.DASHBOARD_OVERVIEW, {
      ...filters,
      period: filters.period || DEFAULT_DASHBOARD_PERIOD,
      include: include.join(","),
    });

    return await httpClient.get<DashboardAggregatedResponse>(endpoint);
  }

  /**
   * Obtener KPIs generales
   */
  static async getKPIs(period?: string): Promise<ApiResponse<KPIs>> {
    const normalizedPeriod = normalizeDashboardPeriod(period);

    const response = await this.getAggregatedDashboard({
      period: normalizedPeriod,
      include: ["kpis"],
    });

    if (!response.data) {
      return {
        success: true,
        data: {
          totalReservations: 0,
          activeUsers: 0,
          totalResources: 0,
          averageOccupancy: 0,
          satisfactionRate: 0,
          cancelRate: 0,
          noShowRate: 0,
          period: mapDashboardPeriodToLegacyTimePeriod(normalizedPeriod),
          comparedToPrevious: {
            reservations: 0,
            users: 0,
            occupancy: 0,
          },
        },
      };
    }

    return {
      success: response.success,
      data: mapAggregatedToLegacyKpis(response.data),
      message: response.message,
      timestamp: response.timestamp,
    };
  }

  /**
   * Obtener analíticas por período
   */
  static async getAnalytics(period: string): Promise<ApiResponse<Analytics>> {
    const normalizedPeriod = normalizeDashboardPeriod(period);

    const response = await this.getAggregatedDashboard({
      period: normalizedPeriod,
      include: ["kpis", "trend", "topResources"],
    });

    if (!response.data) {
      return {
        success: true,
        data: {
          period: normalizedPeriod,
          metrics: {
            totalViews: 0,
            totalReservations: 0,
            conversionRate: 0,
            averageSessionDuration: 0,
          },
          userBehavior: {
            mostViewedResources: [],
            mostReservedResources: [],
            peakActivityHours: [],
          },
          performance: {
            averageLoadTime: 0,
            errorRate: 0,
            apiResponseTime: 0,
          },
        },
      };
    }

    return {
      success: response.success,
      data: mapAggregatedToAnalytics(response.data),
      message: response.message,
      timestamp: response.timestamp,
    };
  }
}
