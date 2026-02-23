/**
 * Custom Hooks para Waitlist (Lista de Espera) con React Query
 *
 * Gestiona consultas de lista de espera con cache y soporte para
 * modo SERVER (backend real) y modo MOCK (datos locales)
 */

import { WaitlistClient } from "@/infrastructure/api/waitlist-client";
import type { WaitlistSearchFilters } from "@/infrastructure/api/waitlist-client";
import { waitlistKeys } from "@/hooks/mutations/useWaitlistMutations";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook para obtener todas las entradas de lista de espera
 *
 * @param filters - Filtros opcionales (resourceId, userId, isActive, page, limit)
 * @example
 * ```typescript
 * const { data, isLoading, error } = useWaitlistEntries();
 * const entries = data?.entries || [];
 * const stats = data?.stats;
 * ```
 */
export function useWaitlistEntries(filters?: WaitlistSearchFilters) {
  return useQuery({
    queryKey: [...waitlistKeys.lists(), filters],
    queryFn: async () => {
      console.log("[useWaitlistEntries] Fetching waitlist entries...", filters);
      const response = await WaitlistClient.getAll(filters);
      console.log("[useWaitlistEntries] Response received:", response);
      if (!response.success) {
        console.error("[useWaitlistEntries] Error in response:", response.message);
        throw new Error(response.message || "Error al cargar lista de espera");
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para obtener la lista de espera de un recurso específico
 *
 * @param resourceId - ID del recurso
 * @param options - Opciones adicionales (page, limit, enabled)
 * @example
 * ```typescript
 * const { data } = useWaitlistByResource('resource-123');
 * const entries = data?.entries || [];
 * ```
 */
export function useWaitlistByResource(
  resourceId: string,
  options?: { page?: number; limit?: number; enabled?: boolean },
) {
  return useQuery({
    queryKey: waitlistKeys.byResource(resourceId),
    queryFn: async () => {
      console.log("[useWaitlistByResource] Fetching for resource:", resourceId);
      const response = await WaitlistClient.getByResource(resourceId, {
        page: options?.page,
        limit: options?.limit,
      });
      console.log("[useWaitlistByResource] Response received:", response);
      if (!response.success) {
        throw new Error(response.message || "Error al cargar lista de espera del recurso");
      }
      return response.data;
    },
    enabled: options?.enabled !== false && !!resourceId,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para obtener una entrada específica de lista de espera
 *
 * @param id - ID de la entrada
 * @example
 * ```typescript
 * const { data: entry } = useWaitlistEntry('wait-123');
 * ```
 */
export function useWaitlistEntry(id: string) {
  return useQuery({
    queryKey: waitlistKeys.detail(id),
    queryFn: async () => {
      const response = await WaitlistClient.getById(id);
      if (!response.success) {
        throw new Error(response.message || "Error al cargar entrada de lista de espera");
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}
