"use client";

import {
  ModeChangeModal,
  type ModeChangeType,
} from "@/components/molecules/ModeChangeModal/ModeChangeModal";
import { useDataMode } from "@/hooks/useDataMode";
import type { DataMode } from "@/lib/config";
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
    dataMode,
    isMock,
    isDevelopment,
    wsEnabled,
    source,
    useDirectServices,
    setMode,
    setRoutingMode,
    resetOverrides,
  } = useDataMode();
  const queryClient = useQueryClient();
  const [isVisible, setIsVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingChangeType, setPendingChangeType] =
    useState<ModeChangeType>("data");
  const [pendingNewMode, setPendingNewMode] = useState<DataMode>(mode);
  const [pendingNewRouting, setPendingNewRouting] = useState(
    useDirectServices ? "direct" : "gateway",
  );

  useEffect(() => {
    setIsVisible(isDevelopment);
  }, [isDevelopment]);

  if (!isVisible) return null;

  const currentRouting = useDirectServices ? "direct" : "gateway";
  const routingLabel = isMock
    ? "N/A"
    : useDirectServices
      ? "DIRECTO"
      : "GATEWAY";

  const handleResetToEnv = () => {
    resetOverrides();
    queryClient.clear();
    setExpanded(false);
  };

  const requestModeChange = () => {
    setPendingChangeType("data");
    setPendingNewMode(isMock ? "serve" : "mock");
    setPendingNewRouting(currentRouting);
    setModalOpen(true);
  };

  const requestRoutingChange = () => {
    if (isMock) {
      return;
    }

    setPendingChangeType("routing");
    setPendingNewMode(mode);
    setPendingNewRouting(useDirectServices ? "gateway" : "direct");
    setModalOpen(true);
  };

  const confirmChange = () => {
    if (pendingChangeType === "data") {
      setMode(pendingNewMode);
    } else {
      setRoutingMode(pendingNewRouting === "direct" ? "DIRECTO" : "GATEWAY");
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
          <div
            data-testid="data-config-panel"
            className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-primary)] p-3 shadow-xl text-xs space-y-2 min-w-[220px]"
          >
            <div className="font-semibold text-[var(--color-text-primary)] mb-2">
              Configuración de datos
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-secondary)]">Fuente</span>
              <span className="rounded-full border border-[var(--color-border-subtle)] px-2 py-0.5 text-[10px] uppercase text-[var(--color-text-tertiary)]">
                {source}
              </span>
            </div>

            {/* Mock/Serve toggle */}
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-secondary)]">
                Modo datos
              </span>
              <button
                data-testid="data-config-mode-btn"
                onClick={requestModeChange}
                className={cn(
                  "rounded-full px-2.5 py-0.5 font-medium transition-colors",
                  isMock
                    ? "bg-[var(--color-state-warning-bg)] text-[var(--color-state-warning-text)]"
                    : "bg-[var(--color-state-success-bg)] text-[var(--color-state-success-text)]",
                )}
              >
                {dataMode}
              </button>
            </div>

            {/* Gateway/Direct toggle */}
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-secondary)]">
                Routing
              </span>
              <button
                data-testid="data-config-routing-btn"
                onClick={requestRoutingChange}
                disabled={isMock}
                className={cn(
                  "rounded-full px-2.5 py-0.5 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                  isMock
                    ? "bg-[var(--color-bg-muted)] text-[var(--color-text-tertiary)]"
                    : useDirectServices
                      ? "bg-[var(--color-state-warning-bg)] text-[var(--color-state-warning-text)]"
                      : "bg-[var(--color-state-info-bg)] text-[var(--color-state-info-text)]",
                )}
              >
                {routingLabel}
              </button>
            </div>

            {/* WebSocket status */}
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-text-secondary)]">
                WebSocket
              </span>
              <span
                data-testid="data-config-ws-status"
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-[10px] font-medium",
                  wsEnabled
                    ? "bg-[var(--color-state-success-bg)] text-[var(--color-state-success-text)]"
                    : "bg-[var(--color-bg-muted)] text-[var(--color-text-tertiary)]",
                )}
              >
                {wsEnabled ? "ACTIVO" : "INACTIVO"}
              </span>
            </div>

            {/* Reset */}
            <button
              data-testid="data-config-reset-btn"
              onClick={handleResetToEnv}
              className="w-full rounded px-2 py-1 text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-muted)] transition-colors text-center"
            >
              Resetear a env vars
            </button>
          </div>
        )}

        {/* Main badge */}
        <button
          data-testid="data-config-toggle"
          onClick={() => setExpanded(!expanded)}
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium shadow-lg transition-colors",
            isMock
              ? "bg-[var(--color-state-warning-border)] text-[var(--color-text-primary)]"
              : "bg-[var(--color-action-primary)] text-[var(--color-text-inverse)]",
          )}
        >
          <div
            className={cn(
              "h-2 w-2 rounded-full animate-pulse",
              isMock
                ? "bg-[var(--color-state-warning-text)]"
                : "bg-[var(--color-state-success-border)]",
            )}
          />
          <span className="uppercase tracking-wider">{dataMode}</span>
          <span className="opacity-70">|</span>
          <span className="uppercase tracking-wider text-[10px]">
            {isMock ? "N/A" : useDirectServices ? "DIRECT" : "GW"}
          </span>
          {wsEnabled && <span className="text-[10px] opacity-70">⚡WS</span>}
        </button>
      </div>
    </>
  );
}
