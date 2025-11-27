import { CheckCircle, Circle, Clock, XCircle } from "lucide-react";
import * as React from "react";

/**
 * TimelinePoint - Atom Component
 *
 * Punto visual en una línea de tiempo de aprobaciones.
 * Muestra el estado del paso con iconos y colores apropiados.
 *
 * @example
 * ```tsx
 * <TimelinePoint status="completed" />
 * <TimelinePoint status="current" pulse={true} />
 * <TimelinePoint status="pending" />
 * ```
 */

export interface TimelinePointProps {
  /** Estado del punto en la línea de tiempo */
  status: "completed" | "current" | "pending" | "rejected";
  /** Animar con efecto de pulso (para el paso actual) */
  pulse?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

const STATUS_CONFIG = {
  completed: {
    icon: CheckCircle,
    bgColor: "bg-[var(--color-success-base)]",
    textColor: "text-white",
    borderColor: "border-[var(--color-success-base)]",
  },
  current: {
    icon: Clock,
    bgColor: "bg-[var(--color-primary-base)]",
    textColor: "text-white",
    borderColor: "border-[var(--color-primary-base)]",
  },
  pending: {
    icon: Circle,
    bgColor: "bg-gray-200 dark:bg-gray-700",
    textColor: "text-gray-400 dark:text-gray-500",
    borderColor: "border-gray-300 dark:border-gray-600",
  },
  rejected: {
    icon: XCircle,
    bgColor: "bg-[var(--color-error-base)]",
    textColor: "text-white",
    borderColor: "border-[var(--color-error-base)]",
  },
};

export const TimelinePoint = React.memo<TimelinePointProps>(
  ({ status, pulse = false, className = "" }) => {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;

    return (
      <div
        className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 ${config.bgColor} ${config.borderColor} ${className} ${
          pulse && status === "current" ? "animate-pulse" : ""
        }`}
      >
        <Icon className={`h-5 w-5 ${config.textColor}`} aria-hidden="true" />
      </div>
    );
  }
);

TimelinePoint.displayName = "TimelinePoint";
