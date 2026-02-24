/**
 * useReportData - Hook genérico para Reportes (RF-31 a RF-37)
 *
 * Proporciona queries para obtener datos de reportes con filtros
 */

import { ReportsClient } from "@/infrastructure/api/reports-client";
import { httpClient } from "@/infrastructure/http/httpClient";
import type { DashboardData, UserReport } from "@/types/entities/report";
import { useQuery } from "@tanstack/react-query";

export const reportKeys = {
  all: ["reports"] as const,
  dashboard: () => [...reportKeys.all, "dashboard"] as const,
  byResource: (filters?: ReportFilters) =>
    [...reportKeys.all, "by-resource", filters] as const,
  byUser: (filters?: ReportFilters) =>
    [...reportKeys.all, "by-user", filters] as const,
  demand: (filters?: ReportFilters) =>
    [...reportKeys.all, "demand", filters] as const,
  compliance: (filters?: ReportFilters) =>
    [...reportKeys.all, "compliance", filters] as const,
  conflicts: (filters?: ReportFilters) =>
    [...reportKeys.all, "conflicts", filters] as const,
};

export interface ReportFilters {
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  resourceId?: string;
  categoryId?: string;
  programId?: string;
}

function normalizeDateFilter(value?: string | Date | null): string | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
  }

  return undefined;
}

function extractItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (
    payload &&
    typeof payload === "object" &&
    "items" in payload &&
    Array.isArray((payload as { items?: unknown[] }).items)
  ) {
    return (payload as { items?: unknown[] }).items || [];
  }

  return payload ? [payload] : [];
}

function mapAggregatedToDashboardData(payload: {
  filters: {
    from: string;
    to: string;
  };
  kpis: {
    totalReservations: number;
    totalResources: number;
    utilizationRate: number;
    satisfactionRate: number;
    delta: {
      totalReservationsPct: number;
      utilizationRatePct: number;
    };
  } | null;
  topResources: Array<{
    resourceId: string;
    name: string;
    reservations: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    at: string;
  }>;
}): DashboardData {
  return {
    period: "CUSTOM",
    startDate: payload.filters.from,
    endDate: payload.filters.to,
    kpis: {
      totalReservations: payload.kpis?.totalReservations || 0,
      totalUsers: 0,
      totalResources: payload.kpis?.totalResources || 0,
      averageOccupancy: payload.kpis?.utilizationRate || 0,
      satisfactionRate: payload.kpis?.satisfactionRate || 0,
    },
    trends: {
      reservationsChange: payload.kpis?.delta.totalReservationsPct || 0,
      usersChange: 0,
      occupancyChange: payload.kpis?.delta.utilizationRatePct || 0,
    },
    topResources: payload.topResources.map((resource) => ({
      id: resource.resourceId,
      name: resource.name,
      reservations: resource.reservations,
    })),
    recentActivity: payload.recentActivity.map((activity) => ({
      id: activity.id,
      type: activity.type,
      description: activity.description,
      timestamp: activity.at,
    })),
  };
}

export function useReportDashboard(filters?: ReportFilters) {
  const from = normalizeDateFilter(filters?.startDate);
  const to = normalizeDateFilter(filters?.endDate);

  return useQuery<DashboardData>({
    queryKey: [...reportKeys.dashboard(), filters],
    queryFn: async () => {
      const response = await ReportsClient.getAggregatedDashboard({
        period: from || to ? "custom" : "last30",
        from,
        to,
        programId: filters?.programId,
        include: ["kpis", "summary", "trend", "activity", "topResources"],
      });

      if (!response.data) {
        return {
          period: "CUSTOM",
          startDate: from || new Date().toISOString(),
          endDate: to || new Date().toISOString(),
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
        };
      }

      return mapAggregatedToDashboardData({
        filters: response.data.filters,
        kpis: response.data.kpis,
        topResources: response.data.topResources,
        recentActivity: response.data.recentActivity,
      });
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useReportByResource(filters?: ReportFilters) {
  return useQuery<unknown[]>({
    queryKey: reportKeys.byResource(filters),
    queryFn: async () => {
      const response = await httpClient.get("usage-reports", {
        params: { ...filters, groupBy: "resource" },
      });
      return extractItems(response.data);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useReportByUser(filters?: ReportFilters) {
  return useQuery<UserReport[]>({
    queryKey: reportKeys.byUser(filters),
    queryFn: async () => {
      const response = await httpClient.get("user-reports", {
        params: filters,
      });
      const items = extractItems(response.data) as Record<string, unknown>[];
      return items.map((item) => ({
        id: String(item.id ?? ""),
        type: "USER" as const,
        userId: String(item.userId ?? item.id ?? ""),
        userName: String(item.userName ?? item.name ?? "Sin nombre"),
        period: (item.period as UserReport["period"]) ?? "CUSTOM",
        startDate: String(item.startDate ?? ""),
        endDate: String(item.endDate ?? ""),
        totalReservations: Number(item.totalReservations ?? 0),
        totalHours: Number(item.totalHours ?? 0),
        cancelledReservations: Number(item.cancelledReservations ?? 0),
        noShowCount: Number(item.noShowCount ?? 0),
        favoriteResources: Array.isArray(item.favoriteResources)
          ? item.favoriteResources
          : [],
        reservationsByStatus: (item.reservationsByStatus as UserReport["reservationsByStatus"]) ?? {
          pending: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
        },
        createdAt: String(item.createdAt ?? new Date().toISOString()),
      }));
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUnsatisfiedDemandReport(filters?: ReportFilters) {
  return useQuery<unknown[]>({
    queryKey: reportKeys.demand(filters),
    queryFn: async () => {
      const response = await httpClient.get("demand-reports", {
        params: filters,
      });
      return extractItems(response.data);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useComplianceReport(filters?: ReportFilters) {
  return useQuery<unknown[]>({
    queryKey: reportKeys.compliance(filters),
    queryFn: async () => {
      const response = await httpClient.get("usage-reports/generate", {
        params: { ...filters, type: "compliance" },
      });
      return extractItems(response.data);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useConflictReport(filters?: ReportFilters) {
  return useQuery<unknown[]>({
    queryKey: reportKeys.conflicts(filters),
    queryFn: async () => {
      const response = await httpClient.get("usage-reports/generate", {
        params: { ...filters, type: "conflicts" },
      });
      return extractItems(response.data);
    },
    staleTime: 1000 * 60 * 5,
  });
}
