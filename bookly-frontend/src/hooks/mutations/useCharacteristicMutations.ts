/**
 * useCharacteristicMutations - Mutations para Características de Recursos
 *
 * Gestiona operaciones de escritura sobre el catálogo de características
 */

import { useToast } from "@/hooks/useToast";
import {
  CharacteristicsClient,
  type CreateCharacteristicDto,
  type UpdateCharacteristicDto,
} from "@/infrastructure/api/characteristics-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const characteristicKeys = {
  all: ["characteristics"] as const,
  lists: () => [...characteristicKeys.all, "list"] as const,
  list: (filters?: string) =>
    [...characteristicKeys.lists(), { filters }] as const,
  details: () => [...characteristicKeys.all, "detail"] as const,
  detail: (id: string) => [...characteristicKeys.details(), id] as const,
};

export function useCreateCharacteristic() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: Omit<CreateCharacteristicDto, "group">) =>
      CharacteristicsClient.create(data),
    onSuccess: (response) => {
      if (response.success) {
        showSuccess(
          "Característica Creada",
          "La característica se ha creado exitosamente",
        );
        queryClient.invalidateQueries({ queryKey: characteristicKeys.all });
      } else {
        showError(
          "Error al Crear",
          response.message || "No se pudo crear la característica",
        );
      }
    },
    onError: (error: Error) => {
      showError(
        "Error de Conexión",
        error.message || "Ocurrió un error al intentar crear la característica",
      );
    },
  });
}

export function useUpdateCharacteristic() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCharacteristicDto }) =>
      CharacteristicsClient.update(id, data),
    onSuccess: (response) => {
      if (response.success) {
        showSuccess(
          "Característica Actualizada",
          "Los cambios se han guardado exitosamente",
        );
        queryClient.invalidateQueries({ queryKey: characteristicKeys.all });
      } else {
        showError(
          "Error al Actualizar",
          response.message || "No se pudo actualizar la característica",
        );
      }
    },
    onError: (error: Error) => {
      showError(
        "Error de Conexión",
        error.message ||
          "Ocurrió un error al intentar actualizar la característica",
      );
    },
  });
}

export function useDeleteCharacteristic() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (id: string) => CharacteristicsClient.delete(id),
    onSuccess: (response) => {
      if (response.success) {
        showSuccess(
          "Característica Eliminada",
          "La característica se ha eliminado exitosamente",
        );
        queryClient.invalidateQueries({ queryKey: characteristicKeys.all });
      } else {
        showError(
          "Error al Eliminar",
          response.message || "No se pudo eliminar la característica",
        );
      }
    },
    onError: (error: Error) => {
      showError(
        "Error de Conexión",
        error.message ||
          "Ocurrió un error al intentar eliminar la característica",
      );
    },
  });
}
