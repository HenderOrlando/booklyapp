"use client";

import { useDataMode } from "@/hooks/useDataMode";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

/**
 * Indicador visual del modo de datos (Mock o Serve)
 * Solo visible en desarrollo
 *
 * Muestra un badge flotante indicando:
 * - 🟡 MOCK MODE: Datos simulados (amarillo)
 * - 🟢 SERVE MODE: Backend real (verde)
 */
export function DataModeIndicator() {
  const { mode, isMock, isDevelopment } = useDataMode();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Solo mostrar en desarrollo
    setIsVisible(isDevelopment);
  }, [isDevelopment]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium shadow-lg",
        isMock ? "bg-amber-500 text-white" : "bg-green-500 text-white"
      )}
    >
      <div
        className={cn(
          "h-2 w-2 rounded-full",
          isMock ? "bg-amber-200" : "bg-green-200"
        )}
      />
      <span className="uppercase tracking-wider">{mode} MODE</span>
      <button
        onClick={() => {
          const newMode = isMock ? "serve" : "mock";
          alert(
            `Para cambiar a modo ${newMode.toUpperCase()}, actualiza NEXT_PUBLIC_DATA_MODE=${newMode} en .env.local y reinicia el servidor.`
          );
        }}
        className="ml-1 rounded px-1 hover:bg-black/10"
        title="Clic para ver cómo cambiar de modo"
      >
        ?
      </button>
    </div>
  );
}
