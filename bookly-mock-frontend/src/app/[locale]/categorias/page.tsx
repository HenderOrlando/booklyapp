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
import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar";
import { CategoryModal } from "@/components/organisms/CategoryModal";
import { MainLayout } from "@/components/templates/MainLayout";
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
        alert("Error al eliminar la categoría");
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
          alert("Error al cambiar el estado de la categoría");
        },
      },
    );
  };

  // Badge según estado - Eliminado, se usa StatusBadge directamente

  // Columnas de la tabla
  const columns = [
    {
      key: "name",
      header: "Nombre",
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
      header: "Color",
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
      header: "Estado",
      cell: (category: Category) => (
        <StatusBadge
          type="category"
          status={category.isActive ? "ACTIVE" : "INACTIVE"}
        />
      ),
    },
    {
      key: "actions",
      header: "Acciones",
      cell: (category: Category) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(category)}
            data-testid="edit-category-button"
          >
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleStatus(category)}
            data-testid="toggle-status-button"
          >
            {category.isActive ? "Desactivar" : "Activar"}
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
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  const header = <AppHeader title="Categorías" />;
  const sidebar = <AppSidebar />;

  // Loading state
  if (loading) {
    return (
      <MainLayout header={header} sidebar={sidebar}>
        <LoadingSpinner fullScreen text="Cargando categorías..." />
      </MainLayout>
    );
  }

  return (
    <MainLayout header={header} sidebar={sidebar}>
      <div className="space-y-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
              Categorías
            </h2>
            <p className="text-[var(--color-text-secondary)] mt-2">
              Gestión de categorías de recursos
            </p>
          </div>
          <Button onClick={handleCreate} data-testid="create-category-button">
            Crear Categoría
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-[var(--color-text-tertiary)]">
                Total Categorías
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">
                {categories.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-[var(--color-text-tertiary)]">
                Activas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-state-success-500">
                {categories.filter((c: Category) => c.isActive).length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-[var(--color-text-tertiary)]">
                Inactivas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-[var(--color-text-tertiary)]">
                {categories.filter((c: Category) => !c.isActive).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de Categorías */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>Lista de Categorías</CardTitle>
                <CardDescription>
                  {filteredCategories.length} de {categories.length} categorías
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <SearchBar
                placeholder="Buscar por nombre o descripción..."
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
                  Todas
                </Button>
                <Button
                  variant={statusFilter === "active" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("active")}
                >
                  Activas
                </Button>
                <Button
                  variant={statusFilter === "inactive" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("inactive")}
                >
                  Inactivas
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
                  Limpiar
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
                      label: "Búsqueda",
                      value: filter,
                    });
                  }
                  if (statusFilter !== "all") {
                    chips.push({
                      key: "status",
                      label: "Estado",
                      value:
                        statusFilter === "active" ? "Activas" : "Inactivas",
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
                title="No se encontraron categorías"
                description={
                  filter || statusFilter !== "all"
                    ? "No hay categorías que coincidan con los filtros aplicados."
                    : "Aún no hay categorías registradas. Crea la primera categoría para comenzar."
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
                    <Button
                      onClick={handleCreate}
                      data-testid="create-category-button-empty"
                    >
                      Crear Categoría
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
          title="Confirmar Eliminación"
          description="¿Estás seguro que deseas eliminar esta categoría?"
          confirmText="Eliminar"
          cancelText="Cancelar"
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
                Esta acción no se puede deshacer. La categoría será eliminada
                permanentemente.
              </p>
            </div>
          )}
        </ConfirmDialog>
      </div>
    </MainLayout>
  );
}
