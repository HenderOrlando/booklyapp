/**
 * useDashboard - Hooks para Dashboard y Estadísticas
 *
 * Proporciona queries para KPIs, métricas y estadísticas del dashboard
 */

import { ReportsClient } from "@/infrastructure/api/reports-client";
import { ReservationsClient } from "@/infrastructure/api/reservations-client";
import type { Reservation } from "@/types/entities/reservation";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "./useCurrentUser";

// ============================================
// CACHE KEYS
// ============================================

export const dashboardKeys = {
  all: ["dashboard"] as const,
  userStats: () => [...dashboardKeys.all, "user-stats"] as const,
  metrics: () => [...dashboardKeys.all, "metrics"] as const,
  resourceStats: () => [...dashboardKeys.all, "resource-stats"] as const,
  reservationStats: () => [...dashboardKeys.all, "reservation-stats"] as const,
  recentActivity: () => [...dashboardKeys.all, "recent-activity"] as const,
  upcomingReservations: () => [...dashboardKeys.all, "upcoming"] as const,
};

// ============================================
// TYPES
// ============================================

export interface UserStats {
  totalReservations: number;
  activeReservations: number;
  canceledReservations: number;
  pendingApprovals: number;
  hoursBooked: number;
  favoriteResources: string[];
}

export interface DashboardMetrics {
  totalResources: number;
  availableResources: number;
  resourcesInUse: number;
  resourcesInMaintenance: number;
  todayReservations: number;
  weekReservations: number;
  monthReservations: number;
  utilizationRate: number; // Porcentaje de utilización
  mostUsedResources: Array<{
    id: string;
    name: string;
    usageCount: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: "reservation" | "approval" | "maintenance";
    title: string;
    timestamp: string;
    user?: string;
  }>;
}

export interface ResourceStats {
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  utilizationByResource: Array<{
    resourceId: string;
    resourceName: string;
    utilizationRate: number;
  }>;
}

export interface ReservationStats {
  byStatus: Record<string, number>;
  byProgram: Record<string, number>;
  peakHours: Array<{
    hour: number;
    count: number;
  }>;
  averageDuration: number;
}

// ============================================
// QUERIES
// ============================================

/**
 * Hook para obtener estadísticas del usuario actual
 *
 * @example
 * ```typescript
 * const { data: stats } = useUserStats();
 * console.log(stats?.totalReservations);
 * ```
 */
export function useUserStats() {
  // ✅ Hooks deben llamarse en el nivel superior
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.id?.toString();

  return useQuery<UserStats>({
    queryKey: [...dashboardKeys.userStats(), userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("User ID not available");
      }
      const response = await ReportsClient.getUserReport(userId);
      const userStats = response.data as unknown as UserStats | undefined;

      return (
        userStats || {
          totalReservations: 0,
          activeReservations: 0,
          canceledReservations: 0,
          pendingApprovals: 0,
          hoursBooked: 0,
          favoriteResources: [],
        }
      );
    },
    enabled: !!userId, // Solo ejecutar cuando hay userId
    staleTime: 1000 * 60 * 2, // 2 minutos (datos dinámicos)
  });
}

/**
 * Hook para obtener métricas generales del dashboard
 *
 * @example
 * ```typescript
 * const { data: metrics, isLoading } = useDashboardMetrics();
 * ```
 */
export function useDashboardMetrics() {
  return useQuery<DashboardMetrics>({
    queryKey: dashboardKeys.metrics(),
    queryFn: async () => {
      const response = await ReportsClient.getKPIs();
      const metrics = response.data as unknown as DashboardMetrics | undefined;

      return (
        metrics || {
          totalResources: 0,
          availableResources: 0,
          resourcesInUse: 0,
          resourcesInMaintenance: 0,
          todayReservations: 0,
          weekReservations: 0,
          monthReservations: 0,
          utilizationRate: 0,
          mostUsedResources: [],
          recentActivity: [],
        }
      );
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para obtener estadísticas de recursos
 *
 * @example
 * ```typescript
 * const { data: resourceStats } = useResourceStats();
 * ```
 */
export function useResourceStats() {
  return useQuery<ResourceStats>({
    queryKey: dashboardKeys.resourceStats(),
    queryFn: async () => {
      // Usamos getDashboardData como proxy para overview
      const response = await ReportsClient.getDashboardData("overview");
      const resourceStats = response.data as unknown as
        | ResourceStats
        | undefined;

      return (
        resourceStats || {
          byCategory: {},
          byStatus: {},
          utilizationByResource: [],
        }
      );
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}

/**
 * Hook para obtener estadísticas de reservas
 *
 * @example
 * ```typescript
 * const { data: reservationStats } = useReservationStats();
 * ```
 */
export function useReservationStats() {
  return useQuery<ReservationStats>({
    queryKey: dashboardKeys.reservationStats(),
    queryFn: async () => {
      const response = await ReportsClient.getOccupancyReport();
      const reservationStats = response.data as unknown as
        | ReservationStats
        | undefined;

      return (
        reservationStats || {
          byStatus: {},
          byProgram: {},
          peakHours: [],
          averageDuration: 0,
        }
      );
    },
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Hook para obtener actividad reciente
 *
 * @param limit - Número de elementos a retornar
 * @example
 * ```typescript
 * const { data: activity } = useRecentActivity(10);
 * ```
 */
export function useRecentActivity(limit: number = 10) {
  return useQuery({
    queryKey: [...dashboardKeys.recentActivity(), limit],
    queryFn: async () => {
      const response = await ReportsClient.getAnalytics("recent");
      const analyticsPayload = response.data as
        | { items?: unknown[] }
        | undefined;

      return Array.isArray(analyticsPayload?.items)
        ? analyticsPayload.items
        : [];
    },
    staleTime: 1000 * 60 * 1, // 1 minuto (muy dinámico)
  });
}

/**
 * Hook para obtener próximas reservas del usuario
 *
 * @example
 * ```typescript
 * const { data: upcoming } = useUpcomingReservations();
 * ```
 */
export function useUpcomingReservations() {
  return useQuery<Reservation[]>({
    queryKey: dashboardKeys.upcomingReservations(),
    queryFn: async () => {
      const response = await ReservationsClient.search({
        startDate: new Date().toISOString(),
        limit: 10,
      });

      const now = Date.now();
      const reservations = response.data?.items || [];

      return reservations
        .filter((reservation) => {
          const normalizedStatus = String(
            reservation.status || "",
          ).toUpperCase();

          if (
            normalizedStatus === "CANCELLED" ||
            normalizedStatus === "COMPLETED" ||
            normalizedStatus === "REJECTED"
          ) {
            return false;
          }

          const startsAt = new Date(reservation.startDate).getTime();
          return Number.isFinite(startsAt) && startsAt >= now;
        })
        .sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
        )
        .slice(0, 10);
    },
    staleTime: 1000 * 60 * 3, // 3 minutos
  });
}
