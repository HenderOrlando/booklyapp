/**
 * useCancellationReport - Hook para reporte de cancelaciones (RF-40)
 *
 * Proporciona queries para obtener datos de cancelaciones y ausencias:
 * - Tasa de cancelación y no-shows
 * - Razones de cancelación
 * - Desglose por recurso, usuario, tendencia temporal
 */

import { REPORTS_ENDPOINTS, buildUrl } from "@/infrastructure/api/endpoints";
import { httpClient } from "@/infrastructure/http/httpClient";
import type {
  CancellationFilters,
  CancellationReport,
} from "@/types/entities/report";
import { useQuery } from "@tanstack/react-query";

export const cancellationKeys = {
  all: ["cancellations"] as const,
  reports: () => [...cancellationKeys.all, "report"] as const,
  report: (filters?: CancellationFilters) =>
    [...cancellationKeys.reports(), { filters }] as const,
};

/**
 * Hook para obtener reporte de cancelaciones y ausencias
 */
export function useCancellationReport(filters?: CancellationFilters) {
  return useQuery<CancellationReport>({
    queryKey: cancellationKeys.report(filters),
    queryFn: async () => {
      const url = buildUrl(REPORTS_ENDPOINTS.CANCELLATIONS, filters as Record<string, unknown>);
      const response = await httpClient.get<CancellationReport>(url);

      if (!response.success || !response.data) {
        return {
          id: "",
          type: "CANCELLATION" as const,
          period: "MONTH" as const,
          startDate: filters?.startDate || new Date().toISOString(),
          endDate: filters?.endDate || new Date().toISOString(),
          totalReservations: 0,
          totalCancellations: 0,
          totalNoShows: 0,
          cancellationRate: 0,
          noShowRate: 0,
          averageCancelLeadTime: 0,
          cancelReasons: [],
          byResource: [],
          byUser: [],
          trend: [],
          peakCancellationTimes: [],
          createdAt: new Date().toISOString(),
        };
      }

      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
