import { ReportsClient } from "@/infrastructure/api/reports-client";
import type { DemandFilters, UsageFilters } from "@/types/entities/report";
import { useQuery } from "@tanstack/react-query";

/**
 * @deprecated Prefer `useReportData` hooks and direct `ReportsClient` usage.
 * Kept for backward compatibility with historical screens.
 */
export function useUsageReport(filters?: UsageFilters) {
  return useQuery({
    queryKey: ["reports", "usage", filters],
    queryFn: async () => {
      const response = await ReportsClient.getUsageReport(filters);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useResourceReport(resourceId: string) {
  return useQuery({
    queryKey: ["reports", "resource", resourceId],
    queryFn: async () => {
      const response = await ReportsClient.getResourceReport(resourceId);
      return response.data;
    },
    enabled: !!resourceId,
  });
}

export function useUserReport(userId: string) {
  return useQuery({
    queryKey: ["reports", "user", userId],
    queryFn: async () => {
      const response = await ReportsClient.getUserReport(userId);
      return response.data;
    },
    enabled: !!userId,
  });
}

export function useDemandReport(filters?: DemandFilters) {
  return useQuery({
    queryKey: ["reports", "demand", filters],
    queryFn: async () => {
      const response = await ReportsClient.getDemandReport(filters);
      return response.data;
    },
  });
}

export function useKPIs(period?: string) {
  return useQuery({
    queryKey: ["reports", "kpis", period],
    queryFn: async () => {
      const response = await ReportsClient.getKPIs(period);
      return response.data;
    },
    refetchInterval: 30000,
  });
}
