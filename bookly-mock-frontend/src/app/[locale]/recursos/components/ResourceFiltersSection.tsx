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
import type { Category } from "@/types/entities/resource";
import { useTranslations } from "next-intl";

interface ResourceFiltersSectionProps {
  filter: string;
  advancedFilters: AdvancedSearchFilters;
  showAdvancedSearch: boolean;
  categories: Category[];
  onFilterChange: (value: string) => void;
  onAdvancedFiltersChange: (filters: AdvancedSearchFilters) => void;
  onShowAdvancedSearchChange: (show: boolean) => void;
  onClearFilters: () => void;
}

export function ResourceFiltersSection({
  filter,
  advancedFilters,
  showAdvancedSearch,
  categories,
  onFilterChange,
  onAdvancedFiltersChange,
  onShowAdvancedSearchChange,
  onClearFilters,
}: ResourceFiltersSectionProps) {
  const t = useTranslations("resources");

  // Verificar si hay filtros activos
  const hasActiveFilters = () => {
    return (
      filter !== "" ||
      Object.keys(advancedFilters).some(
        (key) =>
          advancedFilters[key as keyof AdvancedSearchFilters] !== undefined &&
          advancedFilters[key as keyof AdvancedSearchFilters] !== "" &&
          (!Array.isArray(
            advancedFilters[key as keyof AdvancedSearchFilters]
          ) ||
            (advancedFilters[key as keyof AdvancedSearchFilters] as any[])
              .length > 0)
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
        value: advancedFilters.types.length,
      });
    }

    if (advancedFilters.statuses && advancedFilters.statuses.length > 0) {
      chips.push({
        key: "statuses",
        label: t("filters.statuses"),
        value: advancedFilters.statuses.length,
      });
    }

    if (advancedFilters.categoryId) {
      const catName = categories.find(
        (c: Category) => c.id === advancedFilters.categoryId
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

    return chips;
  };

  // Remover chip individual
  const handleRemoveChip = (key: string) => {
    const newFilters = { ...advancedFilters };

    if (key === "text") delete newFilters.text;
    else if (key === "types") delete newFilters.types;
    else if (key === "statuses") delete newFilters.statuses;
    else if (key === "categoryId") delete newFilters.categoryId;
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
    <div className="space-y-3">
      {/* Barra de búsqueda */}
      <div className="flex items-center gap-3">
        <SearchBar
          placeholder={t("search_placeholder")}
          value={filter}
          onChange={onFilterChange}
          onClear={() => onFilterChange("")}
          showAdvancedSearch
          onAdvancedSearch={() => onShowAdvancedSearchChange(true)}
          className="flex-1"
        />
        {hasActiveFilters() && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            {t("clear_filters")}
          </Button>
        )}
      </div>

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
      />
    </div>
  );
}
