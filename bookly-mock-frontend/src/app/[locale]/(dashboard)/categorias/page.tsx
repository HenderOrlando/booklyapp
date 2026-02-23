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
import { ColorSwatch } from "@/components/atoms/ColorSwatch";
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
import { CategoryModal } from "@/components/organisms/CategoryModal";
import { ListLayout } from "@/components/templates/ListLayout";
import {
  categoryKeys,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
  type CreateCategoryDto,
  type UpdateCategoryDto,
} from "@/hooks/mutations";
import { httpClient } from "@/infrastructure/http";
import { Category } from "@/types/entities/resource";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import * as React from "react";

type CategoryMutationApiResponse = {
  success?: boolean;
  data?: unknown;
  status?: string;
  message?: string;
};

/**
 * Página de Gestión de Categorías - Bookly
 *
 * CRUD completo de categorías:
 * - Crear nueva categoría
 * - Editar categoría existente
 * - Eliminar/Desactivar categoría
 * - Filtrar por estado (activa/inactiva)
 * - Búsqueda por nombre
 */

export default function CategoriasPage() {
  const t = useTranslations("categories");
  const tCommon = useTranslations("common");

  // React Query para cargar categorías
  const { data: categories = [], isLoading: loading } = useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: async () => {
      const response = await httpClient.get<{ categories: Category[] }>(
        "categories",
      );
      console.log("Response from backend:", response);
      console.log("Response data:", response.data);
      return response.data?.categories || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Mutations
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const [filter, setFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "active" | "inactive"
  >("all");
  const [showModal, setShowModal] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"create" | "edit">("create");
  const [selectedCategory, setSelectedCategory] = React.useState<
    Category | undefined
  >();
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [categoryToDelete, setCategoryToDelete] =
    React.useState<Category | null>(null);

  // Ya no necesitamos useEffect - React Query maneja el fetch automáticamente

  // Filtrar categorías
  const filteredCategories = categories.filter((category: Category) => {
    // Filtro por texto
    if (filter !== "") {
      const searchTerm = filter.toLowerCase();
      const matchesText =
        category.name.toLowerCase().includes(searchTerm) ||
        category.description?.toLowerCase().includes(searchTerm);
      if (!matchesText) return false;
    }

    // Filtro por estado
    if (statusFilter === "active" && !category.isActive) return false;
    if (statusFilter === "inactive" && category.isActive) return false;

    return true;
  });

  // Crear categoría
  const handleCreate = () => {
    setModalMode("create");
    setSelectedCategory(undefined);
    setShowModal(true);
  };

  // Editar categoría
  const handleEdit = (category: Category) => {
    setModalMode("edit");
    setSelectedCategory(category);
    setShowModal(true);
  };

  // Guardar categoría con React Query
  const hasImmediatePersistence = (response: CategoryMutationApiResponse) => {
    if (
      !response.success ||
      !response.data ||
      response.status === "processing"
    ) {
      return false;
    }

    const normalizedMessage = response.message?.toLowerCase() || "";
    return (
      !normalizedMessage.includes("queued for processing") &&
      !normalizedMessage.includes("accepted and queued")
    );
  };

  const handleSave = async (categoryData: Partial<Category>) => {
    if (modalMode === "create") {
      try {
        const createPayload: CreateCategoryDto = {
          name: categoryData.name || "",
          description: categoryData.description,
          color: categoryData.color,
          icon: categoryData.icon,
        };
        const response = await createCategory.mutateAsync(createPayload);
        if (hasImmediatePersistence(response)) {
          setShowModal(false);
        }
      } catch (err: unknown) {
        console.error("Error al crear categoría:", err);
      }
    } else {
      if (!selectedCategory) return;

      try {
        const updatePayload: UpdateCategoryDto = {
          name: categoryData.name,
          description: categoryData.description,
          color: categoryData.color,
          icon: categoryData.icon,
          isActive: categoryData.isActive,
        };
        const response = await updateCategory.mutateAsync({
          id: selectedCategory.id,
          data: updatePayload,
        });

        if (hasImmediatePersistence(response)) {
          setShowModal(false);
        }
      } catch (err: unknown) {
        console.error("Error al actualizar categoría:", err);
      }
    }
  };

  // Eliminar categoría con React Query
  const handleDelete = () => {
    if (!categoryToDelete) return;

    deleteCategory.mutate(categoryToDelete.id, {
      onSuccess: () => {
        setShowDeleteModal(false);
        setCategoryToDelete(null);
      },
      onError: (err) => {
        console.error("Error al eliminar categoría:", err);
      },
    });
  };

  // Alternar estado con React Query
  const handleToggleStatus = (category: Category) => {
    const updatePayload: UpdateCategoryDto = { isActive: !category.isActive };
    updateCategory.mutate(
      {
        id: category.id,
        data: updatePayload,
      },
      {
        onError: (err: unknown) => {
          console.error("Error al cambiar estado:", err);
        },
      },
    );
  };

  // Badge según estado - Eliminado, se usa StatusBadge directamente

  // Columnas de la tabla
  const columns = [
    {
      key: "name",
      header: t("name"),
      cell: (category: Category) => (
        <div className="flex items-center gap-3">
          <ColorSwatch color={category.color} size="md" />
          <div>
            <p className="font-medium text-foreground">{category.name}</p>
            <p className="text-sm text-[var(--color-text-tertiary)]">
              {category.description}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "color",
      header: t("color"),
      cell: (category: Category) => (
        <div className="flex items-center gap-2">
          <Badge
            style={{
              backgroundColor: category.color,
              color: "#fff",
            }}
          >
            {category.name}
          </Badge>
          <span className="text-xs text-[var(--color-text-tertiary)] font-mono">
            {category.color}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: t("status"),
      cell: (category: Category) => (
        <StatusBadge
          type="category"
          status={category.isActive ? "ACTIVE" : "INACTIVE"}
        />
      ),
    },
    {
      key: "actions",
      header: t("actions"),
      cell: (category: Category) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(category)}
            data-testid="edit-category-button"
          >
            {t("edit")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleStatus(category)}
            data-testid="toggle-status-button"
          >
            {category.isActive ? t("deactivate") : t("activate")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCategoryToDelete(category);
              setShowDeleteModal(true);
            }}
            data-testid="delete-category-button"
          >
            {t("delete")}
          </Button>
        </div>
      ),
    },
  ];

  // Loading state
  if (loading) {
    return (
      <>
        <LoadingSpinner fullScreen text={t("loading")} />
      </>
    );
  }

  return (
    <ListLayout
      title={t("title")}
      badge={{ text: "Gestión de Categorías", variant: "secondary" }}
      onCreate={handleCreate}
      createLabel={t("create")}
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
                    {categories.length}
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
                    {t("active")}
                  </p>
                  <h3 className="text-3xl font-black text-state-success-900 dark:text-state-success-200 leading-none">
                    {categories.filter((c: Category) => c.isActive).length}
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
                    {t("inactive")}
                  </p>
                  <h3 className="text-3xl font-black text-state-warning-900 dark:text-state-warning-200 leading-none">
                    {categories.filter((c: Category) => !c.isActive).length}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de Categorías */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>{t("list")}</CardTitle>
                <CardDescription>
                  {t("showing_count", { count: filteredCategories.length, total: categories.length })}
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

              {/* Filtro por estado */}
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  {t("all")}
                </Button>
                <Button
                  variant={statusFilter === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("active")}
                >
                  {t("active")}
                </Button>
                <Button
                  variant={statusFilter === "inactive" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("inactive")}
                >
                  {t("inactive")}
                </Button>
              </div>

              {(filter || statusFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilter("");
                    setStatusFilter("all");
                  }}
                >
                  {t("clear")}
                </Button>
              )}
            </div>

            {/* FilterChips - Mostrar filtros activos */}
            {(filter || statusFilter !== "all") && (
              <FilterChips
                filters={(() => {
                  const chips: FilterChip[] = [];
                  if (filter) {
                    chips.push({
                      key: "search",
                      label: t("search_label"),
                      value: filter,
                    });
                  }
                  if (statusFilter !== "all") {
                    chips.push({
                      key: "status",
                      label: t("status_label"),
                      value:
                        statusFilter === "active" ? t("active") : t("inactive"),
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
            {filteredCategories.length === 0 ? (
              <EmptyState
                title={t("no_results_title")}
                description={
                  filter || statusFilter !== "all"
                    ? t("no_results_filtered")
                    : t("no_results_empty")
                }
                action={
                  filter || statusFilter !== "all" ? (
                    <Button
                      onClick={() => {
                        setFilter("");
                        setStatusFilter("all");
                      }}
                    >
                      {tCommon("clear_filters")}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCreate}
                      data-testid="create-category-button-empty"
                    >
                      {t("create")}
                    </Button>
                  )
                }
              />
            ) : (
              <DataTable
                data={filteredCategories}
                columns={columns}
                data-testid="categories-table"
              />
            )}
          </CardContent>
        </Card>

        {/* Modal de Crear/Editar */}
        <CategoryModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          category={selectedCategory}
          mode={modalMode}
          loading={
            modalMode === "create"
              ? createCategory.isPending
              : updateCategory.isPending
          }
        />

        {/* Modal de Confirmación de Eliminación */}
        <ConfirmDialog
          open={showDeleteModal && categoryToDelete !== null}
          onClose={() => {
            setShowDeleteModal(false);
            setCategoryToDelete(null);
          }}
          onConfirm={handleDelete}
          title={t("confirm_delete_title")}
          description={t("confirm_delete")}
          confirmText={t("delete")}
          cancelText={t("cancel")}
          variant="destructive"
          data-testid="delete-category-modal"
        >
          {categoryToDelete && (
            <div className="space-y-2">
              <div className="bg-[var(--color-bg-primary)] p-4 rounded-lg flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: categoryToDelete.color }}
                />
                <div>
                  <p className="font-medium text-foreground">
                    {categoryToDelete.name}
                  </p>
                  <p className="text-sm text-[var(--color-text-tertiary)]">
                    {categoryToDelete.description}
                  </p>
                </div>
              </div>
              <p className="text-sm text-[var(--color-text-tertiary)]">
                {t("confirm_delete_warning")}
              </p>
            </div>
          )}
        </ConfirmDialog>
      </div>
    </ListLayout>
  );
}
