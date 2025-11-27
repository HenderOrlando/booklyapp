/**
 * useWaitlistMutations - Mutations para Lista de Espera
 *
 * Dominio: Waitlist (Lista de Espera)
 *
 * Gestiona operaciones de escritura sobre la lista de espera
 * cuando un recurso no está disponible
 */

import { useToast } from "@/hooks/useToast";
import { httpClient } from "@/infrastructure/http/httpClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * DTO para agregar a lista de espera
 */
export interface AddToWaitlistDto {
  resourceId: string;
  userId: string;
  startDate: string;
  endDate: string;
  priority?: "HIGH" | "MEDIUM" | "LOW";
  reason?: string;
  notifyMethod?: "EMAIL" | "SMS" | "WHATSAPP" | "ALL";
}

/**
 * DTO para actualizar posición en lista de espera
 */
export interface UpdateWaitlistPositionDto {
  newPriority: "HIGH" | "MEDIUM" | "LOW";
  reason?: string;
}

// ============================================
// CACHE KEYS
// ============================================

export const waitlistKeys = {
  all: ["waitlist"] as const,
  lists: () => [...waitlistKeys.all, "list"] as const,
  list: (filters?: string) => [...waitlistKeys.lists(), { filters }] as const,
  details: () => [...waitlistKeys.all, "detail"] as const,
  detail: (id: string) => [...waitlistKeys.details(), id] as const,
  byResource: (resourceId: string) =>
    [...waitlistKeys.all, "resource", resourceId] as const,
  byUser: (userId: string) => [...waitlistKeys.all, "user", userId] as const,
};

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook para agregar a lista de espera
 *
 * @example
 * ```typescript
 * const addToWaitlist = useAddToWaitlist();
 *
 * addToWaitlist.mutate({
 *   resourceId: "resource-123",
 *   userId: "user-456",
 *   startDate: "2025-12-01T09:00",
 *   endDate: "2025-12-01T11:00",
 *   priority: "HIGH",
 *   notifyMethod: "EMAIL"
 * });
 * ```
 */
export function useAddToWaitlist() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (data: AddToWaitlistDto) => {
      const response = await httpClient.post("/waitlist", data);
      return response;
    },
    onSuccess: (_, variables) => {
      showSuccess(
        "Agregado a Lista de Espera",
        "Se ha registrado en la lista de espera correctamente"
      );
      // Invalidar listas y recursos relacionados
      queryClient.invalidateQueries({ queryKey: waitlistKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: waitlistKeys.byResource(variables.resourceId),
      });
      queryClient.invalidateQueries({
        queryKey: waitlistKeys.byUser(variables.userId),
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al agregar a lista de espera";
      showError("Error al Agregar", errorMessage);
      console.error("Error al agregar a lista de espera:", error);
    },
  });
}

/**
 * Hook para remover de lista de espera
 *
 * @example
 * ```typescript
 * const removeFromWaitlist = useRemoveFromWaitlist();
 *
 * removeFromWaitlist.mutate("waitlist-entry-123");
 * ```
 */
export function useRemoveFromWaitlist() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await httpClient.delete(`/waitlist/${id}`);
      return id;
    },
    onSuccess: (id) => {
      showSuccess(
        "Removido de Lista de Espera",
        "Se ha eliminado de la lista de espera"
      );
      queryClient.invalidateQueries({ queryKey: waitlistKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: waitlistKeys.lists() });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al remover de lista de espera";
      showError("Error al Remover", errorMessage);
      console.error("Error al remover de lista de espera:", error);
    },
  });
}

/**
 * Hook para notificar a usuarios en lista de espera
 *
 * Se usa cuando un recurso se libera y hay que notificar
 * al siguiente en la lista
 *
 * @example
 * ```typescript
 * const notifyWaitlist = useNotifyWaitlist();
 *
 * notifyWaitlist.mutate({
 *   resourceId: "resource-123",
 *   availableFrom: "2025-12-01T09:00",
 *   availableUntil: "2025-12-01T11:00"
 * });
 * ```
 */
export function useNotifyWaitlist() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (data: {
      resourceId: string;
      availableFrom: string;
      availableUntil: string;
      notifyTop?: number; // Notificar a los primeros N usuarios
    }) => {
      const response = await httpClient.post("/waitlist/notify", data);
      return response;
    },
    onSuccess: (_, variables) => {
      showSuccess(
        "Usuarios Notificados",
        "Se ha notificado a los usuarios en espera"
      );
      queryClient.invalidateQueries({
        queryKey: waitlistKeys.byResource(variables.resourceId),
      });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al notificar lista de espera";
      showError("Error al Notificar", errorMessage);
      console.error("Error al notificar lista de espera:", error);
    },
  });
}

/**
 * Hook para actualizar prioridad en lista de espera
 *
 * @example
 * ```typescript
 * const updatePriority = useUpdateWaitlistPriority();
 *
 * updatePriority.mutate({
 *   id: "waitlist-123",
 *   data: { newPriority: "HIGH", reason: "Urgente" }
 * });
 * ```
 */
export function useUpdateWaitlistPriority() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateWaitlistPositionDto;
    }) => {
      const response = await httpClient.patch(`/waitlist/${id}/priority`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      showSuccess(
        "Prioridad Actualizada",
        "La prioridad se actualizó correctamente"
      );
      queryClient.invalidateQueries({
        queryKey: waitlistKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: waitlistKeys.lists() });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al actualizar prioridad";
      showError("Error al Actualizar", errorMessage);
      console.error("Error al actualizar prioridad:", error);
    },
  });
}

/**
 * Hook para aceptar oferta de lista de espera
 *
 * Cuando un usuario es notificado, puede aceptar la reserva
 *
 * @example
 * ```typescript
 * const acceptOffer = useAcceptWaitlistOffer();
 *
 * acceptOffer.mutate("waitlist-123");
 * ```
 */
export function useAcceptWaitlistOffer() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await httpClient.post(`/waitlist/${id}/accept`);
      return response;
    },
    onSuccess: (_, id) => {
      showSuccess(
        "Oferta Aceptada",
        "Has aceptado la oferta y se ha creado la reserva"
      );
      queryClient.invalidateQueries({ queryKey: waitlistKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: waitlistKeys.lists() });
      // También invalidar reservas ya que se creó una nueva
      queryClient.invalidateQueries({ queryKey: ["reservations", "list"] });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al aceptar oferta";
      showError("Error al Aceptar", errorMessage);
      console.error("Error al aceptar oferta:", error);
    },
  });
}
