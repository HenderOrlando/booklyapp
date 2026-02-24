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
      blue: "bg-[var(--color-state-info-bg)] text-[var(--color-state-info-text)] border-[var(--color-state-info-border)]",
      green:
        "bg-[var(--color-state-success-bg)] text-[var(--color-state-success-text)] border-[var(--color-state-success-border)]",
      purple:
        "bg-[var(--color-bg-muted)] text-[var(--color-action-secondary)] border-[var(--color-action-secondary)]",
      orange:
        "bg-[var(--color-state-warning-bg)] text-[var(--color-state-warning-text)] border-[var(--color-state-warning-border)]",
      red: "bg-[var(--color-state-error-bg)] text-[var(--color-state-error-text)] border-[var(--color-state-error-border)]",
      gray: "bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] border-[var(--color-border-subtle)]",
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
              hover:bg-[var(--color-action-ghost-hover)]
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
  },
);

FilterTag.displayName = "FilterTag";
