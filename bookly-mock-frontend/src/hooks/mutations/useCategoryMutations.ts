/**
 * useCategoryMutations - Mutations para Categorías
 *
 * Dominio: Categories (Categorías de Recursos)
 *
 * Gestiona operaciones de escritura sobre categorías de recursos
 */

import { useToast } from "@/hooks/useToast";
import { httpClient } from "@/infrastructure/http/httpClient";
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
    mutationFn: async (data: CreateCategoryDto) => {
      const response = await httpClient.post("/categories", data);
      return response;
    },
    onSuccess: (data: any) => {
      const name = data?.data?.name || "Categoría";
      showSuccess(
        "Categoría Creada",
        `La categoría "${name}" se creó exitosamente`
      );
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: resourceKeys.categories });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al crear la categoría";
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
    }) => {
      const response = await httpClient.put(`/categories/${id}`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      showSuccess(
        "Categoría Actualizada",
        "Los cambios se guardaron correctamente"
      );
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: resourceKeys.categories });
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al actualizar la categoría";
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
        "La categoría se eliminó correctamente"
      );
      queryClient.invalidateQueries({
        queryKey: categoryKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: resourceKeys.categories });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al eliminar la categoría";
      showError("Error al Eliminar", errorMessage);
      console.error("Error al eliminar categoría:", error);
    },
  });
}
