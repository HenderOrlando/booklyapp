import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "@/infrastructure/http";
import type { 
  RequestReassignmentDto, 
  RespondReassignmentDto,
  ReassignmentResponseDto,
  ReassignmentHistoryResponseDto 
} from "@/types/entities/reassignment";

/**
 * Hook para la gestión de reasignaciones (RF-15)
 */
export function useReassignment() {
  const queryClient = useQueryClient();

  // Obtener historial propio de reasignaciones
  const useHistory = () => {
    return useQuery<ReassignmentHistoryResponseDto[]>({
      queryKey: ["reassignments", "history"],
      queryFn: async () => {
        const response = await httpClient.get("reassignments/my-history");
        return response.data;
      },
    });
  };

  // Solicitar alternativas de reasignación
  const requestReassignment = useMutation<ReassignmentResponseDto, Error, RequestReassignmentDto>({
    mutationFn: async (dto) => {
      const response = await httpClient.post("reassignments/request", dto);
      return response.data;
    },
  });

  // Responder a una sugerencia de reasignación
  const respondToReassignment = useMutation<void, Error, RespondReassignmentDto>({
    mutationFn: async (dto) => {
      await httpClient.post("reassignments/respond", dto);
    },
    onSuccess: () => {
      // Invalida historial y reservas para reflejar el cambio
      queryClient.invalidateQueries({ queryKey: ["reassignments", "history"] });
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });

  return {
    useHistory,
    requestReassignment,
    respondToReassignment,
  };
}
