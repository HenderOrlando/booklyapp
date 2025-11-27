"use client";

import { LoadingState } from "@/components/molecules/LoadingState";
import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar/AppSidebar";
import { MainLayout } from "@/components/templates/MainLayout";
import { useApprovalActions } from "@/hooks/useApprovalActions";
import { useApprovalRequest } from "@/hooks/useApprovalRequests";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  MapPin,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";

/**
 * Página de Detalle de Aprobación - /aprobaciones/[id]
 *
 * Muestra información detallada de una solicitud de aprobación
 * y permite ejecutar acciones (aprobar/rechazar).
 * Implementa RF-20, RF-22, RF-25.
 */

const getStatusColor = (status?: string) => {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    case "APPROVED":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "REJECTED":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    case "IN_REVIEW":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    case "CANCELLED":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  }
};

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case "URGENT":
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    case "HIGH":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
    case "NORMAL":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    case "LOW":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  }
};

export default function ApprovalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("approvals");
  const id = params?.id as string;

  // Hooks
  const { data: request, isLoading, error } = useApprovalRequest(id);
  const {
    approve,
    reject,
    cancel,
    isLoading: isActionLoading,
  } = useApprovalActions();

  // Estado local
  const [showApproveModal, setShowApproveModal] = React.useState(false);
  const [showRejectModal, setShowRejectModal] = React.useState(false);
  const [comment, setComment] = React.useState("");

  const handleApprove = () => {
    if (!request) return;
    approve.mutate(
      {
        id: request.id,
        stepName: request.currentLevel || "FIRST_LEVEL",
        comment: comment || t("approve_comment_default") || "Aprobado",
      },
      {
        onSuccess: () => {
          setShowApproveModal(false);
          setComment("");
          router.push("/aprobaciones");
        },
      }
    );
  };

  const handleReject = () => {
    if (!request || !comment.trim()) return;
    reject.mutate(
      {
        id: request.id,
        stepName: request.currentLevel || "FIRST_LEVEL",
        comment: comment,
      },
      {
        onSuccess: () => {
          setShowRejectModal(false);
          setComment("");
          router.push("/aprobaciones");
        },
      }
    );
  };

  const handleCancel = () => {
    if (!request) return;
    const reason = prompt(t("cancel_reason_prompt"));
    if (!reason) return;

    cancel.mutate(
      { id: request.id, reason },
      {
        onSuccess: () => router.push("/aprobaciones"),
      }
    );
  };

  if (isLoading) {
    return (
      <MainLayout header={<AppHeader />} sidebar={<AppSidebar />}>
        <div className="py-12">
          <LoadingState message={t("loading_detail")} />
        </div>
      </MainLayout>
    );
  }

  if (error || !request) {
    return (
      <MainLayout header={<AppHeader />} sidebar={<AppSidebar />}>
        <div className="max-w-4xl mx-auto py-12">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-900 dark:text-red-100 mb-2">
              {t("error_loading")}
            </h2>
            <p className="text-red-700 dark:text-red-300 mb-4">
              {error?.message || t("request_not_found")}
            </p>
            <button
              onClick={() => router.push("/aprobaciones")}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              {t("back_to_list")}
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout header={<AppHeader />} sidebar={<AppSidebar />}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t("detail_title")}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              ID: {request.id}
            </p>
          </div>
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}
            >
              {t(`status.${request.status?.toLowerCase()}`)}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(request.priority)}`}
            >
              {t(`priority.${request.priority?.toLowerCase()}`)}
            </span>
          </div>
        </div>

        {/* Main Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t("request_information")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Solicitante */}
            <div className="flex gap-3">
              <User className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("requester")}
                </p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {request.userName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {request.userEmail}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  {request.userRole}
                </p>
              </div>
            </div>

            {/* Recurso */}
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("resource")}
                </p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {request.resourceName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {request.resourceType} - {request.categoryName}
                </p>
              </div>
            </div>

            {/* Fecha y Hora */}
            <div className="flex gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("schedule")}
                </p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {new Date(request.startDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(request.startDate).toLocaleTimeString()} -{" "}
                  {new Date(request.endDate).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Asistentes */}
            <div className="flex gap-3">
              <Users className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("attendees")}
                </p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {request.attendees || 0} {t("people")}
                </p>
              </div>
            </div>
          </div>

          {/* Propósito */}
          {request.purpose && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                <FileText className="h-5 w-5 text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {t("purpose")}
                  </p>
                  <p className="text-gray-900 dark:text-gray-100">
                    {request.purpose}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Timeline / History */}
        {request.history && request.history.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t("history")}
            </h2>
            <div className="space-y-4">
              {request.history.map((entry, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`p-2 rounded-full ${
                        entry.action === "APPROVE"
                          ? "bg-green-100 dark:bg-green-900/20"
                          : entry.action === "REJECT"
                            ? "bg-red-100 dark:bg-red-900/20"
                            : "bg-blue-100 dark:bg-blue-900/20"
                      }`}
                    >
                      {entry.action === "APPROVE" ? (
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : entry.action === "REJECT" ? (
                        <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      ) : (
                        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    {index < request.history!.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {entry.action} - {entry.level}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {entry.performerName} •{" "}
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                    {entry.comments && (
                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-3 rounded">
                        {entry.comments}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {request.status === "PENDING" && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t("actions")}
            </h2>
            <div className="flex gap-4">
              <button
                onClick={() => setShowApproveModal(true)}
                disabled={isActionLoading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <CheckCircle className="h-5 w-5 inline mr-2" />
                {t("approve")}
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={isActionLoading}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <XCircle className="h-5 w-5 inline mr-2" />
                {t("reject")}
              </button>
              <button
                onClick={handleCancel}
                disabled={isActionLoading}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {t("cancel_request")}
              </button>
            </div>
          </div>
        )}

        {/* Approve Modal */}
        {showApproveModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {t("approve_confirmation")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("approve_confirmation_text")}
              </p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("comment_optional")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 mb-4"
                rows={3}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={isActionLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {t("confirm")}
                </button>
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setComment("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t("cancel")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {t("reject_confirmation")}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {t("reject_confirmation_text")}
              </p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("reject_reason_required")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 mb-4"
                rows={3}
                required
              />
              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  disabled={isActionLoading || !comment.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {t("confirm")}
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setComment("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t("cancel")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
