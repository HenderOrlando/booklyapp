/**
 * LoadingSpinner - Atom Component
 *
 * Spinner de carga reutilizable con diferentes tamaños.
 * Integrado con el Design System.
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="md" />
 * <LoadingSpinner size="lg" className="text-primary-600" />
 * ```
 */

import { Loader2 } from "lucide-react";
import * as React from "react";

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

export const LoadingSpinner = React.memo<LoadingSpinnerProps>(
  ({ size = "md", className = "" }) => {
    return (
      <Loader2
        className={`
          ${sizeClasses[size]}
          animate-spin
          text-primary-600 dark:text-primary-400
          ${className}
        `}
        aria-label="Cargando..."
      />
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";
