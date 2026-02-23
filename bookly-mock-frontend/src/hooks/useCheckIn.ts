/**
 * useCheckIn - Hooks para Check-in/Check-out
 *
 * Proporciona queries y mutations para el proceso de registro
 */

import { CheckInClient } from "@/infrastructure/api/check-in-client";
import { ReservationsClient } from "@/infrastructure/api/reservations-client";
import type {
  CheckInDto,
  CheckInOut,
  CheckOutDto,
} from "@/types/entities/checkInOut";
import type { Reservation } from "@/types/entities/reservation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ============================================
// CACHE KEYS
// ============================================

export const checkInKeys = {
  all: ["check-in"] as const,
  lists: () => [...checkInKeys.all, "list"] as const,
  active: () => [...checkInKeys.all, "active"] as const,
  overdue: () => [...checkInKeys.all, "overdue"] as const,
  history: () => [...checkInKeys.all, "history"] as const,
  upcoming: () => [...checkInKeys.all, "upcoming"] as const,
  details: () => [...checkInKeys.all, "detail"] as const,
  detail: (id: string) => [...checkInKeys.details(), id] as const,
  byReservation: (reservationId: string) =>
    [...checkInKeys.all, "reservation", reservationId] as const,
};

// ============================================
// QUERIES
// ============================================

/**
 * Hook para obtener check-ins activos (Dashboard Vigilancia)
 */
export function useActiveCheckIns() {
  return useQuery<CheckInOut[]>({
    queryKey: checkInKeys.active(),
    queryFn: async () => {
      const response = await CheckInClient.getActiveCheckIns();
      return response.data || [];
    },
    refetchInterval: 30000, // Refrescar cada 30 seg
    retry: 1,
  });
}

/**
 * Hook para obtener check-ins vencidos (Dashboard Vigilancia)
 */
export function useOverdueCheckIns() {
  return useQuery<CheckInOut[]>({
    queryKey: checkInKeys.overdue(),
    queryFn: async () => {
      const response = await CheckInClient.getOverdueCheckIns();
      return response.data || [];
    },
    refetchInterval: 60000,
    retry: 1,
  });
}

/**
 * Hook para obtener historial del usuario
 */
export function useMyCheckInHistory() {
  return useQuery<CheckInOut[]>({
    queryKey: checkInKeys.history(),
    queryFn: async () => {
      const response = await CheckInClient.getMyHistory();
      return response.data || [];
    },
    retry: 1,
  });
}

/**
 * Hook para obtener check-in por ID de reserva
 */
export function useCheckInByReservation(reservationId: string) {
  return useQuery<CheckInOut>({
    queryKey: checkInKeys.byReservation(reservationId),
    queryFn: async () => {
      const response = await CheckInClient.getByReservation(reservationId);
      return response.data;
    },
    enabled: !!reservationId,
    retry: false,
  });
}

/**
 * Hook para obtener reservas aprobadas/confirmadas del usuario (candidatas para check-in)
 * Consulta el availability-service para obtener reservas con status CONFIRMED.
 */
export function useUpcomingReservations() {
  return useQuery<Reservation[]>({
    queryKey: checkInKeys.upcoming(),
    queryFn: async () => {
      const response = await ReservationsClient.search({
        status: "CONFIRMED",
        startDate: new Date().toISOString(),
        limit: 20,
      });
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data && typeof data === "object" && "items" in data) {
        return (data as { items: Reservation[] }).items || [];
      }
      return [];
    },
    retry: 1,
    refetchInterval: 60000,
  });
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook para realizar Check-in
 */
export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CheckInDto) => {
      const response = await CheckInClient.checkIn(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al realizar check-in");
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: checkInKeys.active() });
      queryClient.invalidateQueries({ queryKey: checkInKeys.history() });
      queryClient.invalidateQueries({ queryKey: checkInKeys.upcoming() });
      queryClient.invalidateQueries({
        queryKey: checkInKeys.byReservation(data.reservationId),
      });
    },
  });
}

/**
 * Hook para realizar Check-out
 */
export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CheckOutDto) => {
      const response = await CheckInClient.checkOut(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al realizar check-out");
      }
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: checkInKeys.active() });
      queryClient.invalidateQueries({ queryKey: checkInKeys.history() });
      queryClient.invalidateQueries({ queryKey: checkInKeys.upcoming() });
      queryClient.invalidateQueries({
        queryKey: checkInKeys.byReservation(data.reservationId),
      });
      queryClient.invalidateQueries({ queryKey: checkInKeys.detail(data.id) });
    },
  });
}
