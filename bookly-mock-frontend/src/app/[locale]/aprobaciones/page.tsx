"use client";

import { ApprovalCard } from "@/components/molecules/ApprovalCard";
import { LoadingState } from "@/components/molecules/LoadingState";
import { AppHeader } from "@/components/organisms/AppHeader";
import { ApprovalModal } from "@/components/organisms/ApprovalModal";
import { AppSidebar } from "@/components/organisms/AppSidebar/AppSidebar";
import { MainLayout } from "@/components/templates/MainLayout";
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
  Search,
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
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const t = useTranslations("approvals");

  // Hooks centralizados
  const { approve, reject, cancel } = useApprovalActions();
  const { generate } = useDocumentGeneration();

  const [filters, setFilters] = React.useState<ApprovalFilters>({});
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
        req.purpose?.toLowerCase().includes(query)
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
        }
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
        }
      );
    }
  };

  const handleModalComment = (commentText: string) => {
    // Comentarios ahora se manejan como parte de aprobar/rechazar
    console.warn(
      "handleModalComment deprecated - use approve/reject with comment"
    );
  };

  const handleModalDelegate = (userId: string, comments: string) => {
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
    medium: "email" | "sms" | "whatsapp"
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
            t("share_success_desc", { medium })
          );
        },
      }
    );
  };

  return (
    <MainLayout header={<AppHeader />} sidebar={<AppSidebar />}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {t("title")}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t("description")}
          </p>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("stats.pending")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.totalPending || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("stats.approved")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.totalApproved || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("stats.rejected")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.totalRejected || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("stats.average_time")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
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

        {/* Filtros y búsqueda */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
            <Filter className="h-4 w-4" />
            {t("filters")}
          </button>
        </div>

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
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>{t("no_requests")}</p>
          </div>
        )}
      </div>

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
    </MainLayout>
  );
}
