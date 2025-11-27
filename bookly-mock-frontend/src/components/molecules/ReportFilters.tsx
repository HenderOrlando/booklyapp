import { FilterTag } from "@/components/atoms/FilterTag";
import { format } from "date-fns";
import { Filter, Search } from "lucide-react";
import * as React from "react";
import { DateRangePicker } from "./DateRangePicker";

/**
 * ReportFilters - Panel de filtros para reportes
 *
 * Panel completo con filtros de búsqueda, categorías, programas y rango de fechas.
 * Muestra tags de filtros activos con opción de removerlos.
 *
 * @component
 * @example
 * ```tsx
 * <ReportFilters
 *   filters={currentFilters}
 *   onFiltersChange={setFilters}
 *   categories={categories}
 *   programs={programs}
 * />
 * ```
 */

export interface ReportFiltersState {
  search?: string;
  categoryId?: string;
  programId?: string;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface ReportFiltersProps {
  filters: ReportFiltersState;
  onFiltersChange: (filters: ReportFiltersState) => void;
  categories?: Array<{ id: string; name: string }>;
  programs?: Array<{ id: string; name: string }>;
  showDateRange?: boolean;
  showSearch?: boolean;
  className?: string;
}

export const ReportFilters = React.memo<ReportFiltersProps>(
  ({
    filters,
    onFiltersChange,
    categories = [],
    programs = [],
    showDateRange = true,
    showSearch = true,
    className = "",
  }) => {
    const updateFilter = (key: keyof ReportFiltersState, value: any) => {
      onFiltersChange({ ...filters, [key]: value });
    };

    const removeFilter = (key: keyof ReportFiltersState) => {
      const newFilters = { ...filters };
      delete newFilters[key];
      onFiltersChange(newFilters);
    };

    const clearAllFilters = () => {
      onFiltersChange({});
    };

    // Obtener nombres para tags
    const getCategoryName = (id: string) =>
      categories.find((c) => c.id === id)?.name || id;
    const getProgramName = (id: string) =>
      programs.find((p) => p.id === id)?.name || id;

    // Contar filtros activos
    const activeFiltersCount = Object.keys(filters).filter(
      (key) => filters[key as keyof ReportFiltersState]
    ).length;

    return (
      <div
        className={`
          bg-white dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700 
          rounded-lg p-6
          space-y-4
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Filtros
            </h3>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium bg-[var(--color-primary-base)] text-white rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Limpiar todo
            </button>
          )}
        </div>

        {/* Search */}
        {showSearch && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar..."
              value={filters.search || ""}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="
                w-full pl-10 pr-4 py-2
                text-sm
                border border-gray-300 dark:border-gray-600
                rounded-lg
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                placeholder-gray-500 dark:placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-base)] focus:border-transparent
                transition-colors
              "
            />
          </div>
        )}

        {/* Selects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Categoría */}
          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoría
              </label>
              <select
                value={filters.categoryId || ""}
                onChange={(e) =>
                  updateFilter("categoryId", e.target.value || undefined)
                }
                className="
                  w-full px-3 py-2
                  text-sm
                  border border-gray-300 dark:border-gray-600
                  rounded-lg
                  bg-white dark:bg-gray-800
                  text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-base)] focus:border-transparent
                  transition-colors
                "
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Programa */}
          {programs.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Programa
              </label>
              <select
                value={filters.programId || ""}
                onChange={(e) =>
                  updateFilter("programId", e.target.value || undefined)
                }
                className="
                  w-full px-3 py-2
                  text-sm
                  border border-gray-300 dark:border-gray-600
                  rounded-lg
                  bg-white dark:bg-gray-800
                  text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-base)] focus:border-transparent
                  transition-colors
                "
              >
                <option value="">Todos los programas</option>
                {programs.map((prog) => (
                  <option key={prog.id} value={prog.id}>
                    {prog.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Date Range */}
        {showDateRange && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rango de fechas
            </label>
            <DateRangePicker
              startDate={filters.startDate || null}
              endDate={filters.endDate || null}
              onRangeChange={(start, end) => {
                onFiltersChange({
                  ...filters,
                  startDate: start,
                  endDate: end,
                });
              }}
            />
          </div>
        )}

        {/* Active Filters Tags */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            {filters.search && (
              <FilterTag
                label="Búsqueda"
                value={filters.search}
                onRemove={() => removeFilter("search")}
                color="gray"
              />
            )}
            {filters.categoryId && (
              <FilterTag
                label="Categoría"
                value={getCategoryName(filters.categoryId)}
                onRemove={() => removeFilter("categoryId")}
                color="blue"
              />
            )}
            {filters.programId && (
              <FilterTag
                label="Programa"
                value={getProgramName(filters.programId)}
                onRemove={() => removeFilter("programId")}
                color="green"
              />
            )}
            {(filters.startDate || filters.endDate) && (
              <FilterTag
                label="Período"
                value={`${filters.startDate ? format(filters.startDate, "dd/MM/yyyy") : "?"} - ${filters.endDate ? format(filters.endDate, "dd/MM/yyyy") : "?"}`}
                onRemove={() => {
                  const newFilters = { ...filters };
                  delete newFilters.startDate;
                  delete newFilters.endDate;
                  onFiltersChange(newFilters);
                }}
                color="purple"
              />
            )}
          </div>
        )}
      </div>
    );
  }
);

ReportFilters.displayName = "ReportFilters";
