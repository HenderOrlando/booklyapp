"use client";

import { useDataMode } from "@/hooks/useDataMode";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

/**
 * DataModeIndicator — Indicador y switch de modo de datos
 *
 * Solo visible en desarrollo. Muestra:
 * - 🟡 MOCK MODE / 🟢 SERVE MODE (clic para alternar)
 * - � GATEWAY / 🔧 DIRECT (clic para alternar routing)
 *
 * Los cambios se aplican inmediatamente y se persisten en localStorage.
 */
export function DataModeIndicator() {
  const {
    mode,
    isMock,
    isDevelopment,
    useDirectServices,
    setMode,
    setUseDirectServices,
    resetOverrides,
  } = useDataMode();
  const [isVisible, setIsVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setIsVisible(isDevelopment);
  }, [isDevelopment]);

  if (!isVisible) return null;

  const toggleMode = () => {
    setMode(isMock ? "serve" : "mock");
  };

  const toggleDirect = () => {
    setUseDirectServices(!useDirectServices);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-1">
      {/* Expanded panel */}
      {expanded && (
        <div className="rounded-lg border bg-[var(--color-bg-primary)] p-3 shadow-xl text-xs space-y-2 min-w-[220px]">
          <div className="font-semibold text-[var(--color-text-primary)] mb-2">
            Configuración de datos
          </div>

          {/* Mock/Serve toggle */}
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">
              Modo datos
            </span>
            <button
              onClick={toggleMode}
              className={cn(
                "rounded-full px-2.5 py-0.5 font-medium transition-colors",
                isMock
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  : "bg-green-100 text-green-700 hover:bg-green-200",
              )}
            >
              {isMock ? "MOCK" : "SERVER"}
            </button>
          </div>

          {/* Gateway/Direct toggle */}
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">Routing</span>
            <button
              onClick={toggleDirect}
              className={cn(
                "rounded-full px-2.5 py-0.5 font-medium transition-colors",
                useDirectServices
                  ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200",
              )}
            >
              {useDirectServices ? "DIRECTO" : "GATEWAY"}
            </button>
          </div>

          {/* Reset */}
          <button
            onClick={resetOverrides}
            className="w-full rounded px-2 py-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-muted)] transition-colors text-center"
          >
            Resetear a env vars
          </button>
        </div>
      )}

      {/* Main badge */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium shadow-lg transition-colors",
          isMock ? "bg-amber-500 text-white" : "bg-green-500 text-white",
        )}
      >
        <div
          className={cn(
            "h-2 w-2 rounded-full",
            isMock ? "bg-amber-200" : "bg-green-200",
          )}
        />
        <span className="uppercase tracking-wider">{mode}</span>
        <span className="opacity-70">|</span>
        <span className="uppercase tracking-wider text-[10px]">
          {useDirectServices ? "DIRECT" : "GW"}
        </span>
      </button>
    </div>
  );
}
