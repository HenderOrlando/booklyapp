import { useToast } from "@/hooks/useToast";
import {
  ConfigClient,
  DEFAULT_APP_CONFIG,
  DEFAULT_PUBLIC_APP_CONFIG,
  type UpdateAppConfigPayload,
  type UpdateStorageConfigPayload,
} from "@/infrastructure/api/config-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const configKeys = {
  all: ["config"] as const,
  public: () => [...configKeys.all, "public"] as const,
  full: () => [...configKeys.all, "full"] as const,
  storage: () => [...configKeys.all, "storage"] as const,
};

/**
 * Hook para obtener la configuración pública
 */
export function usePublicConfig() {
  return useQuery({
    queryKey: configKeys.public(),
    queryFn: async () => {
      const response = await ConfigClient.getPublicConfig();
      if (!response.success || !response.data) {
        return DEFAULT_PUBLIC_APP_CONFIG;
      }

      return response.data;
    },
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}

/**
 * Hook para obtener la configuración completa (Admin)
 */
export function useAppConfig() {
  return useQuery({
    queryKey: configKeys.full(),
    queryFn: async () => {
      const response = await ConfigClient.getConfig();
      if (!response.success || !response.data) {
        return DEFAULT_APP_CONFIG;
      }

      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para actualizar la configuración
 */
export function useUpdateAppConfig() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateAppConfigPayload) => {
      return ConfigClient.updateConfig(data);
    },
    onSuccess: (data) => {
      showSuccess(
        "Configuración actualizada",
        "Los cambios se han guardado correctamente",
      );
      // Actualizar ambas queries
      if (data.data) {
        queryClient.setQueryData(configKeys.full(), data.data);
      }
      queryClient.invalidateQueries({ queryKey: configKeys.public() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al actualizar la configuración";
      showError("Error", errorMessage);
      console.error("Error updating config:", error);
    },
  });
}

/**
 * Hook para obtener configuración de storage
 */
export function useStorageConfig() {
  return useQuery({
    queryKey: configKeys.storage(),
    queryFn: async () => {
      const response = await ConfigClient.getStorageConfig();
      if (!response.success || !response.data) {
        return { storageProvider: DEFAULT_APP_CONFIG.storageProvider };
      }

      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook para actualizar configuración de storage
 */
export function useUpdateStorageConfig() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (data: UpdateStorageConfigPayload) => {
      return ConfigClient.updateStorageConfig(data);
    },
    onSuccess: (data) => {
      showSuccess(
        "Storage actualizado",
        "La configuración de almacenamiento se ha guardado",
      );
      if (data.data) {
        queryClient.setQueryData(configKeys.storage(), data.data);
      }
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Error al actualizar storage";
      showError("Error", errorMessage);
      console.error("Error updating storage config:", error);
    },
  });
}
