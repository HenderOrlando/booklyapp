"use client";

import {
  ModeChangeModal,
  type ModeChangeType,
} from "@/components/molecules/ModeChangeModal/ModeChangeModal";
import { useDataMode } from "@/hooks/useDataMode";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

/**
 * DataModeIndicator — Indicador y switch de modo de datos
 *
 * Solo visible en desarrollo. Muestra:
 * - MOCK MODE / SERVE MODE (clic abre modal de confirmación)
 * - GATEWAY / DIRECT (clic abre modal de confirmación)
 *
 * Muestra un modal con resumen de efectos antes de aplicar el cambio.
 * Al confirmar, invalida todo el cache de React Query.
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
  const queryClient = useQueryClient();
  const [isVisible, setIsVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingChangeType, setPendingChangeType] =
    useState<ModeChangeType>("data");
  const [pendingNewMode, setPendingNewMode] = useState(mode);
  const [pendingNewRouting, setPendingNewRouting] = useState(
    useDirectServices ? "direct" : "gateway",
  );

  useEffect(() => {
    setIsVisible(isDevelopment);
  }, [isDevelopment]);

  if (!isVisible) return null;

  const currentRouting = useDirectServices ? "direct" : "gateway";

  const requestModeChange = () => {
    setPendingChangeType("data");
    setPendingNewMode(isMock ? "serve" : "mock");
    setPendingNewRouting(currentRouting);
    setModalOpen(true);
  };

  const requestRoutingChange = () => {
    setPendingChangeType("routing");
    setPendingNewMode(mode);
    setPendingNewRouting(useDirectServices ? "gateway" : "direct");
    setModalOpen(true);
  };

  const confirmChange = () => {
    if (pendingChangeType === "data") {
      setMode(pendingNewMode as any);
    } else {
      setUseDirectServices(pendingNewRouting === "direct");
    }
    // Invalidate ALL React Query caches so data reloads from the new source
    queryClient.clear();
    setModalOpen(false);
    setExpanded(false);
  };

  return (
    <>
      <ModeChangeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmChange}
        changeType={pendingChangeType}
        currentMode={mode}
        newMode={pendingNewMode}
        currentRouting={currentRouting}
        newRouting={pendingNewRouting}
      />

      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-1">
        {/* Expanded panel */}
        {expanded && (
          <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] p-3 shadow-xl text-xs space-y-2 min-w-[220px]">
            <div className="font-semibold text-[var(--color-text-primary)] mb-2">
              Configuración de datos
            </div>

            {/* Mock/Serve toggle */}
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-secondary)]">
                Modo datos
              </span>
              <button
                onClick={requestModeChange}
                className={cn(
                  "rounded-full px-2.5 py-0.5 font-medium transition-colors",
                  isMock
                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300"
                    : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300",
                )}
              >
                {isMock ? "MOCK" : "SERVER"}
              </button>
            </div>

            {/* Gateway/Direct toggle */}
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-secondary)]">
                Routing
              </span>
              <button
                onClick={requestRoutingChange}
                className={cn(
                  "rounded-full px-2.5 py-0.5 font-medium transition-colors",
                  useDirectServices
                    ? "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300",
                )}
              >
                {useDirectServices ? "DIRECTO" : "GATEWAY"}
              </button>
            </div>

            {/* WebSocket status */}
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-secondary)]">
                WebSocket
              </span>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[10px] font-medium",
                  !isMock && !useDirectServices
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-[var(--color-bg-muted)] text-[var(--color-text-tertiary)]",
                )}
              >
                {!isMock && !useDirectServices ? "ACTIVO" : "OFF"}
              </span>
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
              "h-2 w-2 rounded-full animate-pulse",
              isMock ? "bg-amber-200" : "bg-green-200",
            )}
          />
          <span className="uppercase tracking-wider">{mode}</span>
          <span className="opacity-70">|</span>
          <span className="uppercase tracking-wider text-[10px]">
            {useDirectServices ? "DIRECT" : "GW"}
          </span>
          {!isMock && !useDirectServices && (
            <span className="text-[10px] opacity-70">⚡WS</span>
          )}
        </button>
      </div>
    </>
  );
}
