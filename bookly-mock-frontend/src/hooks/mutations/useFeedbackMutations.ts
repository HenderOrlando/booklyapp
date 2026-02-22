/**
 * useFeedbackMutations - Mutations para Feedback y Evaluaciones
 *
 * Dominio: Feedback (RF-34, RF-35)
 *
 * Gestiona operaciones de escritura sobre feedback y evaluaciones
 */

import { useToast } from "@/hooks/useToast";
import {
  FeedbackClient,
  type CreateEvaluationDto,
  type CreateFeedbackDto,
  type UpdateEvaluationDto,
  type UpdateFeedbackDto,
} from "@/infrastructure/api/feedback-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// ============================================
// CACHE KEYS
// ============================================

export const feedbackKeys = {
  all: ["feedback"] as const,
  lists: () => [...feedbackKeys.all, "list"] as const,
  list: (filters?: string) => [...feedbackKeys.lists(), { filters }] as const,
  details: () => [...feedbackKeys.all, "detail"] as const,
  detail: (id: string) => [...feedbackKeys.details(), id] as const,
  evaluations: ["evaluations"] as const,
  evaluationLists: () => [...feedbackKeys.evaluations, "list"] as const,
  evaluationDetail: (id: string) =>
    [...feedbackKeys.evaluations, "detail", id] as const,
};

// ============================================
// FEEDBACK MUTATIONS
// ============================================

export function useCreateFeedback() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (data: CreateFeedbackDto) => {
      const response = await FeedbackClient.create(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al crear feedback");
      }
      return response.data;
    },
    onSuccess: () => {
      showSuccess("Feedback Enviado", "Tu feedback se registró correctamente");
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error ? error.message : "Error al enviar feedback";
      showError("Error", msg);
    },
  });
}

export function useUpdateFeedback() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateFeedbackDto;
    }) => {
      const response = await FeedbackClient.update(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al actualizar feedback");
      }
      return response.data;
    },
    onSuccess: () => {
      showSuccess(
        "Feedback Actualizado",
        "Tu feedback se actualizó correctamente",
      );
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error
          ? error.message
          : "Error al actualizar feedback";
      showError("Error", msg);
    },
  });
}

export function useDeleteFeedback() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await FeedbackClient.delete(id);
      if (!response.success) {
        throw new Error(response.message || "Error al eliminar feedback");
      }
    },
    onSuccess: () => {
      showSuccess("Feedback Eliminado", "El feedback se eliminó correctamente");
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error ? error.message : "Error al eliminar feedback";
      showError("Error", msg);
    },
  });
}

// ============================================
// EVALUATION MUTATIONS
// ============================================

export function useCreateEvaluation() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (data: CreateEvaluationDto) => {
      const response = await FeedbackClient.createEvaluation(data);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al crear evaluación");
      }
      return response.data;
    },
    onSuccess: () => {
      showSuccess(
        "Evaluación Creada",
        "La evaluación se registró correctamente",
      );
      queryClient.invalidateQueries({
        queryKey: feedbackKeys.evaluations,
      });
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error ? error.message : "Error al crear evaluación";
      showError("Error", msg);
    },
  });
}

export function useUpdateEvaluation() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateEvaluationDto;
    }) => {
      const response = await FeedbackClient.updateEvaluation(id, data);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Error al actualizar evaluación");
      }
      return response.data;
    },
    onSuccess: () => {
      showSuccess(
        "Evaluación Actualizada",
        "La evaluación se actualizó correctamente",
      );
      queryClient.invalidateQueries({
        queryKey: feedbackKeys.evaluations,
      });
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error
          ? error.message
          : "Error al actualizar evaluación";
      showError("Error", msg);
    },
  });
}
