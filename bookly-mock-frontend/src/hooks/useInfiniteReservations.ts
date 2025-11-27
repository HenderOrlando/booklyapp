/**
 * useInfiniteReservations - Infinite Query para Reservas
 *
 * Implementa paginación infinita para historial de reservas
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import type { Reservation } from "@/types/entities/reservation";
import { useInfiniteQuery } from "@tanstack/react-query";

// ============================================
// TYPES
// ============================================

export interface ReservationsPageResponse {
  items: Reservation[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface InfiniteReservationsFilters {
  status?: string;
  resourceId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

// ============================================
// INFINITE QUERY
// ============================================

/**
 * Hook para listado infinito de reservas con paginación
 *
 * @param filters - Filtros de búsqueda
 * @param limit - Elementos por página (default: 20)
 * @example
 * ```typescript
 * const {
 *   data,
 *   fetchNextPage,
 *   hasNextPage,
 * } = useInfiniteReservations({ status: 'CONFIRMED' });
 *
 * const allReservations = data?.pages.flatMap(page => page.items) || [];
 * ```
 */
export function useInfiniteReservations(
  filters?: InfiniteReservationsFilters,
  limit: number = 20
) {
  return useInfiniteQuery<ReservationsPageResponse>({
    queryKey: ["reservations", "infinite", filters, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await httpClient.get("/reservations", {
        params: {
          page: pageParam,
          limit,
          ...filters,
        },
      });

      const data = response.data;
      return {
        items: data?.items || [],
        page: pageParam as number,
        limit,
        total: data?.total || 0,
        totalPages: Math.ceil((data?.total || 0) / limit),
        hasNextPage:
          (pageParam as number) < Math.ceil((data?.total || 0) / limit),
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 3, // 3 minutos (reservas más dinámicas)
  });
}

/**
 * Hook helper para obtener todas las reservas de páginas infinitas
 *
 * @param filters - Filtros de búsqueda
 * @example
 * ```typescript
 * const { reservations, loadMore, hasMore } = useInfiniteReservationsList();
 * ```
 */
export function useInfiniteReservationsList(
  filters?: InfiniteReservationsFilters,
  limit?: number
) {
  const query = useInfiniteReservations(filters, limit);

  return {
    reservations: query.data?.pages.flatMap((page) => page.items) || [],
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    totalCount: query.data?.pages[0]?.total || 0,
    error: query.error,
    refetch: query.refetch,
  };
}
