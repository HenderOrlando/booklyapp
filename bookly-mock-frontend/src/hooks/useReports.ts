import * as reportsClient from "@/services/reportsClient";
import type { DemandFilters, UsageFilters } from "@/types/entities/report";
import { useQuery } from "@tanstack/react-query";

export function useUsageReport(filters?: UsageFilters) {
  return useQuery({
    queryKey: ["reports", "usage", filters],
    queryFn: () => reportsClient.getUsageReport(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useResourceReport(resourceId: string) {
  return useQuery({
    queryKey: ["reports", "resource", resourceId],
    queryFn: () => reportsClient.getResourceReport(resourceId),
    enabled: !!resourceId,
  });
}

export function useUserReport(userId: string) {
  return useQuery({
    queryKey: ["reports", "user", userId],
    queryFn: () => reportsClient.getUserReport(userId),
    enabled: !!userId,
  });
}

export function useDemandReport(filters?: DemandFilters) {
  return useQuery({
    queryKey: ["reports", "demand", filters],
    queryFn: () => reportsClient.getDemandReport(filters),
  });
}

export function useKPIs(period?: string) {
  return useQuery({
    queryKey: ["reports", "kpis", period],
    queryFn: () => reportsClient.getKPIs(period),
    refetchInterval: 30000,
  });
}
