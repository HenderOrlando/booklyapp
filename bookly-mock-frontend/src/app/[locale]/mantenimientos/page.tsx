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
import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar";
import { MaintenanceModal } from "@/components/organisms/MaintenanceModal";
import { MainLayout } from "@/components/templates/MainLayout";
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
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import * as React from "react";

/**
 * Página de Mantenimientos - Bookly
 *
 * Gestión completa de mantenimientos programados
 */

export default function MantenimientosPage() {
  const t = useTranslations("maintenance");
  const router = useRouter();

  // React Query para cargar mantenimientos
  const { data: maintenances = [], isLoading: loading } = useQuery({
    queryKey: maintenanceKeys.lists(),
    queryFn: async () => {
      const response = await httpClient.get("maintenances");
      return response.data?.items || [];
    },
    staleTime: 1000 * 60 * 3, // 3 minutos
  });

  // React Query para cargar recursos
  const { data: resources = [] } = useQuery({
    queryKey: resourceKeys.lists(),
    queryFn: async () => {
      const response = await httpClient.get("resources");
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
          (r: Resource) => r.id === maintenance.resourceId
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
    }
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
          alert("Error al guardar el mantenimiento");
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
            alert("Error al guardar el mantenimiento");
          },
        }
      );
    }
  };

  const handleDelete = () => {
    if (!maintenanceToDelete) return;

    cancelMaintenance.mutate(
      {
        id: maintenanceToDelete.id,
        reason: "Cancelado por el usuario",
      },
      {
        onSuccess: () => {
          setShowDeleteModal(false);
          setMaintenanceToDelete(null);
        },
        onError: (err: any) => {
          console.error("Error al cancelar mantenimiento:", err);
          alert("Error al cancelar el mantenimiento");
        },
      }
    );
  };

  // Badge helpers - Eliminados, se usan StatusBadge components directamente

  // Columnas
  const columns = [
    {
      key: "resource",
      header: "Recurso",
      cell: (maintenance: Maintenance) => {
        const resource = resources.find(
          (r: Resource) => r.id === maintenance.resourceId
        );
        return resource ? (
          <div>
            <p className="font-medium text-white">{resource.name}</p>
            <p className="text-sm text-[var(--color-text-tertiary)]">{resource.code}</p>
          </div>
        ) : (
          <p className="text-[var(--color-text-tertiary)]">-</p>
        );
      },
    },
    {
      key: "type",
      header: "Tipo",
      cell: (maintenance: Maintenance) => (
        <StatusBadge type="maintenanceType" status={maintenance.type} />
      ),
    },
    {
      key: "status",
      header: "Estado",
      cell: (maintenance: Maintenance) => (
        <StatusBadge type="maintenance" status={maintenance.status} />
      ),
    },
    {
      key: "scheduledDate",
      header: "Fecha Programada",
      cell: (maintenance: Maintenance) => (
        <p className="text-white">
          {new Date(maintenance.scheduledDate).toLocaleString()}
        </p>
      ),
    },
    {
      key: "technician",
      header: "Técnico",
      cell: (maintenance: Maintenance) => (
        <p className="text-white">{maintenance.technician || "-"}</p>
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      cell: (maintenance: Maintenance) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(maintenance)}
          >
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setMaintenanceToDelete(maintenance);
              setShowDeleteModal(true);
            }}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  const header = <AppHeader title="Mantenimientos" />;
  const sidebar = <AppSidebar />;

  if (loading) {
    return (
      <MainLayout header={header} sidebar={sidebar}>
        <LoadingSpinner fullScreen text="Cargando mantenimientos..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout header={header} sidebar={sidebar}>
      <div className="space-y-6 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
              Mantenimientos
            </h2>
            <p className="text-[var(--color-text-secondary)] mt-2">
              Programación y gestión de mantenimientos
            </p>
          </div>
          <Button onClick={handleCreate}>Programar Mantenimiento</Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>Lista de Mantenimientos</CardTitle>
                <CardDescription>
                  {filteredMaintenances.length} de {maintenances.length}{" "}
                  mantenimientos
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <SearchBar
                placeholder="Buscar por recurso, descripción o técnico..."
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
                  Todos
                </Button>
                <Button
                  variant={statusFilter === "SCHEDULED" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("SCHEDULED")}
                >
                  Programados
                </Button>
                <Button
                  variant={
                    statusFilter === "IN_PROGRESS" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setStatusFilter("IN_PROGRESS")}
                >
                  En Progreso
                </Button>
                <Button
                  variant={statusFilter === "COMPLETED" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("COMPLETED")}
                >
                  Completados
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
                      label: "Búsqueda",
                      value: filter,
                    });
                  }
                  if (statusFilter !== "all") {
                    const statusLabels: Record<string, string> = {
                      SCHEDULED: "Programados",
                      IN_PROGRESS: "En Progreso",
                      COMPLETED: "Completados",
                      CANCELLED: "Cancelados",
                    };
                    chips.push({
                      key: "status",
                      label: "Estado",
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
                title="No se encontraron mantenimientos"
                description={
                  filter || statusFilter !== "all"
                    ? "No hay mantenimientos que coincidan con los filtros aplicados."
                    : "Aún no hay mantenimientos programados. Programa el primer mantenimiento."
                }
                action={
                  filter || statusFilter !== "all" ? (
                    <Button
                      onClick={() => {
                        setFilter("");
                        setStatusFilter("all");
                      }}
                    >
                      Limpiar Filtros
                    </Button>
                  ) : (
                    <Button onClick={handleCreate}>
                      Programar Mantenimiento
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
          title="Confirmar Eliminación"
          description="¿Estás seguro que deseas eliminar este mantenimiento?"
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="destructive"
        >
          {maintenanceToDelete && (
            <div className="bg-[var(--color-bg-primary)] p-4 rounded-lg">
              <p className="font-medium text-white">
                {maintenanceToDelete.description}
              </p>
              <p className="text-sm text-[var(--color-text-tertiary)]">
                {new Date(maintenanceToDelete.scheduledDate).toLocaleString()}
              </p>
            </div>
          )}
        </ConfirmDialog>
      </div>
    </MainLayout>
  );
}
