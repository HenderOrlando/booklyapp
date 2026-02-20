/**
 * useReservationMutations - Hook para mutaciones de reservas
 *
 * Usa React Query (TanStack Query) para gestionar creación,
 * actualización y eliminación de reservas
 */

import { useToast } from "@/hooks/useToast";
import { httpClient } from "@/infrastructure/http/httpClient";
import type {
  CreateReservationDto,
  Reservation,
} from "@/types/entities/reservation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { reservationKeys } from "../useReservations";

/**
 * Hook para crear una nueva reserva
 */
export function useCreateReservation() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const t = useTranslations("reservations.modal");

  return useMutation({
    mutationFn: async (data: CreateReservationDto) => {
      const response = await httpClient.post<Reservation>(
        "/reservations",
        data
      );
      return response;
    },
    onSuccess: () => {
      showSuccess(
        t("success_create_title") || "Reserva Creada",
        t("success_create_message") || "La reserva se creó exitosamente"
      );
      // Invalidar cache de reservas para refrescar lista
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as any)?.response?.data?.message || t("errors.unknown_error");
      showError(t("errors.create_failed") || "Error", errorMessage);
      console.error("Error al crear reserva:", error);
    },
  });
}

/**
 * Hook para actualizar una reserva existente
 */
export function useUpdateReservation() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const t = useTranslations("reservations.modal");

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateReservationDto>;
    }) => {
      const response = await httpClient.put<Reservation>(
        `/reservations/${id}`,
        data
      );
      return response;
    },
    onSuccess: (_, variables) => {
      showSuccess(
        t("success_update_title") || "Reserva Actualizada",
        t("success_update_message") || "Los cambios se guardaron correctamente"
      );
      // Invalidar cache de la reserva específica y listas
      queryClient.invalidateQueries({
        queryKey: reservationKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as any)?.response?.data?.message || t("errors.unknown_error");
      showError(t("errors.update_failed") || "Error", errorMessage);
      console.error("Error al actualizar reserva:", error);
    },
  });
}

/**
 * Hook para cancelar una reserva
 */
export function useCancelReservation() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await httpClient.patch<Reservation>(
        `/reservations/${id}/cancel`
      );
      return response;
    },
    onSuccess: (_, id) => {
      showSuccess("Reserva Cancelada", "La reserva se canceló correctamente");
      // Invalidar cache
      queryClient.invalidateQueries({
        queryKey: reservationKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as any)?.response?.data?.message || "Error al cancelar la reserva";
      showError("Error al Cancelar", errorMessage);
      console.error("Error al cancelar reserva:", error);
    },
  });
}

/**
 * Hook para eliminar una reserva
 */
export function useDeleteReservation() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await httpClient.delete(`/reservations/${id}`);
      return id;
    },
    onSuccess: (id) => {
      showSuccess("Reserva Eliminada", "La reserva se eliminó correctamente");
      // Invalidar cache
      queryClient.invalidateQueries({
        queryKey: reservationKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: reservationKeys.lists() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        (error as any)?.response?.data?.message || "Error al eliminar la reserva";
      showError("Error al Eliminar", errorMessage);
      console.error("Error al eliminar reserva:", error);
    },
  });
}
