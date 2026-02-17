/**
 * useReportData - Hook genérico para Reportes (RF-31 a RF-37)
 *
 * Proporciona queries para obtener datos de reportes con filtros
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import { useQuery } from "@tanstack/react-query";

export const reportKeys = {
  all: ["reports"] as const,
  dashboard: () => [...reportKeys.all, "dashboard"] as const,
  byResource: (filters?: any) => [...reportKeys.all, "by-resource", filters] as const,
  byUser: (filters?: any) => [...reportKeys.all, "by-user", filters] as const,
  demand: (filters?: any) => [...reportKeys.all, "demand", filters] as const,
  compliance: (filters?: any) => [...reportKeys.all, "compliance", filters] as const,
  conflicts: (filters?: any) => [...reportKeys.all, "conflicts", filters] as const,
};

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  resourceId?: string;
  categoryId?: string;
  programId?: string;
}

export function useReportDashboard(filters?: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.dashboard(),
    queryFn: async () => {
      const response = await httpClient.get("reports/dashboard", { params: filters });
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useReportByResource(filters?: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.byResource(filters),
    queryFn: async () => {
      const response = await httpClient.get("reports/by-resource", { params: filters });
      return response.data?.items || response.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useReportByUser(filters?: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.byUser(filters),
    queryFn: async () => {
      const response = await httpClient.get("reports/by-user", { params: filters });
      return response.data?.items || response.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useUnsatisfiedDemandReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.demand(filters),
    queryFn: async () => {
      const response = await httpClient.get("reports/unsatisfied-demand", { params: filters });
      return response.data?.items || response.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useComplianceReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.compliance(filters),
    queryFn: async () => {
      const response = await httpClient.get("reports/compliance", { params: filters });
      return response.data?.items || response.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useConflictReport(filters?: ReportFilters) {
  return useQuery({
    queryKey: reportKeys.conflicts(filters),
    queryFn: async () => {
      const response = await httpClient.get("reports/conflicts", { params: filters });
      return response.data?.items || response.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}
