/**
 * usePrefetch - Hooks para Prefetching Inteligente
 *
 * Implementa prefetching predictivo y on-hover para mejorar UX
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import { useQueryClient } from "@tanstack/react-query";
import { programKeys } from "./usePrograms";
import { reservationKeys } from "./useReservations";
import { resourceKeys } from "./useResources";

interface PaginatedListPayload<T> {
  items?: T[];
}

type PrefetchFilters = Record<string, string | number | boolean | undefined>;

function extractListItems<T>(
  data: PaginatedListPayload<T> | T[] | undefined,
): T[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (data?.items && Array.isArray(data.items)) {
    return data.items;
  }

  return [];
}

/**
 * Hook para prefetch de recursos
 *
 * @example
 * ```typescript
 * const { prefetchResource } = usePrefetchResource();
 *
 * <div onMouseEnter={() => prefetchResource('res_123')}>
 *   Ver Detalle
 * </div>
 * ```
 */
export function usePrefetchResource() {
  const queryClient = useQueryClient();

  const prefetchResource = async (resourceId: string) => {
    await queryClient.prefetchQuery({
      queryKey: resourceKeys.detail(resourceId),
      queryFn: async () => {
        const response = await httpClient.get(`/resources/${resourceId}`);
        return response.data;
      },
      staleTime: 1000 * 60 * 10, // 10 minutos
    });
  };

  return { prefetchResource };
}

/**
 * Hook para prefetch de reservas
 *
 * @example
 * ```typescript
 * const { prefetchReservation } = usePrefetchReservation();
 *
 * <Button onMouseEnter={() => prefetchReservation(reservation.id)}>
 *   Ver Detalle
 * </Button>
 * ```
 */
export function usePrefetchReservation() {
  const queryClient = useQueryClient();

  const prefetchReservation = async (reservationId: string) => {
    await queryClient.prefetchQuery({
      queryKey: reservationKeys.detail(reservationId),
      queryFn: async () => {
        const response = await httpClient.get(`/reservations/${reservationId}`);
        return response.data;
      },
      staleTime: 1000 * 60 * 5,
    });
  };

  return { prefetchReservation };
}

/**
 * Hook para prefetch de programas
 */
export function usePrefetchProgram() {
  const queryClient = useQueryClient();

  const prefetchProgram = async (programId: string) => {
    await queryClient.prefetchQuery({
      queryKey: programKeys.detail(programId),
      queryFn: async () => {
        const response = await httpClient.get(`/programs/${programId}`);
        return response.data;
      },
      staleTime: 1000 * 60 * 10,
    });
  };

  return { prefetchProgram };
}

/**
 * Hook para prefetch de siguiente página en paginación
 *
 * @example
 * ```typescript
 * const { prefetchNextPage } = usePrefetchNextPage();
 *
 * useEffect(() => {
 *   if (currentPage < totalPages) {
 *     prefetchNextPage('resources', currentPage + 1);
 *   }
 * }, [currentPage]);
 * ```
 */
export function usePrefetchNextPage() {
  const queryClient = useQueryClient();

  const prefetchNextPage = async (
    entity: "resources" | "reservations" | "programs",
    nextPage: number,
    filters?: PrefetchFilters,
  ) => {
    const baseUrl = `/${entity}`;
    const queryKey = [entity, "list", { page: nextPage, ...filters }];

    await queryClient.prefetchQuery({
      queryKey,
      queryFn: async () => {
        const response = await httpClient.get<
          PaginatedListPayload<unknown> | unknown[]
        >(baseUrl, {
          params: { page: nextPage, ...filters },
        });
        return extractListItems(response.data);
      },
      staleTime: 1000 * 60 * 5,
    });
  };

  return { prefetchNextPage };
}

/**
 * Hook compuesto para prefetching inteligente
 *
 * Combina múltiples estrategias de prefetch
 *
 * @example
 * ```typescript
 * const prefetch = useSmartPrefetch();
 *
 * // Prefetch on hover
 * <div onMouseEnter={() => prefetch.onHover('resource', 'res_123')}>
 *
 * // Prefetch predictivo
 * prefetch.predictive('resource', 'res_123');
 * ```
 */
export function useSmartPrefetch() {
  const { prefetchResource } = usePrefetchResource();
  const { prefetchReservation } = usePrefetchReservation();
  const { prefetchProgram } = usePrefetchProgram();
  const { prefetchNextPage } = usePrefetchNextPage();

  const onHover = (
    type: "resource" | "reservation" | "program",
    id: string,
  ) => {
    switch (type) {
      case "resource":
        return prefetchResource(id);
      case "reservation":
        return prefetchReservation(id);
      case "program":
        return prefetchProgram(id);
    }
  };

  const predictive = (
    type: "resource" | "reservation" | "program",
    id: string,
  ) => {
    // Implementar lógica predictiva basada en patrones de navegación
    // Por ahora, simplemente hace prefetch
    return onHover(type, id);
  };

  return {
    onHover,
    predictive,
    prefetchNextPage,
    prefetchResource,
    prefetchReservation,
    prefetchProgram,
  };
}
