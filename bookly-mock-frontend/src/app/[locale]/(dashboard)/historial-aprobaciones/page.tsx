"use client";

import { ApprovalStatusBadge } from "@/components/atoms/ApprovalStatusBadge";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import { Input } from "@/components/atoms/Input";
import { ApprovalTimeline } from "@/components/molecules/ApprovalTimeline";
import type { ApprovalStatus } from "@/types/entities/approval";
import {
  useApprovalHistory,
  useCanViewAllApprovals,
} from "@/hooks/useApprovalHistory";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertTriangle,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  Download,
  Eye,
  FileText,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

/**
 * Página de Historial de Aprobaciones - /historial-aprobaciones
 *
 * Muestra el historial completo de aprobaciones con timeline expandible.
 * Implementa RF-25 (Registro y trazabilidad de aprobaciones).
 *
 * - Modo server: carga datos reales desde backend via useApprovalHistory.
 * - Usuario normal: solo ve sus propias aprobaciones pasadas.
 * - Admin/Coordinador: ve todas las aprobaciones del sistema.
 */

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

export default function HistorialAprobacionesPage() {
  const t = useTranslations("approvals");
  const canViewAll = useCanViewAllApprovals();

  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(
    new Set(),
  );
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [searchInput, setSearchInput] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  const { data: paginatedData, isLoading, error } = useApprovalHistory({
    status: filterStatus !== "all" ? (filterStatus as ApprovalStatus) : undefined,
    search: debouncedSearch || undefined,
    page: currentPage,
    limit: PAGE_SIZE,
  });

  const items = paginatedData?.items || [];
  const meta = paginatedData?.meta;
  const totalPages = meta?.totalPages || 1;
  const totalItems = meta?.total || 0;

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleExportCSV = () => {
    if (!items.length) return;

    const headers = [
      "ID",
      "Usuario",
      "Email",
      "Recurso",
      "Tipo Recurso",
      "Propósito",
      "Estado",
      "Fecha Solicitud",
      "Fecha Resolución",
      "Aprobado Por",
      "Razón Rechazo",
    ];

    const rows = items.map((item) => [
      item.id,
      item.userName,
      item.userEmail,
      item.resourceName,
      item.resourceType,
      item.purpose,
      item.status,
      item.requestedAt ? format(new Date(item.requestedAt), "yyyy-MM-dd HH:mm") : "",
      item.reviewedAt ? format(new Date(item.reviewedAt), "yyyy-MM-dd HH:mm") : "",
      item.reviewerName || "",
      item.rejectionReason || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `historial-aprobaciones-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-[var(--color-state-info-bg)] rounded-lg">
                <FileText className="h-6 w-6 text-[var(--color-state-info-text)]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                  {t("history_title")}
                </h1>
                <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mt-1">
                  {t("history_description")}
                </p>
              </div>
            </div>
          </div>
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t("export_csv")}
          </Button>
        </div>

        {/* Indicador de alcance */}
        {canViewAll && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-state-info-bg)] border border-[var(--color-state-info-border)]">
            <ShieldCheck className="h-4 w-4 text-[var(--color-state-info-text)]" />
            <span className="text-sm text-[var(--color-state-info-text)]">
              {t("admin_view_all_approvals")}
            </span>
          </div>
        )}
        {!canViewAll && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--color-bg-muted)] border border-[var(--color-border-subtle)]">
            <Eye className="h-4 w-4 text-[var(--color-text-secondary)]" />
            <span className="text-sm text-[var(--color-text-secondary)]">
              {t("user_view_own_approvals")}
            </span>
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
            <Input
              type="text"
              placeholder={t("search_history_placeholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-full sm:w-64">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder={t("all_statuses")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_statuses")}</SelectItem>
                <SelectItem value="APPROVED">{t("status.approved")}</SelectItem>
                <SelectItem value="REJECTED">{t("status.rejected")}</SelectItem>
                <SelectItem value="CANCELLED">{t("status.cancelled")}</SelectItem>
                <SelectItem value="EXPIRED">{t("status_expired")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de historial */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-action-primary)]" />
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-[var(--color-state-error-bg)] rounded-lg border border-[var(--color-state-error-border)]">
            <AlertTriangle className="h-12 w-12 text-[var(--color-state-error-text)] mx-auto mb-3" />
            <p className="text-[var(--color-state-error-text)] font-medium">
              {t("error_loading_history")}
            </p>
            <p className="text-sm text-[var(--color-state-error-text)] mt-1 opacity-75">
              {error instanceof Error ? error.message : String(error)}
            </p>
          </div>
        ) : items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item) => {
              const isExpanded = expandedItems.has(item.id);

              return (
                <div
                  key={item.id}
                  className="bg-[var(--color-bg-surface)] rounded-lg border border-[var(--color-border-subtle)] overflow-hidden"
                >
                  {/* Header colapsable */}
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-bg-tertiary)]/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <ApprovalStatusBadge status={item.status} />

                      <div className="text-left flex-1">
                        <h3 className="font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                          {item.resourceName}
                        </h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                          <span>{item.userName}</span>
                          <span>•</span>
                          <span>
                            {format(new Date(item.requestedAt), "d MMM yyyy", {
                              locale: es,
                            })}
                          </span>
                          {item.reviewedAt && (
                            <>
                              <span>•</span>
                              <span>
                                {t("reviewed_at")}{" "}
                                {format(
                                  new Date(item.reviewedAt),
                                  "d MMM yyyy",
                                  {
                                    locale: es,
                                  },
                                )}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {item.priority === "URGENT" && (
                        <Badge variant="error">{t("priority.urgent")}</Badge>
                      )}
                      {item.priority === "HIGH" && (
                        <Badge variant="warning">{t("priority.high")}</Badge>
                      )}
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-[var(--color-text-tertiary)]" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-[var(--color-text-tertiary)]" />
                    )}
                  </button>

                  {/* Contenido expandible */}
                  {isExpanded && (
                    <div className="px-6 py-4 border-t border-[var(--color-border-subtle)] space-y-4">
                      {/* Información detallada */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-2">
                            {t("requester")}
                          </p>
                          <p className="text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                            {item.userName}
                          </p>
                          <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                            {item.userEmail} • {item.userRole}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-2">
                            {t("resource")}
                          </p>
                          <p className="text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                            {item.resourceName}
                          </p>
                          <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                            {item.resourceType} • {item.categoryName}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-2">
                            {t("reservation_date")}
                          </p>
                          <div className="flex items-center gap-2 text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                            <Calendar className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                            {format(
                              new Date(item.startDate),
                              "d 'de' MMMM, yyyy",
                              {
                                locale: es,
                              },
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mt-1">
                            <Clock className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                            {format(new Date(item.startDate), "HH:mm")} -{" "}
                            {format(new Date(item.endDate), "HH:mm")}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-2">
                            {t("purpose")}
                          </p>
                          <p className="text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] text-sm">
                            {item.purpose}
                          </p>
                          <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mt-1">
                            {t("attendees_count", { count: item.attendees })}
                          </p>
                        </div>
                      </div>

                      {/* Comentarios / Razón de rechazo */}
                      {item.comments && (
                        <div className="p-3 bg-[var(--color-state-success-bg)] rounded-lg">
                          <p className="text-sm font-medium text-[var(--color-state-success-text)] mb-1">
                            {t("history")}
                          </p>
                          <p className="text-sm text-[var(--color-state-success-text)]">
                            {item.comments}
                          </p>
                        </div>
                      )}
                      {item.rejectionReason && (
                        <div className="p-3 bg-[var(--color-state-error-bg)] rounded-lg">
                          <p className="text-sm font-medium text-[var(--color-state-error-text)] mb-1">
                            {t("rejection_reason_title")}
                          </p>
                          <p className="text-sm text-[var(--color-state-error-text)]">
                            {item.rejectionReason}
                          </p>
                        </div>
                      )}

                      {/* Timeline de historial */}
                      {item.history && item.history.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-3">
                            {t("action_history")}
                          </p>
                          <ApprovalTimeline history={item.history} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-[var(--color-bg-surface)] rounded-lg border border-[var(--color-border-subtle)]">
            <FileText className="h-12 w-12 text-[var(--color-text-tertiary)] dark:text-[var(--color-text-secondary)] mx-auto mb-3" />
            <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
              {t("no_records_found")}
            </p>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
              {t("showing_records", {
                count: items.length,
                total: totalItems,
              })}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] px-2">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Resumen (cuando hay una sola página) */}
        {totalPages <= 1 && items.length > 0 && (
          <div className="text-center text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
            {t("showing_records", {
              count: items.length,
              total: totalItems,
            })}
          </div>
        )}
      </div>
    </>
  );
}
