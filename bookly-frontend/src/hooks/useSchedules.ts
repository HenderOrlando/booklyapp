/**
 * useSchedules - Hook para Horarios Disponibles (RF-07)
 *
 * Gestiona configuración de horarios globales y por recurso
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface TimeSlotConfig {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  enabled: boolean;
}

export const scheduleKeys = {
  all: ["schedules"] as const,
  global: () => [...scheduleKeys.all, "global"] as const,
  resource: (resourceId: string) => [...scheduleKeys.all, "resource", resourceId] as const,
};

export function useGlobalSchedules() {
  return useQuery<TimeSlotConfig[]>({
    queryKey: scheduleKeys.global(),
    queryFn: async () => {
      const response = await httpClient.get("schedules/global");
      return response.data?.items || response.data || [];
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useResourceSchedules(resourceId: string) {
  return useQuery<TimeSlotConfig[]>({
    queryKey: scheduleKeys.resource(resourceId),
    queryFn: async () => {
      const response = await httpClient.get(`schedules/resource/${resourceId}`);
      return response.data?.items || response.data || [];
    },
    enabled: !!resourceId,
    staleTime: 1000 * 60 * 10,
  });
}

export function useSaveSchedules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slots: TimeSlotConfig[]) => {
      const response = await httpClient.put("schedules/global", { slots });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
  });
}
