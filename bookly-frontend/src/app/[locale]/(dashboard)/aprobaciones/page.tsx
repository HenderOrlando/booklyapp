"use client";

import { ApprovalCard } from "@/components/molecules/ApprovalCard";
import { LoadingState } from "@/components/molecules/LoadingState";
import { ApprovalModal } from "@/components/organisms/ApprovalModal";
import { ListLayout } from "@/components/templates/ListLayout";
import { Button } from "@/components/atoms/Button";
import { useApprovalActions } from "@/hooks/useApprovalActions";
import {
  useApprovalRequests,
  useApprovalStatistics,
} from "@/hooks/useApprovalRequests";
import { useDocumentGeneration } from "@/hooks/useDocumentGeneration";
import { useToast } from "@/hooks/useToast";
import type {
  ApprovalFilters,
  ApprovalRequest,
} from "@/types/entities/approval";
import { useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  Clock,
  Filter,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

/**
 * Página de Aprobaciones - /aprobaciones
 *
 * Lista de solicitudes de aprobación con filtros y estadísticas.
 * Implementa RF-20, RF-22, RF-25.
 * Integrado con backend mediante useApprovalRequests y useApprovalStatistics.
 */

export default function AprobacionesPage() {
  const _queryClient = useQueryClient();
  const { showSuccess, showError: _showError } = useToast();
  const t = useTranslations("approvals");

  // Hooks centralizados
  const { approve, reject, cancel: _cancel } = useApprovalActions();
  const { generate } = useDocumentGeneration();

  const [filters, _setFilters] = React.useState<ApprovalFilters>({});
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedRequest, setSelectedRequest] =
    React.useState<ApprovalRequest | null>(null);
  const [showModal, setShowModal] = React.useState(false);

  // Query para obtener solicitudes desde el backend
  const { data: approvalData, isLoading: isLoadingRequests } =
    useApprovalRequests(filters);
  const { data: stats, isLoading: isLoadingStats } = useApprovalStatistics();

  const isLoading = isLoadingRequests || isLoadingStats;
  const requests = approvalData?.items || [];

  // Filtrar por búsqueda local
  const filteredRequests = React.useMemo(() => {
    if (!requests) return [];
    if (!searchQuery) return requests;

    const query = searchQuery.toLowerCase();
    return requests.filter(
      (req) =>
        req.userName?.toLowerCase().includes(query) ||
        req.resourceName?.toLowerCase().includes(query) ||
        req.purpose?.toLowerCase().includes(query),
    );
  }, [requests, searchQuery]);

  const handleApprove = async (id: string) => {
    const request = requests.find((r) => r.id === id);
    if (!request) return;

    approve.mutate({
      id,
      stepName: request.currentLevel || "FIRST_LEVEL",
      comment: t("approve_comment_default") || "Aprobado",
    });
  };

  const handleReject = async (id: string) => {
    const request = requests.find((r) => r.id === id);
    if (!request) return;

    reject.mutate({
      id,
      stepName: request.currentLevel || "FIRST_LEVEL",
      comment: t("reject_reason_default") || "Rechazado",
    });
  };

  const handleViewDetails = (id: string) => {
    const request = requests.find((r) => r.id === id);
    if (request) {
      setSelectedRequest(request);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
  };

  const handleModalApprove = (comment?: string) => {
    if (selectedRequest) {
      approve.mutate(
        {
          id: selectedRequest.id,
          stepName: selectedRequest.currentLevel || "FIRST_LEVEL",
          comment: comment || t("approve_comment_default") || "Aprobado",
        },
        {
          onSuccess: () => handleCloseModal(),
        },
      );
    }
  };

  const handleModalReject = (comment: string) => {
    if (selectedRequest) {
      reject.mutate(
        {
          id: selectedRequest.id,
          stepName: selectedRequest.currentLevel || "FIRST_LEVEL",
          comment: comment || t("reject_reason_default") || "Rechazado",
        },
        {
          onSuccess: () => handleCloseModal(),
        },
      );
    }
  };

  const handleModalComment = (_commentText: string) => {
    // Comentarios ahora se manejan como parte de aprobar/rechazar
    console.warn(
      "handleModalComment deprecated - use approve/reject with comment",
    );
  };

  const handleModalDelegate = (_userId: string, _comments: string) => {
    // Delegación requiere implementación específica en el backend
    console.warn("handleModalDelegate not implemented yet");
  };

  const handleDownload = async (requestId: string) => {
    generate.mutate({
      templateId: "default-approval",
      approvalRequestId: requestId,
      type: "approval",
      variables: {},
    });
  };

  const handleShare = async (
    requestId: string,
    medium: "email" | "sms" | "whatsapp",
  ) => {
    // Simulación de compartir usando el hook de generación por ahora
    // En el futuro usar useShareReport o similar
    generate.mutate(
      {
        templateId: "default-approval",
        approvalRequestId: requestId,
        type: "approval",
        variables: {},
      },
      {
        onSuccess: () => {
          showSuccess(
            t("share_success_title"),
            t("share_success_desc", { medium }),
          );
        },
      },
    );
  };

  return (
    <>
      <ListLayout
        title={t("title")}
        badge={{ text: t("management"), variant: "warning" }}
        onSearch={setSearchQuery}
        actions={
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {t("filters")}
          </Button>
        }
      >
        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-surface rounded-lg border border-line-subtle p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-state-warning-bg rounded-lg">
                  <Clock className="h-5 w-5 text-state-warning-text" />
                </div>
                <div>
                  <p className="text-sm text-content-secondary">
                    {t("stats.pending")}
                  </p>
                  <p className="text-2xl font-bold text-content-primary">
                    {stats.totalPending || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-lg border border-line-subtle p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-state-success-bg rounded-lg">
                  <CheckCircle className="h-5 w-5 text-state-success-text" />
                </div>
                <div>
                  <p className="text-sm text-content-secondary">
                    {t("stats.approved")}
                  </p>
                  <p className="text-2xl font-bold text-content-primary">
                    {stats.totalApproved || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-lg border border-line-subtle p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-state-error-bg rounded-lg">
                  <XCircle className="h-5 w-5 text-state-error-text" />
                </div>
                <div>
                  <p className="text-sm text-content-secondary">
                    {t("stats.rejected")}
                  </p>
                  <p className="text-2xl font-bold text-content-primary">
                    {stats.totalRejected || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-surface rounded-lg border border-line-subtle p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-action-primary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-action-primary" />
                </div>
                <div>
                  <p className="text-sm text-content-secondary">
                    {t("stats.average_time")}
                  </p>
                  <p className="text-2xl font-bold text-content-primary">
                    {stats.averageApprovalTime
                      ? (stats.averageApprovalTime / 60).toFixed(1)
                      : "0"}
                    h
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista de solicitudes */}
        {isLoading ? (
          <div className="py-12">
            <LoadingState message={t("loading")} />
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredRequests.map((request) => (
              <ApprovalCard
                key={request.id}
                request={request}
                onApprove={handleApprove}
                onReject={handleReject}
                onViewDetails={handleViewDetails}
                showActions={request.status === "PENDING"}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-content-tertiary">
            <p>{t("no_requests")}</p>
          </div>
        )}
      </ListLayout>

      {/* Modal de detalle */}
      {selectedRequest && (
        <ApprovalModal
          request={selectedRequest}
          isOpen={showModal}
          onClose={handleCloseModal}
          onApprove={handleModalApprove}
          onReject={handleModalReject}
          onComment={handleModalComment}
          onDelegate={handleModalDelegate}
          onDownload={handleDownload}
          onShare={handleShare}
        />
      )}
    </>
  );
}
