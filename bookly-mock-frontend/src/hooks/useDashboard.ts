/**
 * useDashboard - Hooks para Dashboard y Estadísticas
 *
 * Proporciona queries para KPIs, métricas y estadísticas del dashboard
 */

import { ReportsClient } from "@/infrastructure/api/reports-client";
import { ReservationsClient } from "@/infrastructure/api/reservations-client";
import type {
  DashboardAggregatedResponse,
  DashboardIncludeSection,
  DashboardQueryFilters,
} from "@/types/entities/report";
import type { Reservation } from "@/types/entities/reservation";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "./useCurrentUser";

// ============================================
// CACHE KEYS
// ============================================

export const dashboardKeys = {
  all: ["dashboard"] as const,
  aggregated: () => [...dashboardKeys.all, "aggregated"] as const,
  userStats: () => [...dashboardKeys.all, "user-stats"] as const,
  metrics: () => [...dashboardKeys.all, "metrics"] as const,
  resourceStats: () => [...dashboardKeys.all, "resource-stats"] as const,
  reservationStats: () => [...dashboardKeys.all, "reservation-stats"] as const,
  recentActivity: () => [...dashboardKeys.all, "recent-activity"] as const,
  upcomingReservations: () => [...dashboardKeys.all, "upcoming"] as const,
};

const DEFAULT_DASHBOARD_INCLUDE: DashboardIncludeSection[] = [
  "kpis",
  "summary",
  "trend",
  "activity",
  "recentReservations",
  "topResources",
];

const AGGREGATED_DASHBOARD_STALE_TIME = 1000 * 60 * 2;

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
  totalReservations: number;
  activeReservations: number;
  pendingApprovals: number;
  satisfactionRate: number;
  totalResources: number;
  availableResources: number;
  resourcesInUse: number;
  resourcesInMaintenance: number;
  todayReservations: number;
  weekReservations: number;
  monthReservations: number;
  utilizationRate: number; // Porcentaje de utilización
  delta: {
    totalReservationsPct: number;
    activeReservationsPct: number;
    pendingApprovalsPct: number;
    utilizationRatePct: number;
    satisfactionRatePct: number;
  };
  mostUsedResources: Array<{
    id: string;
    name: string;
    usageCount: number;
    share: number;
    utilizationRate: number | null;
    hoursUsed: number;
  }>;
  trend: Array<{
    label: string;
    value: number;
    utilizationRate: number | null;
  }>;
  recentActivity: Array<{
    id: string;
    type: "reservation" | "approval" | "maintenance" | "info";
    title: string;
    description?: string;
    timestamp: string;
    icon: string;
    user?: string;
  }>;
  reservationSummary: {
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
    completed: number;
  };
  recentReservations: Array<{
    id: string;
    reservationId: string;
    resourceId: string;
    resourceName: string;
    userId: string;
    status: string;
    startAt: string;
    endAt: string;
    createdAt: string;
  }>;
  canViewFullOccupancy: boolean;
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

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const EMPTY_DASHBOARD_METRICS: DashboardMetrics = {
  totalReservations: 0,
  activeReservations: 0,
  pendingApprovals: 0,
  satisfactionRate: 0,
  totalResources: 0,
  availableResources: 0,
  resourcesInUse: 0,
  resourcesInMaintenance: 0,
  todayReservations: 0,
  weekReservations: 0,
  monthReservations: 0,
  utilizationRate: 0,
  delta: {
    totalReservationsPct: 0,
    activeReservationsPct: 0,
    pendingApprovalsPct: 0,
    utilizationRatePct: 0,
    satisfactionRatePct: 0,
  },
  mostUsedResources: [],
  trend: [],
  recentActivity: [],
  reservationSummary: {
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0,
  },
  recentReservations: [],
  canViewFullOccupancy: true,
};

const EMPTY_RESOURCE_STATS: ResourceStats = {
  byCategory: {},
  byStatus: {},
  utilizationByResource: [],
};

const EMPTY_RESERVATION_STATS: ReservationStats = {
  byStatus: {},
  byProgram: {},
  peakHours: [],
  averageDuration: 0,
};

async function getAggregatedDashboard(filters?: DashboardQueryFilters): Promise<DashboardAggregatedResponse | null> {
  const response = await ReportsClient.getAggregatedDashboard({
    period: filters?.period || "last30",
    from: filters?.from,
    to: filters?.to,
    resourceTypeId: filters?.resourceTypeId,
    locationId: filters?.locationId,
    programId: filters?.programId,
    include: DEFAULT_DASHBOARD_INCLUDE,
  });

  return response.data || null;
}

interface UseAggregatedOptions {
  filters?: DashboardQueryFilters;
  pollingInterval?: number;
}

function useAggregatedDashboardQuery<TResult>(
  select: (payload: DashboardAggregatedResponse | null) => TResult,
  options?: UseAggregatedOptions,
) {
  return useQuery<DashboardAggregatedResponse | null, Error, TResult>({
    queryKey: [...dashboardKeys.aggregated(), options?.filters],
    queryFn: () => getAggregatedDashboard(options?.filters),
    select,
    staleTime: AGGREGATED_DASHBOARD_STALE_TIME,
    refetchInterval: options?.pollingInterval,
  });
}

function toDate(input: string): Date | null {
  const parsed = new Date(input);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toActivityType(
  value: string,
): "reservation" | "approval" | "maintenance" | "info" {
  const normalized = value.toLowerCase();

  if (normalized.includes("approval") || normalized.includes("approve")) {
    return "approval";
  }

  if (normalized.includes("maintenance") || normalized.includes("maint")) {
    return "maintenance";
  }

  if (normalized.includes("reservation") || normalized.includes("reserva")) {
    return "reservation";
  }

  return "info";
}

function getActivityIcon(
  type: "reservation" | "approval" | "maintenance" | "info",
): string {
  if (type === "approval") {
    return "⚠";
  }

  if (type === "maintenance") {
    return "🛠";
  }

  if (type === "reservation") {
    return "✓";
  }

  return "ℹ";
}

function mapToDashboardMetrics(
  payload: DashboardAggregatedResponse | null,
): DashboardMetrics {
  if (!payload) {
    return EMPTY_DASHBOARD_METRICS;
  }

  const kpis = payload.kpis;
  const reservationSummary =
    payload.reservationSummary || EMPTY_DASHBOARD_METRICS.reservationSummary;

  const trend = payload.trend || [];
  const now = Date.now();
  const todayIso = new Date(now).toISOString().slice(0, 10);

  const trendCounters = trend.reduce(
    (acc, point) => {
      const date = toDate(point.date);
      if (!date) {
        return acc;
      }

      const diffInMs = now - date.getTime();
      const reservations = point.reservations || 0;

      if (point.date === todayIso) {
        acc.today += reservations;
      }

      if (diffInMs >= 0 && diffInMs <= DAY_IN_MS * 7) {
        acc.week += reservations;
      }

      if (diffInMs >= 0 && diffInMs <= DAY_IN_MS * 30) {
        acc.month += reservations;
      }

      return acc;
    },
    { today: 0, week: 0, month: 0 },
  );

  const totalResources = kpis?.totalResources || 0;
  const availableResources = kpis?.availableResources || 0;
  const resourcesInUse = Math.max(totalResources - availableResources, 0);

  return {
    totalReservations:
      kpis?.totalReservations ||
      reservationSummary.total ||
      trendCounters.month,
    activeReservations: kpis?.activeReservations || 0,
    pendingApprovals: kpis?.pendingApprovals || 0,
    satisfactionRate: kpis?.satisfactionRate || 0,
    totalResources,
    availableResources,
    resourcesInUse,
    resourcesInMaintenance: 0,
    todayReservations: trendCounters.today,
    weekReservations: trendCounters.week,
    monthReservations: reservationSummary.total || trendCounters.month,
    utilizationRate: kpis?.utilizationRate || 0,
    delta: {
      totalReservationsPct: kpis?.delta.totalReservationsPct || 0,
      activeReservationsPct: kpis?.delta.activeReservationsPct || 0,
      pendingApprovalsPct: kpis?.delta.pendingApprovalsPct || 0,
      utilizationRatePct: kpis?.delta.utilizationRatePct || 0,
      satisfactionRatePct: kpis?.delta.satisfactionRatePct || 0,
    },
    mostUsedResources: (payload.topResources || []).map((resource) => ({
      id: resource.resourceId,
      name: resource.name,
      usageCount: resource.reservations,
      share: resource.share,
      utilizationRate: resource.utilizationRate,
      hoursUsed: resource.hoursUsed,
    })),
    trend: trend.map((point) => ({
      label: point.date.slice(5),
      value: point.reservations,
      utilizationRate: point.utilizationRate,
    })),
    recentActivity: (payload.recentActivity || []).map((activity) => {
      const type = toActivityType(activity.type);
      const userValue = activity.metadata?.userName;

      return {
        id: activity.id,
        type,
        title: activity.title,
        description: activity.description,
        timestamp: activity.at,
        icon: getActivityIcon(type),
        user: typeof userValue === "string" ? userValue : undefined,
      };
    }),
    reservationSummary,
    recentReservations: payload.recentReservations || [],
    canViewFullOccupancy: payload.access?.canViewFullOccupancy ?? true,
  };
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
export function useDashboardMetrics(pollingInterval?: number) {
  return useAggregatedDashboardQuery(
    (payload) => mapToDashboardMetrics(payload),
    { pollingInterval }
  );
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
  return useAggregatedDashboardQuery((payload) => {
    if (!payload) {
      return EMPTY_RESOURCE_STATS;
    }

    return {
      byCategory: {},
      byStatus: {},
      utilizationByResource: (payload.topResources || []).map((resource) => ({
        resourceId: resource.resourceId,
        resourceName: resource.name,
        utilizationRate: resource.utilizationRate || 0,
      })),
    };
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
  return useAggregatedDashboardQuery((payload) => {
    const summary = payload?.reservationSummary;

    if (!summary) {
      return EMPTY_RESERVATION_STATS;
    }

    return {
      byStatus: {
        PENDING: summary.pending,
        CONFIRMED: summary.confirmed,
        CANCELLED: summary.cancelled,
        COMPLETED: summary.completed,
      },
      byProgram: {},
      peakHours: [],
      averageDuration: 0,
    };
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
  return useAggregatedDashboardQuery((payload) =>
    mapToDashboardMetrics(payload).recentActivity.slice(0, limit),
  );
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
