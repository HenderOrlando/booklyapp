/**
 * usePrograms - Hooks para Programas Académicos
 *
 * Proporciona queries para obtener programas académicos y sus detalles
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import type { AcademicProgram } from "@/types/entities/resource";
import { useQuery } from "@tanstack/react-query";

// ============================================
// CACHE KEYS
// ============================================

export const programKeys = {
  all: ["academic-programs"] as const,
  lists: () => [...programKeys.all, "list"] as const,
  list: (filters?: any) => [...programKeys.lists(), filters] as const,
  details: () => [...programKeys.all, "detail"] as const,
  detail: (id: string) => [...programKeys.details(), id] as const,
  resources: (id: string) => [...programKeys.detail(id), "resources"] as const,
};

// ============================================
// TYPES
// ============================================

export interface ProgramFilters {
  faculty?: string;
  isActive?: boolean;
  search?: string;
}

// ============================================
// QUERIES
// ============================================

/**
 * Hook para obtener todos los programas académicos
 *
 * @example
 * ```typescript
 * const { data: programs, isLoading } = usePrograms();
 * ```
 */
export function usePrograms(filters?: ProgramFilters) {
  return useQuery({
    queryKey: programKeys.list(filters),
    queryFn: async () => {
      const response = await httpClient.get("/academic-programs", {
        params: filters,
      });
      return response.data?.items || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutos (programas cambian poco)
  });
}

/**
 * Hook para obtener un programa académico por ID
 *
 * @param id - ID del programa
 * @param options - Opciones de React Query
 * @example
 * ```typescript
 * const { data: program } = useProgram('prog_001');
 * ```
 */
export function useProgram(id: string, options?: { enabled?: boolean }) {
  return useQuery<AcademicProgram>({
    queryKey: programKeys.detail(id),
    queryFn: async () => {
      const response = await httpClient.get(`/academic-programs/${id}`);
      if (!response.data) {
        throw new Error("Programa no encontrado");
      }
      return response.data;
    },
    enabled: options?.enabled !== false && !!id,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}

/**
 * Hook para obtener los recursos asociados a un programa
 *
 * @param programId - ID del programa
 * @example
 * ```typescript
 * const { data: resources } = useProgramResources('prog_001');
 * ```
 */
export function useProgramResources(programId: string) {
  return useQuery({
    queryKey: programKeys.resources(programId),
    queryFn: async () => {
      const response = await httpClient.get(`/program-resources`, {
        params: { programId },
      });
      return response.data?.items || [];
    },
    enabled: !!programId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
