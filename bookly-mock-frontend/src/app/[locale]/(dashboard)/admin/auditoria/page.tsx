"use client";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import { DataTable } from "@/components/molecules/DataTable";
import { VirtualizedList } from "@/components/organisms/VirtualizedList";
import {
  useAuditLogs,
  getAuditExportUrl,
  type AuditLog,
  type AuditFilters,
  auditKeys,
} from "@/hooks/useAuditLogs";
import { AlertTriangle, Download, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Página de Auditoría - Bookly (RF-44)
 *
 * Mejoras respecto a versión anterior:
 * - React Query para gestión de datos (cache, refetch, stale)
 * - Filtros de rango de fechas (startDate / endDate)
 * - Paginación server-side
 * - Alerta de seguridad para intentos fallidos
 * - Exportación CSV server-side
 */

export default function AuditoriaPage() {
  const t = useTranslations("admin.audit");
  const queryClient = useQueryClient();

  const [useVirtualScrolling, setUseVirtualScrolling] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterAction, setFilterAction] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selectedLog, setSelectedLog] = React.useState<AuditLog | null>(null);
  const [showLogDetail, setShowLogDetail] = React.useState(false);

  const filters: AuditFilters = {
    ...(searchTerm ? { search: searchTerm } : {}),
    ...(filterAction && filterAction !== "all" ? { action: filterAction } : {}),
    ...(filterStatus && filterStatus !== "all" ? { status: filterStatus } : {}),
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
    page,
    limit: 50,
  };

  const { data: logsData, isLoading: loading, isRefetching } = useAuditLogs(filters);
  const logs = logsData?.items || [];
  const meta = logsData?.meta;
  const totalPages = meta?.totalPages || 1;

  // Server-side filters handle the filtering now, but we keep local reference
  const filteredLogs = logs;

  // Security alert: count recent failed logins
  const failedLoginCount = logs.filter(
    (l) => l.action === "login" && l.status === "error",
  ).length;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: auditKeys.all });
  };

  const handleExportCsv = async () => {
    const exportUrl = getAuditExportUrl({
      search: searchTerm || undefined,
      action: filterAction && filterAction !== "all" ? filterAction : undefined,
      status: filterStatus && filterStatus !== "all" ? filterStatus : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
    window.open(exportUrl, "_blank");
  };

  // Columnas de la tabla
  const columns = [
    {
      key: "timestamp",
      header: t("table_timestamp"),
      cell: (log: AuditLog) => (
        <div className="text-sm">
          <div className="font-medium text-foreground">
            {new Date(log.timestamp).toLocaleDateString("es-ES")}
          </div>
          <div className="text-[var(--color-text-tertiary)]">
            {new Date(log.timestamp).toLocaleTimeString("es-ES")}
          </div>
        </div>
      ),
    },
    {
      key: "user",
      header: t("table_user"),
      cell: (log: AuditLog) => (
        <div className="font-medium text-foreground">{log.user}</div>
      ),
    },
    {
      key: "action",
      header: t("table_action"),
      cell: (log: AuditLog) => (
        <Badge
          variant="secondary"
          className="cursor-pointer hover:opacity-80"
          onClick={() => setFilterAction(log.action)}
        >
          {log.action}
        </Badge>
      ),
    },
    {
      key: "entity",
      header: t("table_entity"),
      cell: (log: AuditLog) => (
        <div>
          <div className="font-medium text-foreground">{log.entity}</div>
          {log.entityId && (
            <div className="text-xs text-[var(--color-text-tertiary)]">
              ID: {log.entityId}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "details",
      header: t("table_details"),
      cell: (log: AuditLog) => (
        <div className="text-sm text-[var(--color-text-secondary)] max-w-md truncate">
          {log.details}
        </div>
      ),
    },
    {
      key: "status",
      header: t("table_status"),
      cell: (log: AuditLog) => {
        const variants = {
          success: "success" as const,
          error: "error" as const,
          warning: "warning" as const,
        };
        return (
          <Badge
            variant={variants[log.status]}
            className="cursor-pointer hover:opacity-80"
            onClick={() => setFilterStatus(log.status)}
          >
            {log.status === "success"
              ? t("status_success")
              : log.status === "error"
                ? t("status_error")
                : t("status_warning")}
          </Badge>
        );
      },
    },
    {
      key: "ip",
      header: t("table_ip"),
      cell: (log: AuditLog) => (
        <div className="text-sm text-[var(--color-text-tertiary)]">
          {log.ipAddress}
        </div>
      ),
    },
    {
      key: "actions",
      header: t("actions"),
      cell: (log: AuditLog) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setSelectedLog(log);
            setShowLogDetail(true);
          }}
        >
          {t("view_detail")}
        </Button>
      ),
    },
  ];

  // Estadísticas
  const totalLogs = logs.length;
  const successLogs = logs.filter((l) => l.status === "success").length;
  const errorLogs = logs.filter((l) => l.status === "error").length;
  const uniqueUsers = [...new Set(logs.map((l) => l.user))].length;

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary-500 mx-auto mb-4"></div>
            <p className="text-[var(--color-text-secondary)]">{t("loading")}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
            {t("title")}
          </h2>
          <p className="text-[var(--color-text-secondary)] mt-2">
            {t("description")}
          </p>
        </div>

        {/* Security Alert Banner */}
        {failedLoginCount > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-state-warning-300 bg-state-warning-50 dark:bg-state-warning-900/10 dark:border-state-warning-700">
            <AlertTriangle className="h-5 w-5 text-state-warning-600 dark:text-state-warning-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-state-warning-800 dark:text-state-warning-200">
                {t("security_alert") || `${failedLoginCount} intentos de login fallidos detectados en este periodo`}
              </p>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("total_logs")}</CardTitle>
              <CardDescription>{t("logs_desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-brand-primary-500">
                {totalLogs}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("success")}</CardTitle>
              <CardDescription>{t("success_desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-state-success-500">
                {successLogs}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("errors")}</CardTitle>
              <CardDescription>{t("errors_desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-state-error-500">
                {errorLogs}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("active_users")}</CardTitle>
              <CardDescription>{t("users_desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-brand-primary-500">
                {uniqueUsers}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>{t("filters")}</CardTitle>
            <CardDescription>{t("filters_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder={t("search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <Select
                value={filterAction}
                onValueChange={(value) => setFilterAction(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("filter_action_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("filter_action_placeholder")}
                  </SelectItem>
                  <SelectItem value="login">
                    {t("actions_filter.login")}
                  </SelectItem>
                  <SelectItem value="logout">
                    {t("actions_filter.logout")}
                  </SelectItem>
                  <SelectItem value="crear">
                    {t("actions_filter.crear")}
                  </SelectItem>
                  <SelectItem value="editar">
                    {t("actions_filter.editar")}
                  </SelectItem>
                  <SelectItem value="eliminar">
                    {t("actions_filter.eliminar")}
                  </SelectItem>
                  <SelectItem value="aprobar">
                    {t("actions_filter.aprobar")}
                  </SelectItem>
                  <SelectItem value="rechazar">
                    {t("actions_filter.rechazar")}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterStatus}
                onValueChange={(value) => setFilterStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("filter_status_placeholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("filter_status_placeholder")}
                  </SelectItem>
                  <SelectItem value="success">{t("status_success")}</SelectItem>
                  <SelectItem value="error">{t("status_error")}</SelectItem>
                  <SelectItem value="warning">{t("status_warning")}</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFilterAction("all");
                  setFilterStatus("all");
                  setStartDate("");
                  setEndDate("");
                  setPage(1);
                }}
              >
                {t("clear_filters")}
              </Button>
            </div>

            {/* Date Range Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="text-xs font-medium text-[var(--color-text-tertiary)] mb-1 block">
                  {t("date_from") || "Desde"}
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--color-text-tertiary)] mb-1 block">
                  {t("date_to") || "Hasta"}
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                />
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefetching}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefetching ? "animate-spin" : ""}`} />
                  {t("refresh") || "Actualizar"}
                </Button>
              </div>
            </div>

            <div className="mt-4 text-sm text-[var(--color-text-tertiary)]">
              {t("showing_count", {
                count: filteredLogs.length,
                total: meta?.total || totalLogs,
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Logs con Virtual Scrolling */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t("logs_title")}</CardTitle>
                <CardDescription>{t("logs_list_desc")}</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUseVirtualScrolling(!useVirtualScrolling)}
                >
                  {useVirtualScrolling ? t("view_table") : t("view_virtual")}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportCsv}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {t("export_csv")}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {useVirtualScrolling ? (
              <VirtualizedList
                items={filteredLogs}
                renderItem={(log: AuditLog, index: number) => (
                  <div className="p-4 border-b border-[var(--color-border-strong)] hover:bg-[var(--color-bg-primary)]/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <span className="text-xs text-[var(--color-text-tertiary)] font-mono w-12">
                          #{index + 1}
                        </span>
                        <div className="flex-1 grid grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {new Date(log.timestamp).toLocaleDateString(
                                "es-ES",
                              )}
                            </div>
                            <div className="text-xs text-[var(--color-text-tertiary)]">
                              {new Date(log.timestamp).toLocaleTimeString(
                                "es-ES",
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {log.user}
                            </div>
                            <div className="text-xs text-[var(--color-text-tertiary)]">
                              {log.ipAddress}
                            </div>
                          </div>
                          <div>
                            <Badge variant="secondary" className="mb-1">
                              {log.action}
                            </Badge>
                            <div className="text-xs text-[var(--color-text-tertiary)]">
                              {log.entity}
                            </div>
                          </div>
                          <div>
                            <Badge
                              variant={
                                log.status === "success"
                                  ? "success"
                                  : log.status === "error"
                                    ? "error"
                                    : "warning"
                              }
                            >
                              {log.status === "success"
                                ? t("status_success")
                                : log.status === "error"
                                  ? t("status_error")
                                  : t("status_warning")}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedLog(log);
                          setShowLogDetail(true);
                        }}
                      >
                        {t("view_detail")}
                      </Button>
                    </div>
                    <div className="text-sm text-[var(--color-text-secondary)] mt-2 ml-16 truncate">
                      {log.details}
                    </div>
                  </div>
                )}
                onItemClick={(log: AuditLog) => {
                  setSelectedLog(log);
                  setShowLogDetail(true);
                }}
                itemHeight={90}
                containerHeight="700px"
                isLoading={loading}
                emptyMessage={t("empty")}
              />
            ) : (
              <DataTable data={filteredLogs} columns={columns} />
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--color-text-tertiary)]">
              {t("page_info") || `Página ${page} de ${totalPages}`}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {t("prev_page") || "Anterior"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t("next_page") || "Siguiente"}
              </Button>
            </div>
          </div>
        )}

        {/* Modal de Detalle de Log */}
        {showLogDetail && selectedLog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t("detail_title")}</CardTitle>
                    <CardDescription>
                      {t("detail_desc")}
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowLogDetail(false);
                      setSelectedLog(null);
                    }}
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--color-text-tertiary)]">
                      {t("id")}
                    </label>
                    <div className="text-foreground mt-1">{selectedLog.id}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--color-text-tertiary)]">
                      {t("timestamp")}
                    </label>
                    <div className="text-foreground mt-1">
                      {new Date(selectedLog.timestamp).toLocaleString("es-ES")}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--color-text-tertiary)]">
                      {t("user")}
                    </label>
                    <div className="text-foreground mt-1">
                      {selectedLog.user}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--color-text-tertiary)]">
                      {t("ip_address")}
                    </label>
                    <div className="text-foreground mt-1">
                      {selectedLog.ipAddress}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--color-text-tertiary)]">
                      {t("action")}
                    </label>
                    <div className="mt-1">
                      <Badge variant="secondary">{selectedLog.action}</Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--color-text-tertiary)]">
                      {t("status")}
                    </label>
                    <div className="mt-1">
                      <Badge
                        variant={
                          selectedLog.status === "success"
                            ? "success"
                            : selectedLog.status === "error"
                              ? "error"
                              : "warning"
                        }
                      >
                        {selectedLog.status === "success"
                          ? t("status_success")
                          : selectedLog.status === "error"
                            ? t("status_error")
                            : t("status_warning")}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--color-text-tertiary)]">
                      {t("entity")}
                    </label>
                    <div className="text-foreground mt-1">
                      {selectedLog.entity}
                    </div>
                  </div>
                  {selectedLog.entityId && (
                    <div>
                      <label className="text-sm font-medium text-[var(--color-text-tertiary)]">
                        {t("entity_id")}
                      </label>
                      <div className="text-foreground mt-1">
                        {selectedLog.entityId}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-[var(--color-text-tertiary)]">
                    {t("full_details")}
                  </label>
                  <div className="text-foreground mt-1 p-3 bg-[var(--color-bg-primary)] rounded-lg">
                    {selectedLog.details}
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowLogDetail(false);
                      setSelectedLog(null);
                    }}
                  >
                    {t("close")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
