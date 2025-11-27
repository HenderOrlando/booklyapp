/**
 * useInfiniteResources - Infinite Query para Recursos
 *
 * Implementa paginación infinita para listados de recursos
 * con scroll infinito y virtual scrolling
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import type { Resource } from "@/types/entities/resource";
import { useInfiniteQuery } from "@tanstack/react-query";

// ============================================
// TYPES
// ============================================

export interface ResourcesPageResponse {
  items: Resource[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface InfiniteResourcesFilters {
  categoryId?: string;
  type?: string;
  status?: string;
  search?: string;
  capacity?: number;
}

// ============================================
// INFINITE QUERY
// ============================================

/**
 * Hook para listado infinito de recursos con paginación
 *
 * @param filters - Filtros de búsqueda
 * @param limit - Elementos por página (default: 20)
 * @example
 * ```typescript
 * const {
 *   data,
 *   fetchNextPage,
 *   hasNextPage,
 *   isFetchingNextPage,
 * } = useInfiniteResources({ status: 'AVAILABLE' });
 *
 * // Obtener todos los recursos paginados
 * const allResources = data?.pages.flatMap(page => page.items) || [];
 *
 * // Cargar siguiente página
 * if (hasNextPage && !isFetchingNextPage) {
 *   fetchNextPage();
 * }
 * ```
 */
export function useInfiniteResources(
  filters?: InfiniteResourcesFilters,
  limit: number = 20
) {
  return useInfiniteQuery<ResourcesPageResponse>({
    queryKey: ["resources", "infinite", filters, limit],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await httpClient.get("/resources", {
        params: {
          page: pageParam,
          limit,
          ...filters,
        },
      });

      // Adaptar respuesta del backend al formato esperado
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
      // Retorna el número de página siguiente, o undefined si no hay más
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook helper para obtener todos los recursos de páginas infinitas
 *
 * @param filters - Filtros de búsqueda
 * @example
 * ```typescript
 * const { resources, isLoading, loadMore, hasMore } = useInfiniteResourcesList();
 * ```
 */
export function useInfiniteResourcesList(
  filters?: InfiniteResourcesFilters,
  limit?: number
) {
  const query = useInfiniteResources(filters, limit);

  return {
    resources: query.data?.pages.flatMap((page) => page.items) || [],
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    totalCount: query.data?.pages[0]?.total || 0,
    error: query.error,
    refetch: query.refetch,
  };
}
