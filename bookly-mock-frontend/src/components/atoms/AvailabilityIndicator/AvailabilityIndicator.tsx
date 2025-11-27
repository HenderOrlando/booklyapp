import * as React from "react";

/**
 * AvailabilityIndicator - Atom Component
 *
 * Indicador visual del estado de disponibilidad de un recurso.
 * Muestra un punto de color con texto opcional.
 *
 * Design System:
 * - Punto circular con colores semánticos
 * - Verde: disponible
 * - Rojo: ocupado
 * - Amarillo: parcialmente disponible
 * - Gris: no disponible/fuera de horario
 * - Grid de 8px
 *
 * @example
 * ```tsx
 * <AvailabilityIndicator status="available" showLabel />
 * <AvailabilityIndicator status="occupied" size="lg" />
 * ```
 */

export type AvailabilityStatus =
  | "available"
  | "occupied"
  | "partial"
  | "unavailable";

export interface AvailabilityIndicatorProps {
  /** Estado de disponibilidad */
  status: AvailabilityStatus;
  /** Mostrar label de texto */
  showLabel?: boolean;
  /** Tamaño del indicador */
  size?: "sm" | "md" | "lg";
  /** Clase CSS adicional */
  className?: string;
}

const statusConfig: Record<
  AvailabilityStatus,
  { color: string; bgColor: string; label: string }
> = {
  available: {
    color: "bg-[var(--color-state-success-600)]",
    bgColor: "bg-[var(--color-state-success-100)]",
    label: "Disponible",
  },
  occupied: {
    color: "bg-[var(--color-state-error-600)]",
    bgColor: "bg-[var(--color-state-error-100)]",
    label: "Ocupado",
  },
  partial: {
    color: "bg-[var(--color-state-warning-600)]",
    bgColor: "bg-[var(--color-state-warning-100)]",
    label: "Parcialmente disponible",
  },
  unavailable: {
    color: "bg-gray-400",
    bgColor: "bg-gray-100",
    label: "No disponible",
  },
};

const sizeClasses = {
  sm: "w-2 h-2",
  md: "w-3 h-3",
  lg: "w-4 h-4",
};

export const AvailabilityIndicator = React.memo(function AvailabilityIndicator({
  status,
  showLabel = false,
  size = "md",
  className = "",
}: AvailabilityIndicatorProps) {
  const config = statusConfig[status];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          ${config.color}
          rounded-full
          shadow-sm
        `}
        aria-label={config.label}
        role="status"
      />
      {showLabel && (
        <span className="text-sm text-[var(--color-text-secondary)]">
          {config.label}
        </span>
      )}
    </div>
  );
});
