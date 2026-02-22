"use client";

import { httpClient } from "@/infrastructure/http";
import { config, type DataMode } from "@/lib/config";
import {
  dataConfigStore,
  toLegacyDataMode,
  toRuntimeDataMode,
  type RuntimeDataMode,
  type RuntimeRoutingMode,
} from "@/lib/data-config";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

/**
 * Hook para detectar y gestionar el modo de datos
 *
 * Soporta cambio en runtime vía `setMode` y `setUseDirectServices`.
 * El override se guarda en localStorage dentro de un store centralizado,
 * manteniendo derivaciones consistentes (`wsEnabled`, `source`).
 *
 * Uso:
 * ```ts
 * const { mode, isMock, isServe, setMode, useDirectServices, setUseDirectServices } = useDataMode();
 * ```
 */
export function useDataMode() {
  const [isDevelopment, setIsDevelopment] = useState(false);

  useEffect(() => {
    setIsDevelopment(config.isDevelopment);
  }, []);

  const snapshot = useSyncExternalStore(
    dataConfigStore.subscribe,
    dataConfigStore.getSnapshot,
    dataConfigStore.getSnapshot,
  );

  const mode = toLegacyDataMode(snapshot.dataMode);
  const isMock = snapshot.dataMode === "MOCK";
  const isServe = snapshot.dataMode === "SERVER";
  const useDirectServices = snapshot.useDirectServices;

  const setMode = useCallback((newMode: DataMode | RuntimeDataMode) => {
    dataConfigStore.setDataMode(toRuntimeDataMode(newMode));
  }, []);

  const setRoutingMode = useCallback((routingMode: RuntimeRoutingMode) => {
    dataConfigStore.setRoutingMode(routingMode);
  }, []);

  const setUseDirectServices = useCallback((direct: boolean) => {
    dataConfigStore.setUseDirectServices(direct);
  }, []);

  const resetOverrides = useCallback(() => {
    dataConfigStore.resetToEnv();
  }, []);

  const displayRoutingMode: RuntimeRoutingMode | "N/A" = isMock
    ? "N/A"
    : snapshot.routingMode;

  return {
    /** Modo actual: 'mock' o 'serve' */
    mode,
    /** Modo actual en formato runtime */
    dataMode: snapshot.dataMode,
    /** Routing derivado en formato runtime (o N/A en MOCK) */
    routingMode: displayRoutingMode,
    /** true si WebSocket debe estar activo (SERVER+GATEWAY+feature flag) */
    wsEnabled: snapshot.wsEnabled,
    /** Fuente de configuración: env u override */
    source: snapshot.source,
    /** Cambiar modo en runtime */
    setMode,
    /** Cambiar routing runtime (DIRECTO/GATEWAY) */
    setRoutingMode,
    /** true si estamos en Mock Mode */
    isMock,
    /** true si estamos en Serve Mode (backend real) */
    isServe,
    /** true si usa servicios directos (bypass gateway) */
    useDirectServices,
    /** Cambiar uso de servicios directos en runtime */
    setUseDirectServices,
    /** Resetear overrides y volver al valor de env vars */
    resetOverrides,
    /** true si estamos en desarrollo */
    isDevelopment,
    /** Cliente HTTP unificado (usa el modo automáticamente) */
    httpClient,
  };
}
