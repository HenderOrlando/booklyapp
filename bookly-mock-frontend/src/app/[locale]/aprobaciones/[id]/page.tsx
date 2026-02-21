"use client";

import { Button } from "@/components/atoms/Button";
import { Card, CardContent } from "@/components/atoms/Card";
import { Textarea } from "@/components/atoms/Textarea";
import { ApprovalTimeline } from "@/components/molecules/ApprovalTimeline";
import { ConflictAlert } from "@/components/molecules/ConflictAlert";
import { LoadingState } from "@/components/molecules/LoadingState";
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
      return "bg-state-warning-100 text-yellow-800 dark:bg-state-warning-900/20 dark:text-state-warning-400";
    case "APPROVED":
      return "bg-state-success-100 text-state-success-800 dark:bg-state-success-900/20 dark:text-state-success-400";
    case "REJECTED":
      return "bg-state-error-100 text-state-error-800 dark:bg-state-error-900/20 dark:text-state-error-400";
    case "IN_REVIEW":
      return "bg-brand-primary-100 text-brand-primary-800 dark:bg-brand-primary-900/20 dark:text-brand-primary-400";
    case "CANCELLED":
      return "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] dark:bg-[var(--color-bg-primary)]/20 dark:text-[var(--color-text-tertiary)]";
    default:
      return "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] dark:bg-[var(--color-bg-primary)]/20 dark:text-[var(--color-text-tertiary)]";
  }
};

const getPriorityColor = (priority?: string) => {
  switch (priority) {
    case "URGENT":
      return "bg-state-error-100 text-state-error-800 dark:bg-state-error-900/20 dark:text-state-error-400";
    case "HIGH":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
    case "NORMAL":
      return "bg-brand-primary-100 text-brand-primary-800 dark:bg-brand-primary-900/20 dark:text-brand-primary-400";
    case "LOW":
      return "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] dark:bg-[var(--color-bg-primary)]/20 dark:text-[var(--color-text-tertiary)]";
    default:
      return "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] dark:bg-[var(--color-bg-primary)]/20 dark:text-[var(--color-text-tertiary)]";
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
        comment: comment || t("approve_comment_default"),
      },
      {
        onSuccess: () => {
          setShowApproveModal(false);
          setComment("");
          router.push("/aprobaciones");
        },
      },
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
      },
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
      },
    );
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="py-12">
          <LoadingState message={t("loading_detail")} />
        </div>
      </MainLayout>
    );
  }

  if (error || !request) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-12">
          <div className="bg-state-error-50 dark:bg-state-error-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-state-error-600 dark:text-state-error-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">
              {t("error_loading")}
            </h2>
            <p className="text-[var(--color-text-secondary)] mb-6">
              {error instanceof Error ? error.message : error || t("not_found")}
            </p>
            <Button onClick={() => router.push("/aprobaciones")}>
              {t("back_to_list")}
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-[var(--color-bg-tertiary)] dark:hover:bg-[var(--color-bg-primary)] rounded-lg"
            aria-label={t("back_to_list")}
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
              {t("detail_title")}
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mt-1">
              ID: {request.id}
            </p>
          </div>
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}
            >
              {t(`status.${String(request.status).toLowerCase() as "pending" | "approved" | "rejected" | "in_review" | "cancelled"}`)}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(request.priority)}`}
            >
              {t(`priority.${String(request.priority).toLowerCase() as "urgent" | "high" | "normal" | "low"}`)}
            </span>
          </div>
        </div>

        {/* Alerta de Conflictos */}
        {request.status === "PENDING" && request.resourceId && (
          <ConflictAlert
            resourceId={request.resourceId}
            startDate={request.startDate}
            endDate={request.endDate}
            excludeReservationId={request.reservationId}
          />
        )}

        {/* Main Info Card */}
        <Card className="bg-[var(--color-bg-primary)] border-[var(--color-border-primary)]">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
              {t("request_information")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Solicitante */}
              <div className="flex gap-3">
                <User className="h-5 w-5 text-[var(--color-text-tertiary)] mt-1" />
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {t("requester")}
                  </p>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {request.userName}
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {request.userEmail}
                  </p>
                  <p className="text-sm text-[var(--color-text-tertiary)]">
                    {request.userRole}
                  </p>
                </div>
              </div>

              {/* Recurso */}
              <div className="flex gap-3">
                <MapPin className="h-5 w-5 text-[var(--color-text-tertiary)] mt-1" />
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {t("resource")}
                  </p>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {request.resourceName}
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {request.resourceType} - {request.categoryName}
                  </p>
                </div>
              </div>

              {/* Fecha y Hora */}
              <div className="flex gap-3">
                <Calendar className="h-5 w-5 text-[var(--color-text-tertiary)] mt-1" />
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {t("schedule")}
                  </p>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {new Date(request.startDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {new Date(request.startDate).toLocaleTimeString()} -{" "}
                    {new Date(request.endDate).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              {/* Asistentes */}
              <div className="flex gap-3">
                <Users className="h-5 w-5 text-[var(--color-text-tertiary)] mt-1" />
                <div>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {t("attendees")}
                  </p>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {request.attendees || 0} {t("people")}
                  </p>
                </div>
              </div>
            </div>

            {/* Propósito */}
            {request.purpose && (
              <div className="mt-6 pt-6 border-t border-[var(--color-border-primary)]">
                <div className="flex gap-3">
                  <FileText className="h-5 w-5 text-[var(--color-text-tertiary)] mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-[var(--color-text-secondary)] mb-2">
                      {t("purpose")}
                    </p>
                    <p className="text-[var(--color-text-primary)]">
                      {request.purpose}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline / History */}
        <Card className="bg-[var(--color-bg-primary)] border-[var(--color-border-primary)]">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-[var(--color-action-primary)]" />
              {t("history")}
            </h2>
            <ApprovalTimeline
              history={request.history || []}
              currentLevel={request.currentLevel}
              maxLevel={request.maxLevel}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        {request.status === "PENDING" && (
          <Card className="bg-[var(--color-bg-primary)] border-[var(--color-border-primary)]">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                {t("actions")}
              </h2>
              <div className="flex gap-4">
                <Button
                  onClick={() => setShowApproveModal(true)}
                  disabled={isActionLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {t("approve")}
                </Button>
                <Button
                  onClick={() => setShowRejectModal(true)}
                  disabled={isActionLoading}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  {t("reject")}
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={isActionLoading}
                  variant="outline"
                >
                  {t("cancel_request")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Approve Modal */}
        {showApproveModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="approve-modal-title"
          >
            <Card className="max-w-md w-full">
              <CardContent className="pt-6">
                <h3 id="approve-modal-title" className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                  {t("approve_confirmation")}
                </h3>
                <p className="text-[var(--color-text-secondary)] mb-4">
                  {t("approve_confirmation_text")}
                </p>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t("comment_optional")}
                  className="mb-4"
                  rows={3}
                  aria-label={t("comment_optional")}
                />
                <div className="flex gap-3">
                  <Button
                    onClick={handleApprove}
                    disabled={isActionLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {t("confirm")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowApproveModal(false);
                      setComment("");
                    }}
                    className="flex-1"
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-modal-title"
          >
            <Card className="max-w-md w-full">
              <CardContent className="pt-6">
                <h3 id="reject-modal-title" className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                  {t("reject_confirmation")}
                </h3>
                <p className="text-[var(--color-text-secondary)] mb-4">
                  {t("reject_confirmation_text")}
                </p>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t("reject_reason_required")}
                  className="mb-4"
                  rows={3}
                  required
                  aria-label={t("reject_reason_required")}
                />
                <div className="flex gap-3">
                  <Button
                    onClick={handleReject}
                    disabled={isActionLoading || !comment.trim()}
                    variant="destructive"
                    className="flex-1"
                  >
                    {t("confirm")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRejectModal(false);
                      setComment("");
                    }}
                    className="flex-1"
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
