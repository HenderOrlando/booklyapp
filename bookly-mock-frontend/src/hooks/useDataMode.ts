"use client";

import { httpClient } from "@/infrastructure/http";
import { config, DataMode } from "@/lib/config";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

/**
 * Runtime data-mode store.
 * Persists override in localStorage so it survives page navigations (but not
 * full builds — env var always wins on first load if no override is stored).
 */
const STORAGE_KEY_MODE = "bookly_data_mode_override";
const STORAGE_KEY_DIRECT = "bookly_use_direct_services";

let listeners: Array<() => void> = [];

function emitChange() {
  listeners.forEach((l) => l());
}

function getStoredMode(): DataMode {
  if (typeof window === "undefined") return config.dataMode;
  return (
    (localStorage.getItem(STORAGE_KEY_MODE) as DataMode) || config.dataMode
  );
}

function getStoredDirect(): boolean {
  if (typeof window === "undefined") return config.useDirectServices;
  const v = localStorage.getItem(STORAGE_KEY_DIRECT);
  return v !== null ? v === "true" : config.useDirectServices;
}

/**
 * Hook para detectar y gestionar el modo de datos
 *
 * Soporta cambio en runtime vía `setMode` y `setUseDirectServices`.
 * El override se guarda en localStorage y se aplica inmediatamente
 * sobrescribiendo `config.dataMode` y `config.useDirectServices` en memoria.
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

  const mode = useSyncExternalStore(
    (cb) => {
      listeners.push(cb);
      return () => {
        listeners = listeners.filter((l) => l !== cb);
      };
    },
    getStoredMode,
    () => config.dataMode,
  );

  const useDirectServices = useSyncExternalStore(
    (cb) => {
      listeners.push(cb);
      return () => {
        listeners = listeners.filter((l) => l !== cb);
      };
    },
    getStoredDirect,
    () => config.useDirectServices,
  );

  const setMode = useCallback((newMode: DataMode) => {
    localStorage.setItem(STORAGE_KEY_MODE, newMode);
    // Also patch the runtime config so httpClient picks it up immediately
    (config as any).dataMode = newMode;
    emitChange();
  }, []);

  const setUseDirectServices = useCallback((direct: boolean) => {
    localStorage.setItem(STORAGE_KEY_DIRECT, String(direct));
    (config as any).useDirectServices = direct;
    emitChange();
  }, []);

  const resetOverrides = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_MODE);
    localStorage.removeItem(STORAGE_KEY_DIRECT);
    // Restore original env-var values (requires page reload for full effect)
    window.location.reload();
  }, []);

  const isMock = mode === "mock";
  const isServe = mode === "serve";

  return {
    /** Modo actual: 'mock' o 'serve' */
    mode,
    /** Cambiar modo en runtime */
    setMode,
    /** true si estamos en Mock Mode */
    isMock,
    /** true si estamos en Serve Mode (backend real) */
    isServe,
    /** true si usa servicios directos (bypass gateway) */
    useDirectServices,
    /** Cambiar uso de servicios directos en runtime */
    setUseDirectServices,
    /** Resetear overrides y recargar */
    resetOverrides,
    /** true si estamos en desarrollo */
    isDevelopment,
    /** Cliente HTTP unificado (usa el modo automáticamente) */
    httpClient,
  };
}
