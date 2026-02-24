/**
 * useOptimisticUI - Hooks para Optimistic Updates
 *
 * Implementa actualizaciones optimistas con rollback automático
 */

import type { Reservation } from "@/types/entities/reservation";
import type { Resource } from "@/types/entities/resource";
import { useQueryClient } from "@tanstack/react-query";
import { programKeys } from "./usePrograms";
import { reservationKeys } from "./useReservations";
import { resourceKeys } from "./useResources";

/**
 * Hook para toggle optimista de estado de recurso
 *
 * @example
 * ```typescript
 * const { toggleResourceStatus } = useOptimisticResourceToggle();
 *
 * const handleToggle = () => {
 *   toggleResourceStatus(resource, updateResource);
 * };
 * ```
 */
export function useOptimisticResourceToggle() {
  const queryClient = useQueryClient();

  const toggleResourceStatus = (resource: Resource, updateMutation: any) => {
    // Snapshot del estado anterior
    const previousData = queryClient.getQueryData(resourceKeys.lists());

    // Update optimista
    queryClient.setQueryData(resourceKeys.lists(), (old: Resource[] = []) =>
      old.map((r) =>
        r.id === resource.id ? { ...r, isActive: !r.isActive } : r
      )
    );

    // También actualizar el detalle si está cacheado
    queryClient.setQueryData(
      resourceKeys.detail(resource.id),
      (old: Resource | undefined) =>
        old ? { ...old, isActive: !old.isActive } : undefined
    );

    // Ejecutar mutación real
    updateMutation.mutate(
      {
        id: resource.id,
        data: { isActive: !resource.isActive },
      },
      {
        onError: () => {
          // Rollback en caso de error
          queryClient.setQueryData(resourceKeys.lists(), previousData);
          queryClient.invalidateQueries({
            queryKey: resourceKeys.detail(resource.id),
          });
        },
        onSettled: () => {
          // Revalidar después de la mutación
          queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
        },
      }
    );
  };

  return { toggleResourceStatus };
}

/**
 * Hook para actualización optimista de reserva
 *
 * @example
 * ```typescript
 * const { updateReservationOptimistic } = useOptimisticReservation();
 *
 * updateReservationOptimistic(
 *   reservation.id,
 *   { status: 'CONFIRMED' },
 *   updateMutation
 * );
 * ```
 */
export function useOptimisticReservation() {
  const queryClient = useQueryClient();

  const updateReservationOptimistic = (
    reservationId: string,
    updates: Partial<Reservation>,
    updateMutation: any
  ) => {
    // Snapshot
    const previousList = queryClient.getQueryData(reservationKeys.lists());
    const previousDetail = queryClient.getQueryData(
      reservationKeys.detail(reservationId)
    );

    // Update optimista en lista
    queryClient.setQueryData(
      reservationKeys.lists(),
      (old: any = { items: [] }) => ({
        ...old,
        items: old.items.map((r: Reservation) =>
          r.id === reservationId ? { ...r, ...updates } : r
        ),
      })
    );

    // Update optimista en detalle
    queryClient.setQueryData(
      reservationKeys.detail(reservationId),
      (old: Reservation | undefined) =>
        old ? { ...old, ...updates } : undefined
    );

    // Mutación real
    updateMutation.mutate(
      { id: reservationId, data: updates },
      {
        onError: () => {
          // Rollback
          queryClient.setQueryData(reservationKeys.lists(), previousList);
          queryClient.setQueryData(
            reservationKeys.detail(reservationId),
            previousDetail
          );
        },
        onSettled: () => {
          // Revalidar
          queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
          queryClient.invalidateQueries({
            queryKey: reservationKeys.detail(reservationId),
          });
        },
      }
    );
  };

  const cancelReservationOptimistic = (
    reservationId: string,
    cancelMutation: any
  ) => {
    return updateReservationOptimistic(
      reservationId,
      { status: "CANCELLED" as any },
      cancelMutation
    );
  };

  return {
    updateReservationOptimistic,
    cancelReservationOptimistic,
  };
}

/**
 * Hook para creación optimista
 *
 * Agrega el item inmediatamente al cache antes de la respuesta del servidor
 *
 * @example
 * ```typescript
 * const { createOptimistic } = useOptimisticCreate();
 *
 * createOptimistic(
 *   'resources',
 *   newResource,
 *   createMutation
 * );
 * ```
 */
export function useOptimisticCreate() {
  const queryClient = useQueryClient();

  const createOptimistic = (
    entity: "resources" | "reservations" | "programs",
    newItem: any,
    createMutation: any
  ) => {
    const queryKey =
      entity === "resources"
        ? resourceKeys.lists()
        : entity === "reservations"
          ? reservationKeys.lists()
          : programKeys.lists();

    // Snapshot
    const previousData = queryClient.getQueryData(queryKey);

    // Generar ID temporal
    const tempId = `temp_${Date.now()}`;
    const optimisticItem = {
      ...newItem,
      id: tempId,
      _isOptimistic: true,
    };

    // Agregar optimísticamente
    queryClient.setQueryData(queryKey, (old: any[] = []) => [
      optimisticItem,
      ...old,
    ]);

    // Mutación real
    createMutation.mutate(newItem, {
      onSuccess: (data: any) => {
        // Reemplazar item temporal con el real
        queryClient.setQueryData(queryKey, (old: any[] = []) =>
          old.map((item) =>
            item.id === tempId ? { ...data, _isOptimistic: false } : item
          )
        );
      },
      onError: () => {
        // Rollback
        queryClient.setQueryData(queryKey, previousData);
      },
      onSettled: () => {
        // Revalidar
        queryClient.invalidateQueries({ queryKey });
      },
    });
  };

  return { createOptimistic };
}

/**
 * Hook para eliminación optimista
 *
 * Elimina el item inmediatamente del cache
 *
 * @example
 * ```typescript
 * const { deleteOptimistic } = useOptimisticDelete();
 *
 * deleteOptimistic('resources', 'res_123', deleteMutation);
 * ```
 */
export function useOptimisticDelete() {
  const queryClient = useQueryClient();

  const deleteOptimistic = (
    entity: "resources" | "reservations" | "programs",
    itemId: string,
    deleteMutation: any
  ) => {
    const queryKey =
      entity === "resources"
        ? resourceKeys.lists()
        : entity === "reservations"
          ? reservationKeys.lists()
          : programKeys.lists();

    // Snapshot
    const previousData = queryClient.getQueryData(queryKey);

    // Eliminar optimísticamente
    queryClient.setQueryData(queryKey, (old: any[] = []) =>
      old.filter((item) => item.id !== itemId)
    );

    // Mutación real
    deleteMutation.mutate(itemId, {
      onError: () => {
        // Rollback
        queryClient.setQueryData(queryKey, previousData);
      },
      onSettled: () => {
        // Revalidar
        queryClient.invalidateQueries({ queryKey });
      },
    });
  };

  return { deleteOptimistic };
}
