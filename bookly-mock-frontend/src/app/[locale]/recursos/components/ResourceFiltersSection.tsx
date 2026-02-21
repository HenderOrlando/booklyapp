/**
 * ResourceFiltersSection - Sección de búsqueda y filtros para recursos
 *
 * Incluye búsqueda básica, filtros avanzados y chips de filtros activos
 */

import { Button } from "@/components/atoms/Button";
import {
  FilterChips,
  type FilterChip,
} from "@/components/molecules/FilterChips";
import { SearchBar } from "@/components/molecules/SearchBar";
import {
  AdvancedSearchFilters,
  AdvancedSearchModal,
} from "@/components/organisms/AdvancedSearchModal";
import { useResourceTypes } from "@/hooks/useResources";
import { cn } from "@/lib/utils";
import {
  AcademicProgram,
  Category,
  ResourceType,
} from "@/types/entities/resource";
import { Layers, Search, Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

interface ResourceFiltersSectionProps {
  filter: string;
  advancedFilters: AdvancedSearchFilters;
  showAdvancedSearch: boolean;
  showUnavailable: boolean;
  categories: Category[];
  characteristics: { id: string; name: string; icon?: string }[];
  programs: AcademicProgram[];
  onFilterChange: (value: string) => void;
  onAdvancedFiltersChange: (filters: AdvancedSearchFilters) => void;
  onShowAdvancedSearchChange: (show: boolean) => void;
  onShowUnavailableChange: (value: boolean) => void;
  onClearFilters: () => void;
}

export function ResourceFiltersSection({
  filter,
  advancedFilters,
  showAdvancedSearch,
  showUnavailable,
  categories,
  characteristics,
  programs,
  onFilterChange,
  onAdvancedFiltersChange,
  onShowAdvancedSearchChange,
  onShowUnavailableChange,
  onClearFilters,
}: ResourceFiltersSectionProps) {
  const t = useTranslations("resources");

  const { data: resourceTypesData } = useResourceTypes();
  const resourceTypes = React.useMemo(() => {
    const types = (resourceTypesData || []).map((rt) => ({
      id: rt.code as ResourceType,
      label: rt.name,
      icon: rt.icon || "📦",
    }));
    // Si no hay datos del backend, usar fallbacks básicos o lista vacía
    return types.length > 0 ? types : [];
  }, [resourceTypesData]);

  const [quickTypeQuery, setQuickTypeQuery] = React.useState("");
  const [quickCharQuery, setQuickCharQuery] = React.useState("");

  const filteredQuickTypes = resourceTypes
    .filter((rt) =>
      rt.label.toLowerCase().includes(quickTypeQuery.toLowerCase()),
    )
    .slice(0, 6);

  const filteredQuickChars = characteristics
    .filter((char) =>
      char.name.toLowerCase().includes(quickCharQuery.toLowerCase()),
    )
    .slice(0, 6);

  const handleTypeQuickToggle = (type: ResourceType) => {
    const currentTypes = advancedFilters.types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];
    onAdvancedFiltersChange({ ...advancedFilters, types: newTypes });
  };

  const handleCharQuickToggle = (id: string) => {
    const currentChars = advancedFilters.characteristicIds || [];
    const newChars = currentChars.includes(id)
      ? currentChars.filter((c) => c !== id)
      : [...currentChars, id];
    onAdvancedFiltersChange({
      ...advancedFilters,
      characteristicIds: newChars,
    });
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = () => {
    return (
      filter !== "" ||
      showUnavailable ||
      Object.keys(advancedFilters).some(
        (key) =>
          advancedFilters[key as keyof AdvancedSearchFilters] !== undefined &&
          advancedFilters[key as keyof AdvancedSearchFilters] !== "" &&
          (!Array.isArray(
            advancedFilters[key as keyof AdvancedSearchFilters],
          ) ||
            (advancedFilters[key as keyof AdvancedSearchFilters] as unknown[])
              .length > 0),
      )
    );
  };

  // Convertir filtros avanzados a chips
  const getFilterChips = (): FilterChip[] => {
    const chips: FilterChip[] = [];

    if (advancedFilters.text) {
      chips.push({
        key: "text",
        label: t("filters.text"),
        value: advancedFilters.text,
      });
    }

    if (advancedFilters.types && advancedFilters.types.length > 0) {
      chips.push({
        key: "types",
        label: t("filters.types"),
        value: advancedFilters.types.length.toString(),
      });
    }

    if (advancedFilters.statuses && advancedFilters.statuses.length > 0) {
      chips.push({
        key: "statuses",
        label: t("filters.statuses"),
        value: advancedFilters.statuses.length.toString(),
      });
    }

    if (advancedFilters.categoryId) {
      const catName = categories.find(
        (c: Category) => c.id === advancedFilters.categoryId,
      )?.name;
      chips.push({
        key: "categoryId",
        label: t("filters.category"),
        value: catName || "",
      });
    }

    if (advancedFilters.minCapacity || advancedFilters.maxCapacity) {
      chips.push({
        key: "capacity",
        label: t("filters.capacity"),
        value: `${advancedFilters.minCapacity || "0"} - ${advancedFilters.maxCapacity || "∞"}`,
      });
    }

    if (
      advancedFilters.hasProjector ||
      advancedFilters.hasAirConditioning ||
      advancedFilters.hasWhiteboard ||
      advancedFilters.hasComputers
    ) {
      chips.push({
        key: "features",
        label: t("filters.features"),
        value: "Sí",
      });
    }

    if (
      advancedFilters.characteristicIds &&
      advancedFilters.characteristicIds.length > 0
    ) {
      chips.push({
        key: "characteristics",
        label: "Características",
        value: advancedFilters.characteristicIds.length.toString(),
      });
    }

    if (advancedFilters.programIds && advancedFilters.programIds.length > 0) {
      chips.push({
        key: "programs",
        label: "Programas",
        value: advancedFilters.programIds.length.toString(),
      });
    }

    return chips;
  };

  // Remover chip individual
  const handleRemoveChip = (key: string) => {
    const newFilters = { ...advancedFilters };

    if (key === "text") delete newFilters.text;
    else if (key === "types") delete newFilters.types;
    else if (key === "statuses") delete newFilters.statuses;
    else if (key === "categoryId") delete newFilters.categoryId;
    else if (key === "characteristics") delete newFilters.characteristicIds;
    else if (key === "programs") delete newFilters.programIds;
    else if (key === "capacity") {
      delete newFilters.minCapacity;
      delete newFilters.maxCapacity;
    } else if (key === "features") {
      delete newFilters.hasProjector;
      delete newFilters.hasAirConditioning;
      delete newFilters.hasWhiteboard;
      delete newFilters.hasComputers;
    }

    onAdvancedFiltersChange(newFilters);
  };

  return (
    <div className="space-y-4">
      {/* Barra de búsqueda */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <SearchBar
          placeholder={t("search_placeholder")}
          value={filter}
          onChange={onFilterChange}
          onClear={() => onFilterChange("")}
          showAdvancedSearch
          onAdvancedSearch={() => onShowAdvancedSearchChange(true)}
          className="flex-1"
        />
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-muted)]/30 hover:bg-[var(--color-bg-muted)]/50 transition-colors cursor-pointer group/toggle h-10">
            <input
              type="checkbox"
              id="showUnavailable"
              checked={showUnavailable}
              onChange={(e) => onShowUnavailableChange(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-[var(--color-border-subtle)] text-brand-primary-500 focus:ring-brand-primary-500 cursor-pointer"
            />
            <label
              htmlFor="showUnavailable"
              className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] group-hover/toggle:text-[var(--color-text-primary)] cursor-pointer select-none"
            >
              {t("show_unavailable")}
            </label>
          </div>
          {hasActiveFilters() && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="h-10 rounded-xl px-4 font-bold text-xs uppercase tracking-wider text-state-error-600 border-state-error-200 hover:bg-state-error-50"
            >
              {t("clear_filters")}
            </Button>
          )}
        </div>
      </div>

      {/* Filtros Rápidos: Tipos de Recurso */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">
            <Layers size={12} />
            Filtro Rápido: Tipos
          </div>
          <div className="relative w-32">
            <Search
              size={10}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
            />
            <input
              type="text"
              placeholder="Filtrar..."
              value={quickTypeQuery}
              onChange={(e) => setQuickTypeQuery(e.target.value)}
              className="w-full h-6 pl-6 text-[10px] bg-[var(--color-bg-muted)]/20 border border-[var(--color-border-subtle)] rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary-500 transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filteredQuickTypes.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => handleTypeQuickToggle(id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-bold whitespace-nowrap transition-all",
                advancedFilters.types?.includes(id)
                  ? "border-brand-primary-500 bg-brand-primary-500 text-white shadow-md scale-105"
                  : "border-[var(--color-border-subtle)] bg-white text-[var(--color-text-secondary)] hover:border-brand-primary-300 hover:bg-brand-primary-50/50",
              )}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
          {filteredQuickTypes.length === 0 && (
            <span className="text-[10px] text-[var(--color-text-tertiary)] italic px-2">
              No hay coincidencias
            </span>
          )}
        </div>
      </div>

      {/* Filtros Rápidos: Características Destacadas (si hay) */}
      {characteristics.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">
              <Tag size={12} />
              Filtro Rápido: Características
            </div>
            <div className="relative w-32">
              <Search
                size={10}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
              />
              <input
                type="text"
                placeholder="Filtrar..."
                value={quickCharQuery}
                onChange={(e) => setQuickCharQuery(e.target.value)}
                className="w-full h-6 pl-6 text-[10px] bg-[var(--color-bg-muted)]/20 border border-[var(--color-border-subtle)] rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary-500 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {filteredQuickChars.map((char) => (
              <button
                key={char.id}
                onClick={() => handleCharQuickToggle(char.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-bold whitespace-nowrap transition-all",
                  advancedFilters.characteristicIds?.includes(char.id)
                    ? "border-brand-primary-600 bg-brand-primary-600 text-white shadow-md scale-105"
                    : "border-[var(--color-border-subtle)] bg-white text-[var(--color-text-secondary)] hover:border-brand-primary-300 hover:bg-brand-primary-50/50",
                )}
              >
                {char.icon && <span>{char.icon}</span>}
                {char.name}
              </button>
            ))}
            {filteredQuickChars.length === 0 && (
              <span className="text-[10px] text-[var(--color-text-tertiary)] italic px-2">
                No hay coincidencias
              </span>
            )}
          </div>
        </div>
      )}

      {/* Chips de filtros activos */}
      {Object.keys(advancedFilters).length > 0 && (
        <FilterChips
          filters={getFilterChips()}
          onRemove={handleRemoveChip}
          onClearAll={onClearFilters}
        />
      )}

      {/* Modal de búsqueda avanzada */}
      <AdvancedSearchModal
        isOpen={showAdvancedSearch}
        onClose={() => onShowAdvancedSearchChange(false)}
        onSearch={onAdvancedFiltersChange}
        initialFilters={advancedFilters}
        categories={categories}
        characteristics={characteristics}
        programs={programs}
      />
    </div>
  );
}
