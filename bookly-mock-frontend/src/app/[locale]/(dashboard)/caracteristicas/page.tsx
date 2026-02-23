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
import { CharacteristicModal } from "@/components/organisms/CharacteristicModal/CharacteristicModal";
import { ListLayout } from "@/components/templates/ListLayout";
import {
  characteristicKeys,
  useCreateCharacteristic,
  useDeleteCharacteristic,
  useUpdateCharacteristic,
} from "@/hooks/mutations/useCharacteristicMutations";
import {
  CharacteristicsClient,
  type Characteristic,
} from "@/infrastructure/api/characteristics-client";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  List as ListIcon,
  RefreshCw,
  Table as TableIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";
/**
 * Página de Gestión de Características - Bookly
 *
 * CRUD del catálogo de características reutilizables
 */

export default function CaracteristicasPage() {
  const { data: characteristics = [], isLoading: loading } = useQuery({
    queryKey: characteristicKeys.lists(),
    queryFn: async () => {
      const response = await CharacteristicsClient.getCharacteristics();
      return response.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const createCharacteristic = useCreateCharacteristic();
  const updateCharacteristic = useUpdateCharacteristic();
  const deleteCharacteristic = useDeleteCharacteristic();
  const t = useTranslations("characteristics");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = React.useState<"table" | "list">("table");

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: characteristicKeys.lists() });
  };

  const [filter, setFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "active" | "inactive"
  >("all");
  const [showModal, setShowModal] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"create" | "edit">("create");
  const [selectedCharacteristic, setSelectedCharacteristic] = React.useState<
    Characteristic | undefined
  >();
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [characteristicToDelete, setCharacteristicToDelete] =
    React.useState<Characteristic | null>(null);

  const filteredCharacteristics = characteristics.filter((char) => {
    if (filter !== "") {
      const searchTerm = filter.toLowerCase();
      const matchesText =
        char.name.toLowerCase().includes(searchTerm) ||
        char.code.toLowerCase().includes(searchTerm) ||
        char.description?.toLowerCase().includes(searchTerm);
      if (!matchesText) return false;
    }
    if (statusFilter === "active" && !char.isActive) return false;
    if (statusFilter === "inactive" && char.isActive) return false;
    return true;
  });

  const handleCreate = () => {
    setModalMode("create");
    setSelectedCharacteristic(undefined);
    setShowModal(true);
  };

  const handleEdit = (char: Characteristic) => {
    setModalMode("edit");
    setSelectedCharacteristic(char);
    setShowModal(true);
  };

  const handleSave = async (data: Partial<Characteristic>) => {
    try {
      if (modalMode === "create") {
        await createCharacteristic.mutateAsync({
          name: data.name!,
          code: data.code!,
          description: data.description,
          icon: data.icon,
          color: data.color,
        });
      } else if (selectedCharacteristic) {
        await updateCharacteristic.mutateAsync({
          id: selectedCharacteristic.id,
          data: {
            name: data.name,
            description: data.description,
            icon: data.icon,
            color: data.color,
            isActive: data.isActive,
          },
        });
      }
      setShowModal(false);
    } catch (err) {
      console.error("Error saving characteristic:", err);
    }
  };

  const handleDelete = async () => {
    if (!characteristicToDelete) return;
    try {
      await deleteCharacteristic.mutateAsync(characteristicToDelete.id);
      setShowDeleteModal(false);
      setCharacteristicToDelete(null);
    } catch (err) {
      console.error("Error deleting characteristic:", err);
    }
  };

  const columns = [
    {
      key: "name",
      header: t("table.name_code"),
      cell: (char: Characteristic) => (
        <div className="flex items-center gap-3">
          {char.color && (
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: char.color }}
            />
          )}
          <div>
            <p className="font-medium text-foreground">{char.name}</p>
            <p className="text-xs text-[var(--color-text-tertiary)] font-mono">
              {char.code}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "description",
      header: t("table.description"),
      cell: (char: Characteristic) => (
        <p className="text-sm text-[var(--color-text-secondary)] max-w-xs truncate">
          {char.description || "-"}
        </p>
      ),
    },
    {
      key: "status",
      header: t("table.status"),
      cell: (char: Characteristic) => (
        <StatusBadge
          type="category"
          status={char.isActive ? "ACTIVE" : "INACTIVE"}
        />
      ),
    },
    {
      key: "actions",
      header: t("table.actions"),
      cell: (char: Characteristic) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(char)}>
            {tCommon("edit")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCharacteristicToDelete(char);
              setShowDeleteModal(true);
            }}
          >
            {tCommon("delete")}
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <>
        <LoadingSpinner fullScreen text={t("subtitle")} />
      </>
    );
  }

  return (
    <ListLayout
      title={t("title")}
      badge={{ text: "Gestión de Características", variant: "secondary" }}
      onCreate={handleCreate}
      createLabel={t("create_button")}
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="h-10 px-3 rounded-md border-line-subtle text-content-tertiary hover:text-action-primary hover:border-action-primary transition-all"
          title={tCommon("refresh")}
        >
          <RefreshCw size={16} className={cn(loading && "animate-spin", "mr-2")} />
          {tCommon("refresh")}
        </Button>
      }
    >
      <div className="space-y-6 pb-6">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-brand-primary-500/5 to-brand-primary-600/5 border-brand-primary-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-primary-600/80 mb-1">
                    {t("total")}
                  </p>
                  <h3 className="text-3xl font-black text-brand-primary-800 dark:text-brand-primary-200 leading-none">
                    {characteristics.length}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-state-success-500/5 to-state-success-700/5 border-state-success-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-state-success-700/80 dark:text-state-success-200/80 mb-1">
                    {t("filter.active")}
                  </p>
                  <h3 className="text-3xl font-black text-state-success-900 dark:text-state-success-200 leading-none">
                    {characteristics.filter((c: Characteristic) => c.isActive).length}
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
                    {t("filter.inactive")}
                  </p>
                  <h3 className="text-3xl font-black text-state-warning-900 dark:text-state-warning-200 leading-none">
                    {characteristics.filter((c: Characteristic) => !c.isActive).length}
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
                <CardTitle>{t("list_title")}</CardTitle>
                <CardDescription>
                  {t("showing_count", { count: filteredCharacteristics.length, total: characteristics.length })}
                </CardDescription>
              </div>

              {/* Toggle Vista Tabla / Vista Lista */}
              <div className="flex items-center gap-1 bg-[var(--color-bg-muted)]/50 p-1 rounded-xl border border-[var(--color-border-subtle)]/50">
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className={cn(
                    "h-8 px-3 rounded-lg text-xs font-bold transition-all",
                    viewMode === "table"
                      ? "bg-white text-brand-primary-600 shadow-sm border-none hover:bg-white dark:bg-surface dark:text-brand-primary-400"
                      : "text-[var(--color-text-tertiary)] hover:text-brand-primary-500",
                  )}
                >
                  <TableIcon className="w-3.5 h-3.5 mr-1.5" />
                  {tCommon("view_table")}
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "h-8 px-3 rounded-lg text-xs font-bold transition-all",
                    viewMode === "list"
                      ? "bg-white text-brand-primary-600 shadow-sm border-none hover:bg-white dark:bg-surface dark:text-brand-primary-400"
                      : "text-[var(--color-text-tertiary)] hover:text-brand-primary-500",
                  )}
                >
                  <ListIcon className="w-3.5 h-3.5 mr-1.5" />
                  {tCommon("view_list")}
                </Button>
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
                  {t("filter.all")}
                </Button>
                <Button
                  variant={statusFilter === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("active")}
                >
                  {t("filter.active")}
                </Button>
              </div>
            </div>

            {(filter || statusFilter !== "all") && (
              <FilterChips
                filters={(() => {
                  const chips: FilterChip[] = [];
                  if (filter)
                    chips.push({
                      key: "search",
                      label: t("filter.search_label"),
                      value: filter,
                    });
                  if (statusFilter !== "all") {
                    chips.push({
                      key: "status",
                      label: t("filter.status_label"),
                      value:
                        statusFilter === "active"
                          ? t("filter.active")
                          : t("filter.inactive"),
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
            {filteredCharacteristics.length === 0 ? (
              <EmptyState
                title={t("empty_state.title")}
                description={t("empty_state.description")}
                action={
                  <Button onClick={handleCreate}>{t("create_button")}</Button>
                }
              />
            ) : viewMode === "table" ? (
              <DataTable data={filteredCharacteristics} columns={columns} />
            ) : (
              <div className="space-y-3">
                {filteredCharacteristics.map((char) => (
                  <div
                    key={char.id}
                    className="group bg-surface rounded-xl p-5 border border-line-subtle hover:border-brand-primary-500/50 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {char.color && (
                          <div
                            className="w-4 h-4 rounded-full shrink-0"
                            style={{ backgroundColor: char.color }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-content-primary">
                              {char.name}
                            </h3>
                            <span className="text-xs text-content-tertiary font-mono">
                              {char.code}
                            </span>
                            <StatusBadge
                              type="category"
                              status={char.isActive ? "ACTIVE" : "INACTIVE"}
                            />
                          </div>
                          {char.description && (
                            <p className="text-sm text-content-secondary mt-1 truncate">
                              {char.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(char)}>
                          {tCommon("edit")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCharacteristicToDelete(char);
                            setShowDeleteModal(true);
                          }}
                        >
                          {tCommon("delete")}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <CharacteristicModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          characteristic={selectedCharacteristic}
          mode={modalMode}
          loading={
            modalMode === "create"
              ? createCharacteristic.isPending
              : updateCharacteristic.isPending
          }
        />

        <ConfirmDialog
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title={t("delete_confirm.title")}
          description={t("delete_confirm.description")}
          confirmText={t("delete_confirm_button")}
          variant="destructive"
        />
      </div>
    </ListLayout>
  );
}
