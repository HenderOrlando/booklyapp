/**
 * useProgramMutations - Mutations para Programas Académicos
 *
 * Dominio: Programs (Programas Académicos)
 *
 * Gestiona operaciones de escritura sobre programas académicos
 */

import { useToast } from "@/hooks/useToast";
import { httpClient } from "@/infrastructure/http/httpClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * DTO para crear un programa
 */
export interface CreateProgramDto {
  name: string;
  code: string;
  description?: string;
  facultyId?: string;
  coordinatorId?: string;
  isActive?: boolean;
}

/**
 * DTO para actualizar un programa
 */
export interface UpdateProgramDto extends Partial<CreateProgramDto> {}

// ============================================
// CACHE KEYS
// ============================================

export const programKeys = {
  all: ["programs"] as const,
  lists: () => [...programKeys.all, "list"] as const,
  list: (filters?: string) => [...programKeys.lists(), { filters }] as const,
  details: () => [...programKeys.all, "detail"] as const,
  detail: (id: string) => [...programKeys.details(), id] as const,
};

// ============================================
// MUTATIONS
// ============================================

/**
 * Hook para crear un nuevo programa académico
 *
 * @example
 * ```typescript
 * const createProgram = useCreateProgram();
 *
 * createProgram.mutate({
 *   name: "Ingeniería de Sistemas",
 *   code: "ING-SIS",
 *   facultyId: "fac-123"
 * });
 * ```
 */
export function useCreateProgram() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (data: CreateProgramDto) => {
      const response = await httpClient.post("/programs", data);
      return response;
    },
    onSuccess: (data: any) => {
      const name = data?.data?.name || "Programa";
      showSuccess(
        "Programa Creado",
        `El programa "${name}" se creó exitosamente`
      );
      queryClient.invalidateQueries({ queryKey: programKeys.lists() });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al crear el programa";
      showError("Error al Crear", errorMessage);
      console.error("Error al crear programa:", error);
    },
  });
}

/**
 * Hook para actualizar un programa existente
 */
export function useUpdateProgram() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProgramDto;
    }) => {
      const response = await httpClient.put(`/programs/${id}`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      showSuccess(
        "Programa Actualizado",
        "Los cambios se guardaron correctamente"
      );
      queryClient.invalidateQueries({
        queryKey: programKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: programKeys.lists() });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al actualizar el programa";
      showError("Error al Actualizar", errorMessage);
      console.error("Error al actualizar programa:", error);
    },
  });
}

/**
 * Hook para eliminar un programa
 */
export function useDeleteProgram() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      await httpClient.delete(`/programs/${id}`);
      return id;
    },
    onSuccess: (id) => {
      showSuccess("Programa Eliminado", "El programa se eliminó correctamente");
      queryClient.invalidateQueries({
        queryKey: programKeys.detail(id),
      });
      queryClient.invalidateQueries({ queryKey: programKeys.lists() });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al eliminar el programa";
      showError("Error al Eliminar", errorMessage);
      console.error("Error al eliminar programa:", error);
    },
  });
}

/**
 * Hook para asociar recursos a un programa
 */
export function useAssignResourcesToProgram() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (data: { programId: string; resourceIds: string[] }) => {
      const response = await httpClient.post(
        `/programs/${data.programId}/resources`,
        { resourceIds: data.resourceIds }
      );
      return response;
    },
    onSuccess: () => {
      showSuccess(
        "Recursos Asignados",
        "Los recursos se asignaron correctamente al programa"
      );
      queryClient.invalidateQueries({ queryKey: programKeys.lists() });
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al asignar recursos";
      showError("Error al Asignar", errorMessage);
      console.error("Error al asignar recursos:", error);
    },
  });
}
