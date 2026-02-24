/**
 * useNotificationChannels - Hook para Canales de Notificación (RF-27)
 *
 * Gestiona configuración de canales y preferencias de notificación
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface NotificationChannel {
  id: string;
  type: "email" | "whatsapp" | "push";
  name: string;
  enabled: boolean;
  config?: Record<string, string>;
}

export interface NotificationPreference {
  eventType: string;
  label: string;
  channels: Record<string, boolean>;
}

export const channelKeys = {
  all: ["notification-channels"] as const,
  channels: () => [...channelKeys.all, "channels"] as const,
  preferences: () => [...channelKeys.all, "preferences"] as const,
};

export function useNotificationChannels() {
  return useQuery<NotificationChannel[]>({
    queryKey: channelKeys.channels(),
    queryFn: async () => {
      const response = await httpClient.get("notifications/channels");
      return response.data?.items || response.data || [];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useNotificationPreferences() {
  return useQuery<NotificationPreference[]>({
    queryKey: channelKeys.preferences(),
    queryFn: async () => {
      const response = await httpClient.get("notifications/preferences");
      return response.data?.items || response.data || [];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useSaveNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: NotificationPreference[]) => {
      const response = await httpClient.put("notifications/preferences", { preferences });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: channelKeys.all });
    },
  });
}

export function useToggleChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const response = await httpClient.patch(`notifications/channels/${id}`, { enabled });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: channelKeys.channels() });
    },
  });
}
