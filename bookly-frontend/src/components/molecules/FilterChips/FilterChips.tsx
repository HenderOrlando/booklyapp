import { Badge } from "@/components/atoms/Badge";
import React from "react";

/**
 * FilterChips - Molecule Component
 *
 * Muestra chips de filtros activos con opción de eliminar individual o todos.
 * Útil en páginas de listado para visualizar filtros aplicados.
 *
 * Design System:
 * - Usa Badge component con variant secondary
 * - Botón X con hover state accesible
 * - Botón "Limpiar todo" cuando hay múltiples filtros
 * - Spacing en múltiplos de 4px (gap-2)
 *
 * @example
 * ```tsx
 * <FilterChips
 *   filters={[
 *     { key: 'status', label: 'Estado', value: 'Activo' },
 *     { key: 'category', label: 'Categoría', value: 'Sala' }
 *   ]}
 *   onRemove={(key) => removeFilter(key)}
 *   onClearAll={() => clearAllFilters()}
 * />
 * ```
 */

export interface FilterChip {
  /** Clave única del filtro */
  key: string;
  /** Etiqueta del filtro (ej: "Estado", "Tipo") */
  label: string;
  /** Valor del filtro (ej: "Activo", "Sala") */
  value: string | number;
  /** Variante del badge (opcional) */
  variant?: "default" | "secondary" | "outline";
}

export interface FilterChipsProps {
  /** Array de filtros activos */
  filters: FilterChip[];
  /** Callback al eliminar un filtro individual */
  onRemove: (key: string) => void;
  /** Callback al limpiar todos los filtros (opcional) */
  onClearAll?: () => void;
  /** Texto del botón limpiar todo */
  clearAllText?: string;
  /** Mostrar botón limpiar todo cuando hay múltiples filtros */
  showClearAll?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

export const FilterChips = React.memo(function FilterChips({
  filters,
  onRemove,
  onClearAll,
  clearAllText = "Limpiar todo",
  showClearAll = true,
  className = "",
}: FilterChipsProps) {
  if (filters.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-[var(--color-text-secondary)]">
        Filtros activos:
      </span>

      {filters.map((filter) => (
        <Badge
          key={filter.key}
          variant={filter.variant || "secondary"}
          className="flex items-center gap-2 pr-1"
        >
          <span>
            <span className="font-medium">{filter.label}:</span> {filter.value}
          </span>
          <button
            onClick={() => onRemove(filter.key)}
            className="ml-1 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            aria-label={`Eliminar filtro ${filter.label}`}
            type="button"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </Badge>
      ))}

      {showClearAll && filters.length > 1 && onClearAll && (
        <button
          onClick={onClearAll}
          className="text-sm font-medium text-[var(--color-action-primary)] hover:text-[var(--color-action-primary-hover)] transition-colors"
          type="button"
        >
          {clearAllText}
        </button>
      )}
    </div>
  );
});
