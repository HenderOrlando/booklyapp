/**
 * LoadingState - Molecule Component
 *
 * Estado de carga con spinner y mensaje opcional.
 * Usado para mostrar estados de carga en acciones específicas.
 *
 * @example
 * ```tsx
 * <LoadingState message="Guardando cambios..." />
 * <LoadingState size="lg" message="Cargando recursos..." fullScreen />
 * ```
 */

import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import * as React from "react";

export interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg" | "xl";
  fullScreen?: boolean;
  className?: string;
}

export const LoadingState = React.memo<LoadingStateProps>(
  ({ message, size = "md", fullScreen = false, className = "" }) => {
    const content = (
      <div className="flex flex-col items-center justify-center gap-3">
        <LoadingSpinner size={size} />
        {message && (
          <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
            {message}
          </p>
        )}
      </div>
    );

    if (fullScreen) {
      return (
        <div
          className={`
            fixed inset-0 z-50
            bg-white/80 dark:bg-gray-900/80
            backdrop-blur-sm
            flex items-center justify-center
            ${className}
          `}
        >
          {content}
        </div>
      );
    }

    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        {content}
      </div>
    );
  }
);

LoadingState.displayName = "LoadingState";
