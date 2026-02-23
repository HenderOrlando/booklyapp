import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/infrastructure/http";
import { AVAILABILITY_ENDPOINTS, buildUrl } from "@/infrastructure/api/endpoints";
import type { 
  RequestReassignmentDto, 
  RespondReassignmentDto,
  ReassignmentResponseDto,
  ReassignmentHistoryResponseDto 
} from "@/types/entities/reassignment";

/**
 * Extrae un array de la respuesta, soportando formato directo y paginado.
 */
function extractArray(data: unknown): ReassignmentHistoryResponseDto[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "items" in data && Array.isArray((data as Record<string, unknown>).items)) {
    return (data as Record<string, unknown>).items as ReassignmentHistoryResponseDto[];
  }
  return [];
}

export const reassignmentKeys = {
  all: ["reassignments"] as const,
  history: () => [...reassignmentKeys.all, "history"] as const,
  pending: () => [...reassignmentKeys.all, "pending"] as const,
};

/**
 * Hook para la gestión de reasignaciones (RF-15)
 * Carga datos desde el backend en modo server usando endpoints centralizados.
 */
export function useReassignment() {
  const queryClient = useQueryClient();

  // Obtener historial completo propio de reasignaciones
  const useHistory = () => {
    return useQuery<ReassignmentHistoryResponseDto[]>({
      queryKey: reassignmentKeys.history(),
      queryFn: async () => {
        const response = await httpClient.get(
          AVAILABILITY_ENDPOINTS.REASSIGNMENT_MY_HISTORY
        );
        return extractArray(response.data);
      },
      retry: 1,
    });
  };

  // Obtener solo reasignaciones pendientes (sin respuesta del usuario)
  const usePending = () => {
    return useQuery<ReassignmentHistoryResponseDto[]>({
      queryKey: reassignmentKeys.pending(),
      queryFn: async () => {
        const url = buildUrl(AVAILABILITY_ENDPOINTS.REASSIGNMENT_MY_HISTORY, {
          pending: true,
        });
        const response = await httpClient.get(url);
        return extractArray(response.data);
      },
      retry: 1,
    });
  };

  // Solicitar alternativas de reasignación
  const requestReassignment = useMutation<ReassignmentResponseDto, Error, RequestReassignmentDto>({
    mutationFn: async (dto) => {
      const response = await httpClient.post<ReassignmentResponseDto>(
        AVAILABILITY_ENDPOINTS.REASSIGNMENT_REQUEST,
        dto
      );
      return response.data;
    },
  });

  // Responder a una sugerencia de reasignación
  const respondToReassignment = useMutation<void, Error, RespondReassignmentDto>({
    mutationFn: async (dto) => {
      await httpClient.post(AVAILABILITY_ENDPOINTS.REASSIGNMENT_RESPOND, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reassignmentKeys.all });
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });

  return {
    useHistory,
    usePending,
    requestReassignment,
    respondToReassignment,
  };
}
