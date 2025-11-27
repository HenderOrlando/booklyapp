import { Badge } from "@/components/atoms/Badge";
import * as React from "react";

/**
 * DurationBadge - Atom Component
 *
 * Badge especializado para mostrar duración de tiempo.
 * Formatea automáticamente minutos/horas en texto legible.
 *
 * Design System:
 * - Usa Badge base component
 * - Variante "info" por defecto
 * - Formato inteligente (30 min, 1h, 1h 30min)
 * - Icono de reloj opcional
 *
 * @example
 * ```tsx
 * <DurationBadge minutes={90} />  // "1h 30min"
 * <DurationBadge minutes={30} />  // "30 min"
 * <DurationBadge minutes={120} /> // "2h"
 * ```
 */

export interface DurationBadgeProps {
  /** Duración en minutos */
  minutes: number;
  /** Mostrar icono de reloj */
  showIcon?: boolean;
  /** Variante del badge */
  variant?: "default" | "success" | "warning" | "error" | "secondary";
  /** Clase CSS adicional */
  className?: string;
}

export const DurationBadge = React.memo(function DurationBadge({
  minutes,
  showIcon = true,
  variant = "secondary",
  className = "",
}: DurationBadgeProps) {
  // Formatear duración
  const formatDuration = (totalMinutes: number): string => {
    if (totalMinutes < 60) {
      return `${totalMinutes} min`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    if (mins === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${mins}min`;
  };

  return (
    <Badge variant={variant} className={className}>
      {showIcon && (
        <svg
          className="w-3 h-3 mr-1 inline-block"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )}
      {formatDuration(minutes)}
    </Badge>
  );
});
