/**
 * useCategoryMutations - Mutations para Categorías
 *
 * Dominio: Categories (Categorías de Recursos)
 *
 * Gestiona operaciones de escritura sobre categorías de recursos
 */

import { useToast } from "@/hooks/useToast";
import { httpClient } from "@/infrastructure/http/httpClient";
import type { ApiResponse } from "@/types/api/response";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resourceKeys } from "../useResources";

/**
 * DTO para crear una categoría
 */
export interface CreateCategoryDto {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parentId?: string;
}

/**
 * DTO para actualizar una categoría
 */
export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {
  isActive?: boolean;
  type?: string;
}

type CategoryMutationData = {
  id?: string;
  name?: string;
};

type CategoryMutationResponse = ApiResponse<CategoryMutationData> & {
  status?: string;
};

function isQueuedResponse(response: CategoryMutationResponse): boolean {
  if (response.status === "processing") {
    return true;
  }

  const normalizedMessage = response.message?.toLowerCase() || "";
  return (
    normalizedMessage.includes("queued for processing") ||
    normalizedMessage.includes("accepted and queued")
  );
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

// ============================================
// CACHE KEYS
// ============================================

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (filters?: string) => [...categoryKeys.lists(), { filters }] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook para crear una nueva categoría
 *
 * @example
 * ```typescript
 * const createCategory = useCreateCategory();
 *
 * createCategory.mutate({
 *   name: "Aulas",
 *   color: "#3b82f6",
 *   icon: "classroom"
 * });
 * ```
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (
      data: CreateCategoryDto,
    ): Promise<CategoryMutationResponse> => {
      const response = await httpClient.post("/categories", data);
      return response as CategoryMutationResponse;
    },
    onSuccess: (data) => {
      if (data.success && data.data && !isQueuedResponse(data)) {
        const name = data.data.name || "Categoría";
        showSuccess(
          "Categoría Creada",
          `La categoría "${name}" se creó exitosamente`,
        );
        queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
        queryClient.invalidateQueries({ queryKey: resourceKeys.categories });
      } else {
        showError(
          "Operación pendiente",
          "La categoría no confirmó persistencia inmediata. Revisa el estado del API Gateway.",
        );
      }
    },
    onError: (error: unknown) => {
      const errorMessage = extractErrorMessage(
        error,
        "Error al crear la categoría",
      );
      showError("Error al Crear", errorMessage);
      console.error("Error al crear categoría:", error);
    },
  });
}

/**
 * Hook para actualizar una categoría existente
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCategoryDto;
    }): Promise<CategoryMutationResponse> => {
      const response = await httpClient.put(`/categories/${id}`, data);
      return response as CategoryMutationResponse;
    },
    onSuccess: (data, variables) => {
      if (data.success && data.data && !isQueuedResponse(data)) {
        showSuccess(
          "Categoría Actualizada",
          "Los cambios se guardaron correctamente",
        );
        queryClient.invalidateQueries({
          queryKey: categoryKeys.detail(variables.id),
        });
        queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
        queryClient.invalidateQueries({ queryKey: resourceKeys.categories });
        queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
        return;
      }

      showError(
        "Operación pendiente",
        "La actualización fue aceptada pero no confirmada. Verifica que el gateway esté en modo síncrono para categorías.",
      );
    },
    onError: (error: unknown) => {
      const errorMessage = extractErrorMessage(
        error,
        "Error al actualizar la categoría",
      );
      showError("Error al Actualizar", errorMessage);
      console.error("Error al actualizar categoría:", error);
    },
  });
}

/**
 * Hook para eliminar una categoría
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await httpClient.delete(`/categories/${id}`);
      return id;
    },
    onSuccess: (id) => {
      showSuccess(
        "Categoría Eliminada",
        "La categoría se eliminó correctamente",
      );
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: resourceKeys.categories });
    },
    onError: (error: unknown) => {
      const errorMessage = extractErrorMessage(
        error,
        "Error al eliminar la categoría",
      );
      showError("Error al Eliminar", errorMessage);
      console.error("Error al eliminar categoría:", error);
    },
  });
}
