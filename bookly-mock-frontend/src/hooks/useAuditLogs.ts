/**
 * useAuditLogs - Hook para gestión de logs de auditoría (RF-44)
 *
 * Proporciona queries con React Query para:
 * - Listado paginado de audit logs con filtros
 * - Estadísticas de auditoría
 * - Exportación CSV server-side
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import { AUDIT_ENDPOINTS } from "@/infrastructure/api/endpoints";
import type { PaginatedResponse } from "@/infrastructure/api/types";
import { useQuery } from "@tanstack/react-query";

// ============================================
// TYPES
// ============================================

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  user: string;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  ipAddress: string;
  userAgent?: string;
  status: "success" | "error" | "warning";
  metadata?: Record<string, unknown>;
}

export interface AuditFilters {
  search?: string;
  action?: string;
  status?: string;
  entity?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface AuditStats {
  totalLogs: number;
  successCount: number;
  errorCount: number;
  warningCount: number;
  uniqueUsers: number;
  topActions: Array<{ action: string; count: number }>;
  recentFailedLogins: number;
}

// ============================================
// CACHE KEYS
// ============================================

export const auditKeys = {
  all: ["audit"] as const,
  lists: () => [...auditKeys.all, "list"] as const,
  list: (filters?: AuditFilters) =>
    [...auditKeys.lists(), { filters }] as const,
  stats: () => [...auditKeys.all, "stats"] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Hook para obtener logs de auditoría con paginación server-side
 */
export function useAuditLogs(filters?: AuditFilters) {
  return useQuery<PaginatedResponse<AuditLog>>({
    queryKey: auditKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== "" && value !== "all") {
            params.append(key, String(value));
          }
        });
      }

      const url = params.toString()
        ? `${AUDIT_ENDPOINTS.LOGS}?${params.toString()}`
        : AUDIT_ENDPOINTS.LOGS;

      const response = await httpClient.get<unknown>(url);

      if (!response.success || !response.data) {
        return {
          items: [],
          meta: { total: 0, page: 1, limit: 20, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
        };
      }

      const data = response.data as Record<string, unknown>;
      const items = (data.items || data.data || data) as AuditLog[];

      return {
        items: Array.isArray(items) ? items : [],
        meta: (data.meta as PaginatedResponse<AuditLog>["meta"]) || {
          total: Array.isArray(items) ? items.length : 0,
          page: filters?.page || 1,
          limit: filters?.limit || 20,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    },
    staleTime: 1000 * 30,
  });
}

/**
 * Hook para obtener estadísticas de auditoría
 */
export function useAuditStats() {
  return useQuery<AuditStats>({
    queryKey: auditKeys.stats(),
    queryFn: async () => {
      const response = await httpClient.get<unknown>(
        `${AUDIT_ENDPOINTS.LOGS}?stats=true`,
      );

      if (!response.success || !response.data) {
        return {
          totalLogs: 0,
          successCount: 0,
          errorCount: 0,
          warningCount: 0,
          uniqueUsers: 0,
          topActions: [],
          recentFailedLogins: 0,
        };
      }

      return response.data as AuditStats;
    },
    staleTime: 1000 * 60,
  });
}

/**
 * Genera URL de exportación CSV server-side
 */
export function getAuditExportUrl(filters?: Omit<AuditFilters, "page" | "limit">): string {
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== "all") {
        params.append(key, String(value));
      }
    });
  }

  return params.toString()
    ? `${AUDIT_ENDPOINTS.EXPORT}?${params.toString()}`
    : AUDIT_ENDPOINTS.EXPORT;
}
