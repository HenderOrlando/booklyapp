/**
 * useComplianceReport - Hook para reporte de cumplimiento (RF-39)
 *
 * Proporciona queries para obtener datos de cumplimiento de reservas:
 * - Tasa de cumplimiento (check-in a tiempo vs late vs no-show)
 * - Desglose por recurso, usuario, día de la semana
 */

import { REPORTS_ENDPOINTS, buildUrl } from "@/infrastructure/api/endpoints";
import { httpClient } from "@/infrastructure/http/httpClient";
import type {
  ComplianceFilters,
  ComplianceReport,
} from "@/types/entities/report";
import { useQuery } from "@tanstack/react-query";

export const complianceKeys = {
  all: ["compliance"] as const,
  reports: () => [...complianceKeys.all, "report"] as const,
  report: (filters?: ComplianceFilters) =>
    [...complianceKeys.reports(), { filters }] as const,
};

/**
 * Hook para obtener reporte de cumplimiento
 */
export function useComplianceReport(filters?: ComplianceFilters) {
  return useQuery<ComplianceReport>({
    queryKey: complianceKeys.report(filters),
    queryFn: async () => {
      const url = buildUrl(REPORTS_ENDPOINTS.COMPLIANCE, filters as Record<string, unknown>);
      const response = await httpClient.get<ComplianceReport>(url);

      if (!response.success || !response.data) {
        return {
          id: "",
          type: "COMPLIANCE" as const,
          period: "MONTH" as const,
          startDate: filters?.startDate || new Date().toISOString(),
          endDate: filters?.endDate || new Date().toISOString(),
          totalReservations: 0,
          completedOnTime: 0,
          completedLate: 0,
          noShows: 0,
          complianceRate: 0,
          averageCheckInDelay: 0,
          byResource: [],
          byUser: [],
          byDayOfWeek: [],
          createdAt: new Date().toISOString(),
        };
      }

      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}
