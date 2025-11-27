import { useToast } from "@/hooks/useToast";
import {
  ApprovalsClient,
  type ApproveStepDto,
  type RejectStepDto,
} from "@/infrastructure/api/approvals-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as React from "react";

/**
 * useApprovalActions - Custom Hook
 *
 * Hook personalizado para manejar acciones de aprobación (aprobar, rechazar, comentar, delegar).
 * Centraliza la lógica de mutations y manejo de estado.
 * Integrado con ApprovalsClient y useApprovalRequests.
 *
 * @example
 * ```tsx
 * const { approve, reject, comment, isLoading } = useApprovalActions();
 *
 * approve.mutate({ id: "apr_001", stepName: "FIRST_LEVEL", comment: "Aprobado" });
 * reject.mutate({ id: "apr_002", stepName: "FIRST_LEVEL", comment: "Recursos no disponibles" });
 * ```
 */

export interface ApproveParams {
  id: string;
  stepName: string;
  comment: string;
}

export interface RejectParams {
  id: string;
  stepName: string;
  comment: string;
}

export interface CancelParams {
  id: string;
  reason: string;
}

export function useApprovalActions() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  // Mutation para aprobar
  const approve = useMutation({
    mutationFn: async ({ id, stepName, comment }: ApproveParams) => {
      const data: ApproveStepDto = {
        stepName,
        comment,
      };
      return await ApprovalsClient.approveRequest(id, data);
    },
    onSuccess: (data, variables) => {
      setLastAction("approve");
      // Invalidar queries relevantes usando approvalKeys pattern
      queryClient.invalidateQueries({ queryKey: ["approvals", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["approvals", "detail", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["approvals", "statistics"] });

      // Notificación de éxito
      showSuccess(
        "Solicitud Aprobada",
        "La solicitud ha sido aprobada exitosamente"
      );
    },
    onError: (error: any) => {
      console.error("❌ Error al aprobar:", error);
      const errorMessage =
        error?.response?.data?.message || "Error al aprobar la solicitud";
      showError("Error al Aprobar", errorMessage);
    },
  });

  // Mutation para rechazar
  const reject = useMutation({
    mutationFn: async ({ id, stepName, comment }: RejectParams) => {
      const data: RejectStepDto = {
        stepName,
        comment,
      };
      return await ApprovalsClient.rejectRequest(id, data);
    },
    onSuccess: (data, variables) => {
      setLastAction("reject");
      queryClient.invalidateQueries({ queryKey: ["approvals", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["approvals", "detail", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["approvals", "statistics"] });

      showSuccess("Solicitud Rechazada", "La solicitud ha sido rechazada");
    },
    onError: (error: any) => {
      console.error("❌ Error al rechazar:", error);
      const errorMessage =
        error?.response?.data?.message || "Error al rechazar la solicitud";
      showError("Error al Rechazar", errorMessage);
    },
  });

  // Mutation para cancelar
  const cancel = useMutation({
    mutationFn: async ({ id, reason }: CancelParams) => {
      return await ApprovalsClient.cancelRequest(id, reason);
    },
    onSuccess: (data, variables) => {
      setLastAction("cancel");
      queryClient.invalidateQueries({ queryKey: ["approvals", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["approvals", "detail", variables.id],
      });

      showSuccess("Solicitud Cancelada", "La solicitud ha sido cancelada");
    },
    onError: (error: any) => {
      console.error("❌ Error al cancelar:", error);
      const errorMessage =
        error?.response?.data?.message || "Error al cancelar la solicitud";
      showError("Error al Cancelar", errorMessage);
    },
  });

  // Estado de carga combinado
  const isLoading = approve.isPending || reject.isPending || cancel.isPending;

  // Estado de error combinado
  const error = approve.error || reject.error || cancel.error;

  // Reset del último action
  const resetLastAction = () => setLastAction(null);

  return {
    approve,
    reject,
    cancel,
    isLoading,
    error,
    lastAction,
    resetLastAction,
  };
}
