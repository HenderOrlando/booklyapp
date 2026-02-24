/**
 * useFeedback - Hooks de consulta para Feedback y Evaluaciones
 *
 * Dominio: Feedback (RF-34, RF-35)
 */

import {
  FeedbackClient,
  type Evaluation,
  type EvaluationFilters,
  type Feedback,
  type FeedbackFilters,
} from "@/infrastructure/api/feedback-client";
import type { PaginatedResponse } from "@/infrastructure/api/types";
import { useQuery } from "@tanstack/react-query";
import { feedbackKeys } from "./mutations/useFeedbackMutations";

// ============================================
// FEEDBACK QUERIES
// ============================================

/**
 * Hook para obtener lista de feedbacks
 */
export function useFeedbackList(filters?: FeedbackFilters) {
  return useQuery<PaginatedResponse<Feedback>>({
    queryKey: [...feedbackKeys.lists(), filters],
    queryFn: async () => {
      const response = await FeedbackClient.getAll(filters);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al obtener feedbacks");
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook para obtener un feedback por ID
 */
export function useFeedbackDetail(id: string) {
  return useQuery<Feedback>({
    queryKey: feedbackKeys.detail(id),
    queryFn: async () => {
      const response = await FeedbackClient.getById(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al obtener feedback");
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

// ============================================
// EVALUATION QUERIES
// ============================================

/**
 * Hook para obtener lista de evaluaciones
 */
export function useEvaluationList(filters?: EvaluationFilters) {
  return useQuery<PaginatedResponse<Evaluation>>({
    queryKey: [...feedbackKeys.evaluationLists(), filters],
    queryFn: async () => {
      const response = await FeedbackClient.getEvaluations(filters);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al obtener evaluaciones");
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Hook para obtener una evaluación por ID
 */
export function useEvaluationDetail(id: string) {
  return useQuery<Evaluation>({
    queryKey: feedbackKeys.evaluationDetail(id),
    queryFn: async () => {
      const response = await FeedbackClient.getEvaluationById(id);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al obtener evaluación");
      }
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}
