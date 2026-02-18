"use client";

import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import type { AdvancedSearchFilters } from "@/components/organisms/AdvancedSearchModal";
import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar";
import { MainLayout } from "@/components/templates/MainLayout";
import { categoryKeys, useDeleteResource } from "@/hooks/mutations";
import { resourceKeys } from "@/hooks/useResources";
import { useRouter } from "@/i18n/navigation";
import { httpClient } from "@/infrastructure/http";
import type { Category, Resource } from "@/types/entities/resource";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import * as React from "react";
import {
  ResourceFiltersSection,
  ResourceStatsCards,
  ResourcesTable,
} from "./components";

interface ResourceCollectionPayload {
  resources?: Resource[];
  items?: Resource[];
}

interface CategoryCollectionPayload {
  categories?: Category[];
  items?: Category[];
}

function extractResources(
  data: ResourceCollectionPayload | Resource[] | undefined,
): Resource[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (data?.resources && Array.isArray(data.resources)) {
    return data.resources;
  }

  if (data?.items && Array.isArray(data.items)) {
    return data.items;
  }

  return [];
}

function extractCategories(
  data: CategoryCollectionPayload | Category[] | undefined,
): Category[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (data?.categories && Array.isArray(data.categories)) {
    return data.categories;
  }

  if (data?.items && Array.isArray(data.items)) {
    return data.items;
  }

  return [];
}

/**
 * Página de Recursos - Bookly
 *
 * Listado completo de recursos con acciones CRUD
 */

export default function RecursosPage() {
  const router = useRouter();
  const t = useTranslations("resources");
  const tCommon = useTranslations("common");

  // ============================================
  // HOOKS DE DATOS
  // ============================================

  const { data: resources = [], isLoading: loading } = useQuery({
    queryKey: resourceKeys.lists(),
    queryFn: async () => {
      const response = await httpClient.get<
        ResourceCollectionPayload | Resource[]
      >("resources");

      return extractResources(response.data);
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: categories = [] } = useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: async () => {
      const response = await httpClient.get<
        CategoryCollectionPayload | Category[]
      >("categories");

      return extractCategories(response.data);
    },
    staleTime: 1000 * 60 * 5,
  });

  // ============================================
  // MUTATIONS
  // ============================================

  const deleteResource = useDeleteResource();

  // ============================================
  // ESTADO LOCAL
  // ============================================

  // Filtros
  const [filter, setFilter] = React.useState("");
  const [advancedFilters, setAdvancedFilters] =
    React.useState<AdvancedSearchFilters>({});

  // UI States
  const [useVirtualScrolling, setUseVirtualScrolling] = React.useState(true);
  const [showAdvancedSearch, setShowAdvancedSearch] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [resourceToDelete, setResourceToDelete] =
    React.useState<Resource | null>(null);

  // ============================================
  // FUNCIONES DE FILTRADO
  // ============================================

  const applyAdvancedFilters = (
    resource: Resource,
    filters: AdvancedSearchFilters,
  ): boolean => {
    // Filtro por texto
    if (filters.text) {
      const searchTerm = filters.text.toLowerCase();
      const matchesText =
        resource.name.toLowerCase().includes(searchTerm) ||
        resource.code.toLowerCase().includes(searchTerm) ||
        resource.description.toLowerCase().includes(searchTerm) ||
        resource.location.toLowerCase().includes(searchTerm) ||
        resource.type.toLowerCase().includes(searchTerm);
      if (!matchesText) return false;
    }

    // Filtro por tipos
    if (filters.types && filters.types.length > 0) {
      if (!filters.types.includes(resource.type)) return false;
    }

    // Filtro por estados
    if (filters.statuses && filters.statuses.length > 0) {
      if (!filters.statuses.includes(resource.status)) return false;
    }

    // Filtro por categoría
    if (filters.categoryId && resource.categoryId !== filters.categoryId) {
      return false;
    }

    // Filtro por capacidad
    if (filters.minCapacity && resource.capacity < filters.minCapacity) {
      return false;
    }
    if (filters.maxCapacity && resource.capacity > filters.maxCapacity) {
      return false;
    }

    // Filtro por características
    if (filters.hasProjector && !resource.attributes?.hasProjector)
      return false;
    if (filters.hasAirConditioning && !resource.attributes?.hasAirConditioning)
      return false;
    if (filters.hasWhiteboard && !resource.attributes?.hasWhiteboard)
      return false;
    if (filters.hasComputers && !resource.attributes?.hasComputers)
      return false;

    return true;
  };

  // Filtrar recursos (combina filtro básico y avanzado)
  const filteredResources = resources.filter((resource: Resource) => {
    // Aplicar filtro básico si está activo
    if (filter !== "") {
      const searchTerm = filter.toLowerCase();
      const matchesBasic =
        resource.name.toLowerCase().includes(searchTerm) ||
        resource.code.toLowerCase().includes(searchTerm) ||
        resource.description.toLowerCase().includes(searchTerm) ||
        resource.location.toLowerCase().includes(searchTerm) ||
        resource.type.toLowerCase().includes(searchTerm);
      if (!matchesBasic) return false;
    }

    // Aplicar filtros avanzados si están activos
    if (Object.keys(advancedFilters).length > 0) {
      return applyAdvancedFilters(resource, advancedFilters);
    }

    return true;
  });

  // ============================================
  // HANDLERS
  // ============================================

  const handleClearFilters = () => {
    setFilter("");
    setAdvancedFilters({});
  };

  const handleDelete = () => {
    if (!resourceToDelete) return;

    deleteResource.mutate(resourceToDelete.id, {
      onSuccess: () => {
        setShowDeleteModal(false);
        setResourceToDelete(null);
      },
      onError: (err) => {
        console.error("Error deleting resource:", err);
        alert(t("delete_error"));
      },
    });
  };

  const handleView = (resource: Resource) => {
    router.push(`/recursos/${resource.id}`);
  };

  const handleEdit = (resource: Resource) => {
    router.push(`/recursos/${resource.id}/editar`);
  };

  const handleDeleteClick = (resource: Resource) => {
    setResourceToDelete(resource);
    setShowDeleteModal(true);
  };

  // ============================================
  // RENDER
  // ============================================

  const header = <AppHeader />;
  const sidebar = <AppSidebar />;

  if (loading) {
    return (
      <MainLayout header={header} sidebar={sidebar}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
          <p className="text-[var(--color-text-tertiary)] mt-4">
            {t("loading")}
          </p>
        </div>
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
              {t("title")}
            </h2>
            <p className="text-[var(--color-text-secondary)] mt-2">
              {t("management")}
            </p>
          </div>
          <Button onClick={() => router.push("/recursos/nuevo")}>
            {t("create")}
          </Button>
        </div>

        {/* Stats Cards */}
        <ResourceStatsCards resources={resources} />

        {/* Tabla de Recursos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>{t("list")}</CardTitle>
                <CardDescription>
                  {t("showing_count", {
                    count: filteredResources.length,
                    total: resources.length,
                  })}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUseVirtualScrolling(!useVirtualScrolling)}
              >
                {useVirtualScrolling ? t("view_table") : t("view_list")}
              </Button>
            </div>

            {/* Filtros */}
            <ResourceFiltersSection
              filter={filter}
              advancedFilters={advancedFilters}
              showAdvancedSearch={showAdvancedSearch}
              categories={categories}
              onFilterChange={setFilter}
              onAdvancedFiltersChange={setAdvancedFilters}
              onShowAdvancedSearchChange={setShowAdvancedSearch}
              onClearFilters={handleClearFilters}
            />
          </CardHeader>

          <CardContent>
            <ResourcesTable
              resources={filteredResources}
              useVirtualScrolling={useVirtualScrolling}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
          </CardContent>
        </Card>

        {/* Modal de confirmación para eliminar */}
        <ConfirmDialog
          open={showDeleteModal}
          title={t("delete_confirm_title")}
          description={t("delete_confirm_desc", {
            name: resourceToDelete?.name || "",
          })}
          confirmText={tCommon("delete")}
          cancelText={tCommon("cancel")}
          onConfirm={handleDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setResourceToDelete(null);
          }}
          variant="destructive"
        />
      </div>
    </MainLayout>
  );
}
