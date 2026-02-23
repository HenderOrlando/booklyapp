"use client";

import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
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
import { CharacteristicModal } from "@/components/organisms/CharacteristicModal/CharacteristicModal";
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
import { useQuery } from "@tanstack/react-query";
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

  const _header = <AppHeader title={t("title")} />;
  const _sidebar = <AppSidebar />;

  if (loading) {
    return (
      <>
        <LoadingSpinner fullScreen text={t("subtitle")} />
      </>
    );
  }

  return (
    <>
      <div className="space-y-6 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
              {t("title")}
            </h2>
            <p className="text-[var(--color-text-secondary)] mt-2">
              {t("subtitle")}
            </p>
          </div>
          <Button
            onClick={handleCreate}
            data-testid="create-characteristic-button"
          >
            {t("create_button")}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>{t("list_title")}</CardTitle>
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
            ) : (
              <DataTable data={filteredCharacteristics} columns={columns} />
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
    </>
  );
}
