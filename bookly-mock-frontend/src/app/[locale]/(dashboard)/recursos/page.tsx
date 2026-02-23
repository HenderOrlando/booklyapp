"use client";

import { Button } from "@/components/atoms/Button";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { ConfirmDialog } from "@/components/molecules/ConfirmDialog";
import type { AdvancedSearchFilters } from "@/components/organisms/AdvancedSearchModal";
import { useDeleteResource, useUpdateResource } from "@/hooks/mutations";
import {
  useAcademicPrograms,
  useResourceCategories,
  useResourceCharacteristics,
  useResources,
} from "@/hooks/useResources";
import { useRouter } from "@/i18n/navigation";
import {
  dataConfigStore,
  getDataConfigSnapshot,
} from "@/lib/data-config/store";
import { extractArray } from "@/lib/data-utils";
import { cn } from "@/lib/utils";
import type {
  AcademicProgram,
  Category,
  Resource,
} from "@/types/entities/resource";
import { ResourceType } from "@/types/entities/resource";
import {
  AlertCircle,
  Database,
  List as ListIcon,
  RefreshCw,
  Settings2,
  Table as TableIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";
import {
  ResourceFiltersSection,
  ResourceStatsCards,
  ResourcesTable,
} from "./components";
import { ListLayout } from "@/components/templates/ListLayout";

export default function RecursosPage() {
  const router = useRouter();
  const t = useTranslations("resources");
  const tCommon = useTranslations("common");

  const RESOURCE_TYPE_LABELS: Record<string, string> = React.useMemo(
    () => ({
      [ResourceType.CLASSROOM]: t("type_labels.CLASSROOM"),
      [ResourceType.LABORATORY]: t("type_labels.LABORATORY"),
      [ResourceType.AUDITORIUM]: t("type_labels.AUDITORIUM"),
      [ResourceType.MULTIMEDIA_EQUIPMENT]: t(
        "type_labels.MULTIMEDIA_EQUIPMENT",
      ),
      [ResourceType.SPORTS_FACILITY]: t("type_labels.SPORTS_FACILITY"),
      [ResourceType.MEETING_ROOM]: t("type_labels.MEETING_ROOM"),
    }),
    [t],
  );

  // ============================================
  // HOOKS DE DATOS
  // ============================================

  const {
    data: resourcesData,
    isLoading: loading,
    error: resourcesError,
    refetch: refetchResources,
  } = useResources();
  const { data: categoriesData, refetch: refetchCategories } =
    useResourceCategories();
  const { data: characteristicsData, refetch: refetchCharacteristics } =
    useResourceCharacteristics();
  const { data: programsData, refetch: refetchPrograms } =
    useAcademicPrograms();

  // Detección de posibles conflictos de puertos (Next.js vs API Gateway)
  const [portConflict, setPortConflict] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const currentPort =
        window.location.port ||
        (window.location.protocol === "https:" ? "443" : "80");
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      const apiGatewayUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL || "";
      const apiGatewayPort =
        apiGatewayUrl.match(/:(\d+)/)?.[1] ||
        (apiGatewayUrl.startsWith("https") ? "443" : "80");

      if (isLocalhost && currentPort === apiGatewayPort) {
        console.warn(
          `[RecursosPage] Conflicto de puertos detectado: Frontend y API Gateway ambos en el puerto ${currentPort}`,
        );
        setPortConflict(true);
      }
    }
  }, []);

  const handleResetConfig = () => {
    console.log("[RecursosPage] Resetting configuration to defaults");
    dataConfigStore.resetToEnv();
    window.location.reload();
  };

  const handleRefresh = () => {
    console.log("[RecursosPage] Refreshing data...");
    refetchResources();
    refetchCategories();
    refetchCharacteristics();
    refetchPrograms();
  };

  const configSnapshot = React.useMemo(() => getDataConfigSnapshot(), []);

  const resources = React.useMemo(() => {
    // Intentar extraer de 'items' (estándar PaginatedResponse) o 'resources'
    let extracted = extractArray<Resource>(resourcesData, "items");

    if (extracted.length === 0) {
      extracted = extractArray<Resource>(resourcesData, "resources");
    }

    console.log("[RecursosPage] Resources extraction:", {
      rawData: resourcesData,
      extractedCount: extracted.length,
      hasData: !!resourcesData,
    });
    return extracted;
  }, [resourcesData]);

  const categories = React.useMemo(() => {
    let extracted = extractArray<Category>(categoriesData, "categories");
    if (extracted.length === 0) {
      extracted = extractArray<Category>(categoriesData, "items");
    }
    return extracted.map((item) => ({
      ...item,
      id: item.id || (item as { _id?: string })._id || Math.random().toString(36).substring(7),
    }));
  }, [categoriesData]);

  const characteristics = React.useMemo(() => {
    const items = extractArray<{ id?: string; _id?: string; code?: string; name?: string; icon?: string }>(
      characteristicsData,
      "items"
    );
    return items.map((item) => ({
      id: item.id || item._id || item.code || Math.random().toString(36).substring(7),
      name: item.name || "Sin nombre",
      icon: item.icon,
      code: item.code,
    }));
  }, [characteristicsData]);

  const allPrograms = React.useMemo(() => {
    const items = extractArray<AcademicProgram>(programsData, "items");
    return items.map((item) => ({
      ...item,
      id: item.id || (item as { _id?: string })._id || Math.random().toString(36).substring(7),
    }));
  }, [programsData]);

  // ============================================
  // LOGGING ERRORS
  // ============================================
  React.useEffect(() => {
    if (resourcesError) {
      console.error("[RecursosPage] Resources fetch error:", resourcesError);
    }
  }, [resourcesError]);

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
        (resource.name || "").toLowerCase().includes(searchTerm) ||
        (resource.code || "").toLowerCase().includes(searchTerm) ||
        (resource.description || "").toLowerCase().includes(searchTerm) ||
        (resource.location || "").toLowerCase().includes(searchTerm) ||
        (resource.type || "").toLowerCase().includes(searchTerm);
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
    if (filters.minCapacity && (resource.capacity || 0) < filters.minCapacity) {
      return false;
    }
    if (filters.maxCapacity && (resource.capacity || 0) > filters.maxCapacity) {
      return false;
    }

    // Filtro por características dinámicas
    if (filters.characteristicIds && filters.characteristicIds.length > 0) {
      const resourceChars = (resource.attributes?.characteristics || []) as (
        | string
        | { id: string }
      )[];
      const resourceCharIds = resourceChars.map((c) =>
        typeof c === "string" ? c : c.id,
      );

      // Debe tener TODAS las características seleccionadas
      const hasAllChars = filters.characteristicIds.every((id) =>
        resourceCharIds.includes(id),
      );
      if (!hasAllChars) return false;
    }

    // Filtro por programas académicos
    if (filters.programIds && filters.programIds.length > 0) {
      const resourceProgramIds = resource.programIds || [];
      // Debe estar disponible para AL MENOS UNO de los programas seleccionados
      const matchesProgram = filters.programIds.some((id) =>
        resourceProgramIds.includes(id),
      );
      if (!matchesProgram) return false;
    }

    // Filtro por características legacy (booleanos)
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

  const filteredResources = React.useMemo(() => {
    const filtered = resources.filter((resource: Resource) => {
      // Validar objeto resource
      if (!resource) return false;

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
        const typeLabel = (
          RESOURCE_TYPE_LABELS[resource.type] || ""
        ).toLowerCase();
        const matchesBasic =
          (resource.name || "").toLowerCase().includes(searchTerm) ||
          (resource.code || "").toLowerCase().includes(searchTerm) ||
          (resource.description || "").toLowerCase().includes(searchTerm) ||
          (resource.location || "").toLowerCase().includes(searchTerm) ||
          (resource.type || "").toLowerCase().includes(searchTerm) ||
          typeLabel.includes(searchTerm);
        if (!matchesBasic) return false;
      }

      // Aplicar filtros avanzados si están activos
      if (Object.keys(advancedFilters).length > 0) {
        return applyAdvancedFilters(resource, advancedFilters);
      }

      return true;
    });

    console.log("[RecursosPage] Filtering resources:", {
      totalIn: resources.length,
      filteredOut: resources.length - filtered.length,
      totalOut: filtered.length,
      showUnavailable,
    });

    return filtered;
  }, [
    resources,
    showUnavailable,
    filter,
    advancedFilters,
    RESOURCE_TYPE_LABELS,
  ]);

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
        data: { status: "AVAILABLE" as unknown as Resource["status"] },
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

  if (resourcesError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-16 h-16 bg-state-error-bg text-state-error-text rounded-full flex items-center justify-center">
          <TableIcon size={32} />
        </div>
        <h2 className="text-2xl font-bold text-content-primary">
          {t("error_loading")}
        </h2>
        <p className="text-content-tertiary max-w-md text-center">
          {resourcesError instanceof Error
            ? resourcesError.message
            : String(resourcesError)}
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-action-primary"
        >
          {tCommon("retry")}
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
        <p className="text-content-tertiary mt-4">
          {t("loading")}
        </p>
      </div>
    );
  }

  return (
    <ListLayout
      title={t("title")}
      badge={{ text: t("management"), variant: "secondary" }}
      onCreate={() => router.push("/recursos/nuevo")}
      createLabel={t("create")}
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="h-10 px-3 rounded-md border-line-subtle text-content-tertiary hover:text-action-primary hover:border-action-primary transition-all"
          title="Refrescar datos"
        >
          <RefreshCw size={16} className={cn(loading && "animate-spin", "mr-2")} />
          Refrescar
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Alerta de Conflicto de Puertos */}
        {portConflict && process.env.NODE_ENV === "development" && (
          <div className="p-4 bg-state-warning-50 border border-state-warning-200 rounded-xl flex items-start gap-3 dark:bg-state-warning-900 dark:border-state-warning-500">
            <AlertCircle
              className="text-state-warning-700 dark:text-state-warning-200 shrink-0 mt-0.5"
              size={18}
            />
            <div>
              <h4 className="text-sm font-bold text-state-warning-900 dark:text-state-warning-200">
                Posible Conflicto de Configuración
              </h4>
              <p className="text-xs text-state-warning-700 dark:text-state-warning-200 mt-1">
                El Frontend y el API Gateway parecen estar usando el mismo
                puerto (3000). Si no ves datos, verifica que el API Gateway esté
                corriendo en un puerto diferente o usa
                <code className="mx-1 px-1 bg-state-warning-100 dark:bg-state-warning-900 rounded">
                  NEXT_PUBLIC_USE_DIRECT_SERVICES=true
                </code>
                en tu archivo{" "}
                <code className="px-1 bg-state-warning-100 dark:bg-state-warning-900 rounded">.env.local</code>.
              </p>
            </div>
          </div>
        )}

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

            <div className="flex items-center gap-1 bg-[var(--color-bg-muted)]/50 p-1 rounded-xl border border-[var(--color-border-subtle)]/50">
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
            characteristics={characteristics}
            programs={allPrograms}
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

          {/* Panel de Debug Temporal (solo si no hay datos) */}
          {process.env.NODE_ENV === "development" &&
            resources.length === 0 &&
            !loading && (
              <div className="mt-8 p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-slate-300">
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Database size={16} className="text-blue-400" />
                    DEBUG: Diagnóstico de Datos
                  </h4>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefresh}
                      className="h-8 text-xs text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <RefreshCw size={12} className="mr-1.5" />
                      Reintentar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleResetConfig}
                      className="h-8 text-xs text-orange-400 hover:text-orange-300 hover:bg-orange-900/20"
                    >
                      <Settings2 size={12} className="mr-1.5" />
                      Resetear Config
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-[11px]">
                  <div className="space-y-1">
                    <p className="text-slate-500 uppercase font-bold tracking-wider">
                      Configuración Activa
                    </p>
                    <div className="flex flex-col gap-1">
                      <p>
                        Modo:{" "}
                        <span
                          className={cn(
                            "font-mono font-bold",
                            configSnapshot.dataMode === "SERVER"
                              ? "text-green-400"
                              : "text-yellow-400",
                          )}
                        >
                          {configSnapshot.dataMode}
                        </span>
                      </p>
                      <p>
                        Ruteo:{" "}
                        <span className="font-mono text-blue-400 font-bold">
                          {configSnapshot.routingMode}
                        </span>
                      </p>
                      <p>
                        Direct Services:{" "}
                        <span className="font-mono text-purple-400 font-bold">
                          {String(configSnapshot.useDirectServices)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-500 uppercase font-bold tracking-wider">
                      Estado de Carga
                    </p>
                    <div className="flex flex-col gap-1">
                      <p>
                        Fetching:{" "}
                        <span className="font-mono text-white font-bold">
                          {String(loading)}
                        </span>
                      </p>
                      <p>
                        Error:{" "}
                        <span className="font-mono text-red-400 font-bold">
                          {resourcesError ? "SÍ" : "NO"}
                        </span>
                      </p>
                      <p>
                        Raw Data:{" "}
                        <span className="font-mono text-white font-bold">
                          {resourcesData ? "Presente" : "Nulo/Undefined"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 mb-2 uppercase font-bold tracking-wider">
                  JSON de Respuesta:
                </p>
                <pre className="text-[10px] overflow-auto max-h-60 p-3 bg-black/50 rounded-xl border border-slate-800 font-mono text-blue-300">
                  {resourcesData
                    ? JSON.stringify(resourcesData, null, 2)
                    : "// No hay datos recibidos"}
                </pre>

                {resourcesData && resources.length === 0 && (
                  <div className="mt-3 p-2 bg-blue-900/20 border border-blue-800/50 rounded-lg text-[10px] text-blue-300 italic">
                    💡 Los datos existen pero el extractor no encontró un array.
                    Verifica si la clave que contiene el array es diferente a
                    &apos;items&apos; o &apos;resources&apos;.
                  </div>
                )}
              </div>
            )}
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
    </ListLayout>
  );
}
