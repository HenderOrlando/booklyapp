/**
 * useEvaluations - Hook para Evaluaciones Administrativas (RF-35)
 *
 * Gestiona evaluaciones de usuarios por parte del staff
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface UserEvaluation {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  complianceScore: number;
  careScore: number;
  punctualityScore: number;
  overallScore: number;
  totalReservations: number;
  notes?: string;
}

export const evaluationKeys = {
  all: ["evaluations"] as const,
  lists: () => [...evaluationKeys.all, "list"] as const,
  detail: (userId: string) => [...evaluationKeys.all, "detail", userId] as const,
};

export function useEvaluations() {
  return useQuery<UserEvaluation[]>({
    queryKey: evaluationKeys.lists(),
    queryFn: async () => {
      const response = await httpClient.get("evaluations");
      return response.data?.items || response.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useEvaluation(userId: string) {
  return useQuery<UserEvaluation>({
    queryKey: evaluationKeys.detail(userId),
    queryFn: async () => {
      const response = await httpClient.get(`evaluations/${userId}`);
      if (!response.data) throw new Error("Evaluación no encontrada");
      return response.data;
    },
    enabled: !!userId,
  });
}

export function useSaveEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (evaluation: Partial<UserEvaluation> & { userId: string }) => {
      const response = await httpClient.post(`evaluations/${evaluation.userId}`, evaluation);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: evaluationKeys.all });
    },
  });
}
