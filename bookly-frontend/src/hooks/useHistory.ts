/**
 * useHistory - Hooks para Historial de Reservas (Availability Service)
 *
 * Cubre HistoryController del backend:
 * - GET /history/reservation/:id
 * - GET /history/user/:userId
 * - GET /history/search
 * - POST /history/export
 * - GET /history/my-activity
 */

import {
  AvailabilityClient,
  type HistoryEntry,
  type HistoryExportDto,
  type HistorySearchFilters,
} from "@/infrastructure/api/availability-client";
import { useMutation, useQuery } from "@tanstack/react-query";

// ============================================
// CACHE KEYS
// ============================================

export const historyKeys = {
  all: ["history"] as const,
  byReservation: (reservationId: string) =>
    [...historyKeys.all, "reservation", reservationId] as const,
  byUser: (userId: string) =>
    [...historyKeys.all, "user", userId] as const,
  search: (filters?: HistorySearchFilters) =>
    [...historyKeys.all, "search", filters] as const,
  myActivity: () => [...historyKeys.all, "my-activity"] as const,
};

// ============================================
// QUERIES
// ============================================

export function useReservationHistory(reservationId: string) {
  return useQuery<HistoryEntry[]>({
    queryKey: historyKeys.byReservation(reservationId),
    queryFn: async () => {
      const response =
        await AvailabilityClient.getReservationHistory(reservationId);
      return response.data || [];
    },
    enabled: !!reservationId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUserActivity(userId: string) {
  return useQuery<HistoryEntry[]>({
    queryKey: historyKeys.byUser(userId),
    queryFn: async () => {
      const response = await AvailabilityClient.getUserActivity(userId);
      return response.data || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useHistorySearch(filters?: HistorySearchFilters) {
  return useQuery<HistoryEntry[]>({
    queryKey: historyKeys.search(filters),
    queryFn: async () => {
      if (!filters) return [];
      const response = await AvailabilityClient.searchHistory(filters);
      return response.data || [];
    },
    enabled: !!filters,
    staleTime: 1000 * 60 * 2,
  });
}

export function useMyActivity() {
  return useQuery<HistoryEntry[]>({
    queryKey: historyKeys.myActivity(),
    queryFn: async () => {
      const response = await AvailabilityClient.getMyActivity();
      return response.data || [];
    },
    staleTime: 1000 * 60 * 3,
  });
}

// ============================================
// MUTATIONS
// ============================================

export function useExportHistory() {
  return useMutation({
    mutationFn: async (data: HistoryExportDto) => {
      const response = await AvailabilityClient.exportHistory(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al exportar historial");
      }
      return response.data;
    },
  });
}
