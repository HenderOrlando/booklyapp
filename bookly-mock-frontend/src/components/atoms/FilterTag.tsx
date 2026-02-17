import { X } from "lucide-react";
import * as React from "react";

/**
 * FilterTag - Tag de filtro con opción de remover
 *
 * Muestra un filtro aplicado con etiqueta y valor.
 * Permite remover el filtro con un botón X.
 *
 * @component
 * @example
 * ```tsx
 * <FilterTag
 *   label="Categoría"
 *   value="Laboratorios"
 *   onRemove={() => removeFilter('category')}
 *   color="blue"
 * />
 * ```
 */

export interface FilterTagProps {
  label: string;
  value: string;
  onRemove?: () => void;
  color?: "blue" | "green" | "purple" | "orange" | "red" | "gray";
  className?: string;
}

export const FilterTag = React.memo<FilterTagProps>(
  ({ label, value, onRemove, color = "blue", className = "" }) => {
    // Colores disponibles
    const colorClasses = {
      blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      green:
        "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
      purple:
        "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      orange:
        "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800",
      red: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800",
      gray: "bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-inverse)] text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)]",
    };

    return (
      <div
        className={`
          inline-flex items-center gap-2
          px-3 py-1.5
          rounded-full
          border
          text-sm font-medium
          transition-all duration-200
          ${colorClasses[color]}
          ${className}
        `}
      >
        {/* Label y Value */}
        <span className="flex items-center gap-1.5">
          <span className="opacity-70">{label}:</span>
          <span className="font-semibold">{value}</span>
        </span>

        {/* Botón de remover */}
        {onRemove && (
          <button
            onClick={onRemove}
            className="
              inline-flex items-center justify-center
              w-4 h-4
              rounded-full
              hover:bg-black/10 dark:hover:bg-white/10
              transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-1
            "
            aria-label={`Remover filtro ${label}: ${value}`}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }
);

FilterTag.displayName = "FilterTag";
