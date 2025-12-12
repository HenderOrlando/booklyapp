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
import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar";
import { VirtualizedList } from "@/components/organisms/VirtualizedList";
import { MainLayout } from "@/components/templates/MainLayout";
import { httpClient } from "@/infrastructure/http";
import { useTranslations } from "next-intl";
import * as React from "react";

/**
 * Página de Auditoría - Bookly
 *
 * Visualiza logs del sistema:
 * - Acciones de usuarios
 * - Cambios en recursos
 * - Inicios de sesión
 * - Errores y excepciones
 * - Filtros y búsqueda
 */

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  ipAddress: string;
  status: "success" | "error" | "warning";
}

export default function AuditoriaPage() {
  const t = useTranslations("admin.audit");
  const [logs, setLogs] = React.useState<AuditLog[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [useVirtualScrolling, setUseVirtualScrolling] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterAction, setFilterAction] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState("");
  const [selectedLog, setSelectedLog] = React.useState<AuditLog | null>(null);
  const [showLogDetail, setShowLogDetail] = React.useState(false);
  const [filterLogTable, setFilterLogTable] = React.useState("");

  // Cargar logs de auditoría
  React.useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await httpClient.get("audit/logs");

        if (response.success && response.data) {
          setLogs(response.data.items || []);
        }
      } catch (err: any) {
        console.error("Error al cargar logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const header = <AppHeader title={t("title")} />;
  const sidebar = <AppSidebar />;

  // Filtrar logs (para la sección de filtros de búsqueda)
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      searchTerm === "" ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction =
      filterAction === "" ||
      filterAction === "all" ||
      log.action === filterAction;
    const matchesStatus =
      filterStatus === "" ||
      filterStatus === "all" ||
      log.status === filterStatus;

    return matchesSearch && matchesAction && matchesStatus;
  });

  // Filtrar logs adicional para la tabla
  const tableFilteredLogs = filteredLogs.filter((log) => {
    if (filterLogTable === "") return true;

    return (
      log.user.toLowerCase().includes(filterLogTable.toLowerCase()) ||
      log.action.toLowerCase().includes(filterLogTable.toLowerCase()) ||
      log.entity.toLowerCase().includes(filterLogTable.toLowerCase()) ||
      log.details.toLowerCase().includes(filterLogTable.toLowerCase()) ||
      log.status.toLowerCase().includes(filterLogTable.toLowerCase())
    );
  });

  // Columnas de la tabla
  const columns = [
    {
      key: "timestamp",
      header: t("table_timestamp"),
      cell: (log: AuditLog) => (
        <div className="text-sm">
          <div className="font-medium text-white">
            {new Date(log.timestamp).toLocaleDateString("es-ES")}
          </div>
          <div className="text-gray-400">
            {new Date(log.timestamp).toLocaleTimeString("es-ES")}
          </div>
        </div>
      ),
    },
    {
      key: "user",
      header: t("table_user"),
      cell: (log: AuditLog) => (
        <div className="font-medium text-white">{log.user}</div>
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
          <div className="font-medium text-white">{log.entity}</div>
          {log.entityId && (
            <div className="text-xs text-gray-400">ID: {log.entityId}</div>
          )}
        </div>
      ),
    },
    {
      key: "details",
      header: t("table_details"),
      cell: (log: AuditLog) => (
        <div className="text-sm text-gray-300 max-w-md truncate">
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
        <div className="text-sm text-gray-400">{log.ipAddress}</div>
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
      <MainLayout header={header} sidebar={sidebar}>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary-500 mx-auto mb-4"></div>
            <p className="text-[var(--color-text-secondary)]">{t("loading")}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout header={header} sidebar={sidebar}>
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
              <div className="text-4xl font-bold text-green-500">
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
              <div className="text-4xl font-bold text-red-500">{errorLogs}</div>
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
                }}
              >
                {t("clear_filters")}
              </Button>
            </div>

            <div className="mt-4 text-sm text-gray-400">
              {t("showing_count", {
                count: filteredLogs.length,
                total: totalLogs,
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
                  onClick={() => alert("Exportar CSV pendiente")}
                >
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
                  <div className="p-4 border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <span className="text-xs text-gray-500 font-mono w-12">
                          #{index + 1}
                        </span>
                        <div className="flex-1 grid grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm font-medium text-white">
                              {new Date(log.timestamp).toLocaleDateString(
                                "es-ES"
                              )}
                            </div>
                            <div className="text-xs text-gray-400">
                              {new Date(log.timestamp).toLocaleTimeString(
                                "es-ES"
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="font-medium text-white">
                              {log.user}
                            </div>
                            <div className="text-xs text-gray-400">
                              {log.ipAddress}
                            </div>
                          </div>
                          <div>
                            <Badge variant="secondary" className="mb-1">
                              {log.action}
                            </Badge>
                            <div className="text-xs text-gray-400">
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
                                ? "Éxito"
                                : log.status === "error"
                                  ? "Error"
                                  : "Advertencia"}
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
                        Ver
                      </Button>
                    </div>
                    <div className="text-sm text-gray-300 mt-2 ml-16 truncate">
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
                emptyMessage="No hay logs de auditoría"
              />
            ) : (
              <DataTable data={filteredLogs} columns={columns} />
            )}
          </CardContent>
        </Card>

        {/* Modal de Detalle de Log */}
        {showLogDetail && selectedLog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Detalle del Log</CardTitle>
                    <CardDescription>
                      Información completa del evento
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
                    <label className="text-sm font-medium text-gray-400">
                      ID
                    </label>
                    <div className="text-white mt-1">{selectedLog.id}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">
                      Timestamp
                    </label>
                    <div className="text-white mt-1">
                      {new Date(selectedLog.timestamp).toLocaleString("es-ES")}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">
                      Usuario
                    </label>
                    <div className="text-white mt-1">{selectedLog.user}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">
                      IP Address
                    </label>
                    <div className="text-white mt-1">
                      {selectedLog.ipAddress}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">
                      Acción
                    </label>
                    <div className="mt-1">
                      <Badge variant="secondary">{selectedLog.action}</Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">
                      Estado
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
                          ? "Éxito"
                          : selectedLog.status === "error"
                            ? "Error"
                            : "Advertencia"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">
                      Entidad
                    </label>
                    <div className="text-white mt-1">{selectedLog.entity}</div>
                  </div>
                  {selectedLog.entityId && (
                    <div>
                      <label className="text-sm font-medium text-gray-400">
                        Entity ID
                      </label>
                      <div className="text-white mt-1">
                        {selectedLog.entityId}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-400">
                    Detalles Completos
                  </label>
                  <div className="text-white mt-1 p-3 bg-gray-800 rounded-lg">
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
                    Cerrar
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
