"use client";

import { Badge } from "@/components/atoms/Badge";
import { useMockMode } from "@/hooks/useMockMode";
import * as React from "react";

/**
 * Indicador Visual de Mock Mode
 *
 * Muestra un badge flotante cuando la aplicación está en modo mock
 * Útil para desarrolladores y testing
 *
 * Siguiendo el sistema de diseño Bookly
 */
export function MockModeIndicator() {
  const { isMock, mode: _mode } = useMockMode();
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Solo mostrar en mock mode y después de montar
    setIsVisible(isMock);
  }, [isMock]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 animate-in fade-in slide-in-from-bottom-2">
      <Badge
        variant="warning"
        className="px-3 py-2 shadow-lg cursor-pointer hover:scale-105 transition-transform"
        onClick={() => setIsVisible(false)}
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-4 h-4 animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="font-semibold">🧪 MOCK MODE</span>
          <span className="text-xs opacity-75">(Click para ocultar)</span>
        </span>
      </Badge>

      <div className="mt-2 text-xs text-[var(--color-text-secondary)] bg-[var(--color-bg-surface)] px-3 py-2 rounded-md shadow-md border border-[var(--color-border-subtle)]">
        <p className="font-semibold mb-1">Modo de Desarrollo</p>
        <p>Usando datos simulados sin conexión al backend</p>
        <p className="mt-1 text-[10px] opacity-60">
          Cambiar a modo &apos;serve&apos; en .env.local
        </p>
      </div>
    </div>
  );
}
