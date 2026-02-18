"use client";

import { Button } from "@/components/atoms/Button";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import type { AdvancedSearchFilters } from "@/components/organisms/AdvancedSearchModal";
import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar";
import { MainLayout } from "@/components/templates/MainLayout";
import {
  categoryKeys,
  useDeleteResource,
  useUpdateResource,
} from "@/hooks/mutations";
import { resourceKeys } from "@/hooks/useResources";
import { useRouter } from "@/i18n/navigation";
import { httpClient } from "@/infrastructure/http";
import { cn } from "@/lib/utils";
import type { Category, Resource } from "@/types/entities/resource";
import { useQuery } from "@tanstack/react-query";
import { List as ListIcon, Table as TableIcon } from "lucide-react";
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
  data: ResourceCollectionPayload | Resource[] | any,
): Resource[] {
  if (!data) {
    console.warn("[extractResources] No data provided");
    return [];
  }

  // Caso 1: Directly an array
  if (Array.isArray(data)) {
    return data;
  }

  // Caso 2: Known keys
  if (data?.resources && Array.isArray(data.resources)) return data.resources;
  if (data?.items && Array.isArray(data.items)) return data.items;
  if (data?.data && Array.isArray(data.data)) return data.data;

  // Caso 3: Nested data (double wrapping)
  if (data?.data && !Array.isArray(data.data)) {
    return extractResources(data.data);
  }

  // Caso 4: Search for ANY array in the object (last resort)
  const arrayKey = Object.keys(data).find((key) => Array.isArray(data[key]));
  if (arrayKey) {
    console.log(`[extractResources] Found array in unknown key: "${arrayKey}"`);
    return data[arrayKey];
  }

  console.warn("[extractResources] No array found in response structure", data);
  return [];
}

function extractCategories(
  data: CategoryCollectionPayload | Category[] | any,
): Category[] {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data;
  }

  if (data?.categories && Array.isArray(data.categories)) {
    return data.categories;
  }

  if (data?.items && Array.isArray(data.items)) {
    return data.items;
  }

  if (data?.data) {
    return extractCategories(data.data);
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
      try {
        const response = await httpClient.get<
          ResourceCollectionPayload | Resource[]
        >("resources");

        console.log("[RecursosPage] API Response:", response);

        if (!response.success) {
          console.error("[RecursosPage] API Error:", response.message);
          return [];
        }

        const extracted = extractResources(response.data);
        console.log(
          "[RecursosPage] Extracted resources count:",
          extracted.length,
        );
        return extracted;
      } catch (error) {
        console.error("[RecursosPage] Fetch failed:", error);
        return [];
      }
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
  const updateResource = useUpdateResource();

  // ============================================
  // ESTADO LOCAL
  // ============================================

  // Filtros
  const [filter, setFilter] = React.useState("");
  const [advancedFilters, setAdvancedFilters] =
    React.useState<AdvancedSearchFilters>({});
  const [showUnavailable, setShowUnavailable] = React.useState(false);

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
    // Filtrar por disponibilidad según el toggle
    if (showUnavailable) {
      // Si el check está ON, solo mostrar recursos UNAVAILABLE
      if (resource.status !== "UNAVAILABLE") return false;
    } else {
      // Si el check está OFF (default), solo mostrar recursos disponibles (AVAILABLE, RESERVED, MAINTENANCE)
      if (resource.status === "UNAVAILABLE") return false;
    }

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
    setShowUnavailable(false);
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

  const handleRestore = (resource: Resource) => {
    updateResource.mutate(
      {
        id: resource.id,
        data: { status: "AVAILABLE" as any },
      },
      {
        onSuccess: () => {
          // Ya se invalida en el hook, pero podemos forzar si es necesario
        },
      },
    );
  };

  const handleDeleteClick = (resource: Resource) => {
    setResourceToDelete(resource);
    setShowDeleteModal(true);
  };

  // ============================================
  // RENDER
  // ============================================

  // ============================================
  // LOGGING STATE CHANGES
  // ============================================
  React.useEffect(() => {
    console.log("[RecursosPage] Resources state changed:", {
      count: resources.length,
      isLoading: loading,
      hasData: resources.length > 0,
    });
  }, [resources, loading]);

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
      <div className="space-y-6 pb-6 px-4 md:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-[var(--color-text-primary)]">
              {t("title")}
            </h2>
            <p className="text-[var(--color-text-secondary)] mt-1 font-medium">
              {t("management")}
            </p>
          </div>
          <Button
            onClick={() => router.push("/recursos/nuevo")}
            className="bg-brand-primary-600 hover:bg-brand-primary-700 shadow-md hover:shadow-lg transition-all active:scale-95 rounded-xl px-6 font-bold"
          >
            {t("create")}
          </Button>
        </div>

        {/* Stats Cards */}
        <ResourceStatsCards resources={resources} />

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2 text-[var(--color-text-primary)]">
                <ListIcon className="w-5 h-5 text-brand-primary-500" />
                {t("list")}
              </h3>
              <p className="text-sm font-medium text-[var(--color-text-tertiary)]">
                {t("showing_count", {
                  count: filteredResources.length,
                  total: resources.length,
                })}
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[var(--color-bg-muted)]/50 p-1 rounded-xl border border-[var(--color-border-subtle)]/50">
              <Button
                variant={!useVirtualScrolling ? "default" : "ghost"}
                size="sm"
                onClick={() => setUseVirtualScrolling(false)}
                className={cn(
                  "h-8 px-3 rounded-lg text-xs font-bold transition-all",
                  !useVirtualScrolling
                    ? "bg-white text-brand-primary-600 shadow-sm border-none hover:bg-white"
                    : "text-[var(--color-text-tertiary)] hover:text-brand-primary-500",
                )}
              >
                <TableIcon className="w-3.5 h-3.5 mr-1.5" />
                {t("view_table")}
              </Button>
              <Button
                variant={useVirtualScrolling ? "default" : "ghost"}
                size="sm"
                onClick={() => setUseVirtualScrolling(true)}
                className={cn(
                  "h-8 px-3 rounded-lg text-xs font-bold transition-all",
                  useVirtualScrolling
                    ? "bg-white text-brand-primary-600 shadow-sm border-none hover:bg-white"
                    : "text-[var(--color-text-tertiary)] hover:text-brand-primary-500",
                )}
              >
                <ListIcon className="w-3.5 h-3.5 mr-1.5" />
                {t("view_list")}
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <ResourceFiltersSection
            filter={filter}
            advancedFilters={advancedFilters}
            showAdvancedSearch={showAdvancedSearch}
            showUnavailable={showUnavailable}
            categories={categories}
            onFilterChange={setFilter}
            onAdvancedFiltersChange={setAdvancedFilters}
            onShowAdvancedSearchChange={setShowAdvancedSearch}
            onShowUnavailableChange={setShowUnavailable}
            onClearFilters={handleClearFilters}
          />

          <div className="pt-2">
            <ResourcesTable
              resources={filteredResources}
              useVirtualScrolling={useVirtualScrolling}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onRestore={handleRestore}
            />
          </div>
        </div>

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
