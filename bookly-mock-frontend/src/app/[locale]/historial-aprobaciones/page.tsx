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
import { MainLayout } from "@/components/templates/MainLayout";
import type { ApprovalRequest } from "@/types/entities/approval";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  FileText,
  Search,
} from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

/**
 * Página de Historial de Aprobaciones - /historial-aprobaciones
 *
 * Muestra el historial completo de aprobaciones con timeline expandible.
 * Implementa RF-25 (Registro y trazabilidad de aprobaciones).
 */

// Mock data
const getMockApprovalHistory = (): ApprovalRequest[] => [
  {
    id: "apr_001",
    reservationId: "res_001",
    userId: "user_001",
    userName: "Carlos Rodríguez",
    userEmail: "carlos@ufps.edu.co",
    userRole: "Profesor",
    resourceId: "res_001",
    resourceName: "Auditorio Principal",
    resourceType: "Auditorio",
    categoryName: "Espacios Académicos",
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(
      Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000,
    ).toISOString(),
    purpose: "Conferencia magistral sobre IA",
    attendees: 150,
    status: "APPROVED",
    priority: "HIGH",
    currentLevel: "SECOND_LEVEL",
    maxLevel: "SECOND_LEVEL",
    requestedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    reviewerName: "Dr. López",
    comments: "Aprobado por ser evento institucional importante",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    history: [
      {
        id: "hist_001",
        approvalRequestId: "apr_001",
        action: "SUBMIT",
        performedBy: "user_001",
        performerName: "Carlos Rodríguez",
        level: "FIRST_LEVEL",
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "hist_002",
        approvalRequestId: "apr_001",
        action: "APPROVE",
        performedBy: "coordinator_001",
        performerName: "Dr. López",
        level: "SECOND_LEVEL",
        comments: "Aprobado",
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "apr_002",
    reservationId: "res_002",
    userId: "user_002",
    userName: "María González",
    userEmail: "maria@ufps.edu.co",
    userRole: "Estudiante",
    resourceId: "res_002",
    resourceName: "Sala de Reuniones B",
    resourceType: "Sala",
    categoryName: "Espacios Administrativos",
    startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(
      Date.now() - 1 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000,
    ).toISOString(),
    purpose: "Reunión de grupo",
    attendees: 8,
    status: "REJECTED",
    priority: "NORMAL",
    currentLevel: "FIRST_LEVEL",
    maxLevel: "FIRST_LEVEL",
    requestedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    reviewerName: "Coordinadora Pérez",
    rejectionReason: "Recurso no disponible en el horario solicitado",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    history: [
      {
        id: "hist_003",
        approvalRequestId: "apr_002",
        action: "SUBMIT",
        performedBy: "user_002",
        performerName: "María González",
        level: "FIRST_LEVEL",
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "hist_004",
        approvalRequestId: "apr_002",
        action: "REJECT",
        performedBy: "coordinator_002",
        performerName: "Coordinadora Pérez",
        level: "FIRST_LEVEL",
        reason: "Recurso no disponible",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
];

export default function HistorialAprobacionesPage() {
  const t = useTranslations("approvals");
  const [expandedItems, setExpandedItems] = React.useState<Set<string>>(
    new Set(),
  );
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const { data: history, isLoading } = useQuery({
    queryKey: ["approval-history"],
    queryFn: async () => getMockApprovalHistory(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

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

  const filteredHistory = React.useMemo(() => {
    if (!history) return [];

    return history.filter((item) => {
      // Filtro de estado
      if (filterStatus !== "all" && item.status !== filterStatus) return false;

      // Filtro de búsqueda
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.userName.toLowerCase().includes(query) ||
          item.resourceName.toLowerCase().includes(query) ||
          item.purpose.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [history, filterStatus, searchQuery]);

  const handleExportCSV = () => {
    console.log("Exportando historial a CSV...");
    // TODO: Implementar exportación CSV
  };

  return (
    <MainLayout>
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

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-tertiary)]" />
            <Input
              type="text"
              placeholder={t("search_history_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
        ) : filteredHistory.length > 0 ? (
          <div className="space-y-3">
            {filteredHistory.map((item) => {
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

        {/* Resumen */}
        {filteredHistory.length > 0 && (
          <div className="text-center text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
            {t("showing_records", {
              count: filteredHistory.length,
              total: history?.length || 0,
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
