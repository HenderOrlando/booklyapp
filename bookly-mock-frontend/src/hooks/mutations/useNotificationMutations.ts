/**
 * useNotificationMutations - Mutations para Notificaciones
 *
 * Dominio: Notifications (Notificaciones de Sistema)
 *
 * Gestiona el envío y marcado de notificaciones del sistema
 */

import { useToast } from "@/hooks/useToast";
import { httpClient } from "@/infrastructure/http/httpClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * DTO para enviar notificación
 */
export interface SendNotificationDto {
  recipients: string[]; // User IDs o emails
  type: "INFO" | "WARNING" | "SUCCESS" | "ERROR";
  title: string;
  message: string;
  channels?: ("EMAIL" | "SMS" | "WHATSAPP" | "IN_APP" | "PUSH")[];
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// ============================================
// CACHE KEYS
// ============================================

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  unread: () => [...notificationKeys.all, "unread"] as const,
  count: () => [...notificationKeys.all, "count"] as const,
};

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook para enviar notificación
 */
export function useSendNotification() {
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: async (data: SendNotificationDto) => {
      const response = await httpClient.post("/notifications/send", data);
      return response;
    },
    onSuccess: () => {
      showSuccess(
        "Notificación Enviada",
        "La notificación se envió correctamente"
      );
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al enviar notificación";
      showError("Error al Enviar", errorMessage);
      console.error("Error al enviar notificación:", error);
    },
  });
}

/**
 * Hook para marcar como leída
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const { showError: _showError } = useToast(); // No mostrar success para "marcar como leído" para no saturar

  return useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const response = await httpClient.post("/notifications/mark-read", {
        notificationIds,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.unread() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.count() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
    },
    onError: (error: any) => {
      console.error("Error al marcar como leída:", error);
    },
  });
}

/**
 * Hook para marcar todas como leídas
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async () => {
      const response = await httpClient.post("/notifications/mark-all-read");
      return response;
    },
    onSuccess: () => {
      showSuccess(
        "Todo Leído",
        "Todas las notificaciones se marcaron como leídas"
      );
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al marcar todo como leído";
      showError("Error", errorMessage);
      console.error("Error al marcar todo como leído:", error);
    },
  });
}

/**
 * Hook para eliminar notificación
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await httpClient.delete(`/notifications/${id}`);
      return id;
    },
    onSuccess: () => {
      showSuccess(
        "Notificación Eliminada",
        "La notificación se eliminó correctamente"
      );
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.count() });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al eliminar notificación";
      showError("Error al Eliminar", errorMessage);
      console.error("Error al eliminar notificación:", error);
    },
  });
}
