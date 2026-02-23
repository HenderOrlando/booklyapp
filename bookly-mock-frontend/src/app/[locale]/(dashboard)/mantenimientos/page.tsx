"use client";

import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { EmptyState } from "@/components/atoms/EmptyState";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import { DataTable } from "@/components/molecules/DataTable";
import {
  FilterChips,
  type FilterChip,
} from "@/components/molecules/FilterChips";
import { SearchBar } from "@/components/molecules/SearchBar";
import { MaintenanceModal } from "@/components/organisms/MaintenanceModal";
import { ListLayout } from "@/components/templates/ListLayout";
import {
  maintenanceKeys,
  useCancelMaintenance,
  useCreateMaintenance,
  useUpdateMaintenance,
} from "@/hooks/mutations";
import { resourceKeys } from "@/hooks/useResources";
import { httpClient } from "@/infrastructure/http";
import { Maintenance, Resource } from "@/types/entities/resource";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import * as React from "react";

/**
 * Página de Mantenimientos - Bookly
 *
 * Gestión completa de mantenimientos programados
 */

export default function MantenimientosPage() {
  const t = useTranslations("maintenance");

  // React Query para cargar mantenimientos
  const { data: maintenances = [], isLoading: loading } = useQuery({
    queryKey: maintenanceKeys.lists(),
    queryFn: async () => {
      const response = await httpClient.get<{ items?: Maintenance[] }>("maintenances");
      return response.data?.items || [];
    },
    staleTime: 1000 * 60 * 3, // 3 minutos
  });

  // React Query para cargar recursos
  const { data: resources = [] } = useQuery({
    queryKey: resourceKeys.lists(),
    queryFn: async () => {
      const response = await httpClient.get<{ items?: Resource[] }>("resources");
      return response.data?.items || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Mutations
  const createMaintenance = useCreateMaintenance();
  const updateMaintenance = useUpdateMaintenance();
  const cancelMaintenance = useCancelMaintenance();
  const [filter, setFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [showModal, setShowModal] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"create" | "edit">("create");
  const [selectedMaintenance, setSelectedMaintenance] = React.useState<
    Maintenance | undefined
  >();
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [maintenanceToDelete, setMaintenanceToDelete] =
    React.useState<Maintenance | null>(null);

  // React Query maneja el fetch automáticamente

  // Filtrar mantenimientos
  const filteredMaintenances = maintenances.filter(
    (maintenance: Maintenance) => {
      if (filter !== "") {
        const resource = resources.find(
          (r: Resource) => r.id === maintenance.resourceId,
        );
        const searchTerm = filter.toLowerCase();
        const matchesText =
          maintenance.description.toLowerCase().includes(searchTerm) ||
          resource?.name.toLowerCase().includes(searchTerm) ||
          maintenance.technician?.toLowerCase().includes(searchTerm);
        if (!matchesText) return false;
      }

      if (statusFilter !== "all" && maintenance.status !== statusFilter) {
        return false;
      }

      return true;
    },
  );

  // Handlers
  const handleCreate = () => {
    setModalMode("create");
    setSelectedMaintenance(undefined);
    setShowModal(true);
  };

  const handleEdit = (maintenance: Maintenance) => {
    setModalMode("edit");
    setSelectedMaintenance(maintenance);
    setShowModal(true);
  };

  const handleSave = (maintenanceData: Partial<Maintenance>) => {
    if (modalMode === "create") {
      createMaintenance.mutate(maintenanceData as any, {
        onSuccess: () => {
          setShowModal(false);
        },
        onError: (err: any) => {
          console.error("Error al crear mantenimiento:", err);
        },
      });
    } else {
      if (!selectedMaintenance) return;

      updateMaintenance.mutate(
        {
          id: selectedMaintenance.id,
          data: maintenanceData as any,
        },
        {
          onSuccess: () => {
            setShowModal(false);
          },
          onError: (err: any) => {
            console.error("Error al actualizar mantenimiento:", err);
          },
        },
      );
    }
  };

  const handleDelete = () => {
    if (!maintenanceToDelete) return;

    cancelMaintenance.mutate(
      {
        id: maintenanceToDelete.id,
        reason: t("cancel_reason_user"),
      },
      {
        onSuccess: () => {
          setShowDeleteModal(false);
          setMaintenanceToDelete(null);
        },
        onError: (err: any) => {
          console.error("Error al cancelar mantenimiento:", err);
        },
      },
    );
  };

  // Badge helpers - Eliminados, se usan StatusBadge components directamente

  // Columnas
  const columns = [
    {
      key: "resource",
      header: t("resource"),
      cell: (maintenance: Maintenance) => {
        const resource = resources.find(
          (r: Resource) => r.id === maintenance.resourceId,
        );
        return resource ? (
          <div>
            <p className="font-medium text-foreground">{resource.name}</p>
            <p className="text-sm text-[var(--color-text-tertiary)]">
              {resource.code}
            </p>
          </div>
        ) : (
          <p className="text-[var(--color-text-tertiary)]">-</p>
        );
      },
    },
    {
      key: "type",
      header: t("type"),
      cell: (maintenance: Maintenance) => (
        <StatusBadge type="maintenanceType" status={maintenance.type} />
      ),
    },
    {
      key: "status",
      header: t("status"),
      cell: (maintenance: Maintenance) => (
        <StatusBadge type="maintenance" status={maintenance.status} />
      ),
    },
    {
      key: "scheduledDate",
      header: t("scheduled_date"),
      cell: (maintenance: Maintenance) => (
        <p className="text-foreground">
          {new Date(maintenance.scheduledDate).toLocaleString()}
        </p>
      ),
    },
    {
      key: "technician",
      header: t("technician"),
      cell: (maintenance: Maintenance) => (
        <p className="text-foreground">{maintenance.technician || "-"}</p>
      ),
    },
    {
      key: "actions",
      header: t("actions"),
      cell: (maintenance: Maintenance) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(maintenance)}
          >
            {t("edit")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setMaintenanceToDelete(maintenance);
              setShowDeleteModal(true);
            }}
          >
            {t("delete")}
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner fullScreen text={t("loading")} />;
  }

  return (
    <ListLayout
      title={t("title")}
      badge={{ text: "Gestión de Mantenimientos", variant: "secondary" }}
      onCreate={handleCreate}
      createLabel={t("program_maintenance")}
    >
      <div className="space-y-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-brand-primary-500/5 to-brand-primary-600/5 border-brand-primary-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-primary-600/80 mb-1">
                    {t("total_maintenances")}
                  </p>
                  <h3 className="text-3xl font-black text-brand-primary-800 dark:text-brand-primary-200 leading-none">
                    {maintenances.length}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-state-warning-500/5 to-state-warning-700/5 border-state-warning-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-state-warning-700/80 dark:text-state-warning-200/80 mb-1">
                    {t("scheduled_plural")}
                  </p>
                  <h3 className="text-3xl font-black text-state-warning-900 dark:text-state-warning-200 leading-none">
                    {maintenances.filter((m: Maintenance) => m.status === "SCHEDULED").length}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-state-info-500/5 to-state-info-700/5 border-state-info-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-state-info-700/80 dark:text-state-info-200/80 mb-1">
                    {t("in_progress_plural")}
                  </p>
                  <h3 className="text-3xl font-black text-state-info-900 dark:text-state-info-200 leading-none">
                    {maintenances.filter((m: Maintenance) => m.status === "IN_PROGRESS").length}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>{t("maintenance_list")}</CardTitle>
                <CardDescription>
                  {t("showing_count", {
                    count: filteredMaintenances.length,
                    total: maintenances.length,
                  })}
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <SearchBar
                placeholder={t("search_placeholder")}
                value={filter}
                onChange={setFilter}
                onClear={() => setFilter("")}
                className="max-w-md flex-1"
              />

              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  {t("all")}
                </Button>
                <Button
                  variant={statusFilter === "SCHEDULED" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("SCHEDULED")}
                >
                  {t("scheduled_plural")}
                </Button>
                <Button
                  variant={
                    statusFilter === "IN_PROGRESS" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setStatusFilter("IN_PROGRESS")}
                >
                  {t("in_progress_plural")}
                </Button>
                <Button
                  variant={statusFilter === "COMPLETED" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("COMPLETED")}
                >
                  {t("completed_plural")}
                </Button>
              </div>
            </div>

            {/* FilterChips - Mostrar filtros activos */}
            {(filter || statusFilter !== "all") && (
              <FilterChips
                filters={(() => {
                  const chips: FilterChip[] = [];
                  if (filter) {
                    chips.push({
                      key: "search",
                      label: t("search_filter"),
                      value: filter,
                    });
                  }
                  if (statusFilter !== "all") {
                    const statusLabels: Record<string, string> = {
                      SCHEDULED: t("scheduled_plural"),
                      IN_PROGRESS: t("in_progress_plural"),
                      COMPLETED: t("completed_plural"),
                      CANCELLED: t("cancelled"),
                    };
                    chips.push({
                      key: "status",
                      label: t("status_filter"),
                      value: statusLabels[statusFilter] || statusFilter,
                    });
                  }
                  return chips;
                })()}
                onRemove={(key) => {
                  if (key === "search") setFilter("");
                  else if (key === "status") setStatusFilter("all");
                }}
                onClearAll={() => {
                  setFilter("");
                  setStatusFilter("all");
                }}
              />
            )}
          </CardHeader>
          <CardContent>
            {filteredMaintenances.length === 0 ? (
              <EmptyState
                title={t("no_results_title")}
                description={
                  filter || statusFilter !== "all"
                    ? t("no_results_desc")
                    : t("empty_desc")
                }
                action={
                  filter || statusFilter !== "all" ? (
                    <Button
                      onClick={() => {
                        setFilter("");
                        setStatusFilter("all");
                      }}
                    >
                      {t("clear_filters")}
                    </Button>
                  ) : (
                    <Button onClick={handleCreate}>
                      {t("program_maintenance")}
                    </Button>
                  )
                }
              />
            ) : (
              <DataTable data={filteredMaintenances} columns={columns} />
            )}
          </CardContent>
        </Card>

        <MaintenanceModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          maintenance={selectedMaintenance}
          resources={resources}
          mode={modalMode}
        />

        <ConfirmDialog
          open={showDeleteModal && maintenanceToDelete !== null}
          onClose={() => {
            setShowDeleteModal(false);
            setMaintenanceToDelete(null);
          }}
          onConfirm={handleDelete}
          title={t("delete_title")}
          description={t("delete_confirm")}
          confirmText={t("delete_button")}
          cancelText={t("cancel_button")}
          variant="destructive"
        >
          {maintenanceToDelete && (
            <div className="bg-[var(--color-bg-primary)] p-4 rounded-lg">
              <p className="font-medium text-foreground">
                {maintenanceToDelete.description}
              </p>
              <p className="text-sm text-[var(--color-text-tertiary)]">
                {new Date(maintenanceToDelete.scheduledDate).toLocaleString()}
              </p>
            </div>
          )}
        </ConfirmDialog>
      </div>
    </ListLayout>
  );
}
