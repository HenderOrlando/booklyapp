/**
 * Custom Hooks para Reservations con React Query
 *
 * Proporciona:
 * - Cache automático
 * - Revalidación en background
 * - Optimistic updates
 * - Estado de loading/error
 *
 * @example
 * ```typescript
 * const { data: reservations, isLoading } = useReservations();
 * const createMutation = useCreateReservation();
 * ```
 */

import { ReservationsClient, type ReservationSearchFilters } from "@/infrastructure/api";
import type {
  CreateReservationDto,
  Reservation,
  UpdateReservationDto,
} from "@/types/entities/reservation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Query keys para cache management
 */
export const reservationKeys = {
  all: ["reservations"] as const,
  lists: () => [...reservationKeys.all, "list"] as const,
  list: (filters?: ReservationSearchFilters) => [...reservationKeys.lists(), filters] as const,
  details: () => [...reservationKeys.all, "detail"] as const,
  detail: (id: string) => [...reservationKeys.details(), id] as const,
  stats: (filters?: ReservationSearchFilters) => [...reservationKeys.all, "stats", filters] as const,
};

// ============================================
// QUERIES (Lectura)
// ============================================

/**
 * Hook para obtener todas las reservas con filtros
 *
 * @param filters - Filtros de búsqueda (opcional)
 * @returns Query con lista de reservas
 */
export function useReservations(filters?: ReservationSearchFilters) {
  return useQuery({
    queryKey: reservationKeys.list(filters),
    queryFn: async () => {
      // Usar search si hay filtros, de lo contrario getAll (que también debería soportar filtros idealmente)
      // Para mantener compatibilidad, si hay filtros usamos search (asumiendo que ReservationsClient.search existe y funciona)
      // o adaptamos ReservationsClient.getAll para que reciba filtros.
      // Por ahora usaremos ReservationsClient.search que agregamos en el cliente
      const response = filters ? await ReservationsClient.search(filters) : await ReservationsClient.getAll();
      if (!response.success) {
        throw new Error(response.message || "Error al cargar reservas");
      }
      
      const data: any = response.data;
      
      // Normalizar la respuesta para asegurar que siempre tenga la estructura { items, meta }
      // Backend real podría retornar un arreglo directo en data con meta en la raíz
      if (Array.isArray(data)) {
        return {
          items: data,
          meta: response.meta || {
            total: data.length,
            page: 1,
            limit: data.length,
            totalPages: 1,
          }
        };
      }
      
      // Backend real podría retornar { reservations, meta }
      if (data && data.reservations && !data.items) {
        return {
          items: data.reservations,
          meta: data.meta || response.meta
        };
      }

      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para obtener estadísticas de reservas
 *
 * @param filters - Filtros de búsqueda (opcional)
 * @returns Query con estadísticas
 */
export function useReservationStats(filters?: ReservationSearchFilters) {
  return useQuery({
    queryKey: reservationKeys.stats(filters),
    queryFn: async () => {
      const response = await ReservationsClient.getStats(filters);
      if (!response.success) {
        throw new Error(response.message || "Error al cargar estadísticas");
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para obtener una reserva por ID
 *
 * @param id - ID de la reserva
 * @param options - Opciones de React Query
 * @returns Query con reserva individual
 * @example
 * ```typescript
 * const { data: reservation } = useReservation('rsv_001');
 * console.log(reservation?.title);
 * ```
 */
export function useReservation(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: reservationKeys.detail(id),
    queryFn: async () => {
      const response = await ReservationsClient.getById(id);
      if (!response.success) {
        throw new Error(response.message || "Error al cargar reserva");
      }
      return response.data;
    },
    enabled: options?.enabled !== false && !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// ============================================
// MUTATIONS (Escritura)
// ============================================

/**
 * Hook para crear una nueva reserva
 *
 * @returns Mutation con optimistic updates
 * @example
 * ```typescript
 * const createMutation = useCreateReservation();
 *
 * const handleSubmit = async (data) => {
 *   await createMutation.mutateAsync(data);
 *   router.push('/reservas');
 * };
 * ```
 */
export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateReservationDto) => {
      const response = await ReservationsClient.create(data);
      if (!response.success) {
        throw new Error(response.message || "Error al crear reserva");
      }
      return response.data;
    },
    onSuccess: (newReservation) => {
      // Invalidar lista para refetch
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });

      // Optimistic: agregar a cache sin esperar refetch
      queryClient.setQueryData<any>(reservationKeys.lists(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: [newReservation, ...old.items],
          meta: { ...old.meta, total: old.meta.total + 1 },
        };
      });
    },
  });
}

/**
 * Hook para actualizar una reserva existente
 *
 * @returns Mutation con optimistic updates
 * @example
 * ```typescript
 * const updateMutation = useUpdateReservation();
 *
 * await updateMutation.mutateAsync({
 *   id: 'rsv_001',
 *   data: { title: 'Nuevo título' }
 * });
 * ```
 */
export function useUpdateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<UpdateReservationDto>;
    }) => {
      const response = await ReservationsClient.update(id, data);
      if (!response.success) {
        throw new Error(response.message || "Error al actualizar reserva");
      }
      return response.data;
    },
    onSuccess: (updatedReservation) => {
      // Actualizar en detalle
      queryClient.setQueryData(
        reservationKeys.detail(updatedReservation.id),
        updatedReservation
      );

      // Actualizar en lista
      queryClient.setQueryData<any>(reservationKeys.lists(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((r: Reservation) =>
            r.id === updatedReservation.id ? updatedReservation : r
          ),
        };
      });
    },
  });
}

/**
 * Hook para cancelar una reserva
 *
 * @returns Mutation con optimistic updates
 * @example
 * ```typescript
 * const cancelMutation = useCancelReservation();
 *
 * await cancelMutation.mutateAsync('rsv_001');
 * ```
 */
export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await ReservationsClient.cancel(id);
      if (!response.success) {
        throw new Error(response.message || "Error al cancelar reserva");
      }
      return response.data;
    },
    onSuccess: (cancelledReservation) => {
      // Actualizar en detalle
      queryClient.setQueryData(
        reservationKeys.detail(cancelledReservation.id),
        cancelledReservation
      );

      // Actualizar en lista
      queryClient.setQueryData<any>(reservationKeys.lists(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((r: Reservation) =>
            r.id === cancelledReservation.id ? cancelledReservation : r
          ),
        };
      });
    },
  });
}
