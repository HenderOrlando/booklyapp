"use client";

import { httpClient } from "@/infrastructure/http";
import { config, DataMode } from "@/lib/config";
import { useEffect, useState } from "react";

/**
 * Hook para detectar y gestionar el modo de datos
 *
 * Uso:
 * ```ts
 * const { mode, isMock, isServe } = useDataMode();
 * ```
 *
 * Útil para:
 * - Mostrar indicadores visuales del modo activo
 * - Condicionar comportamientos según el modo
 * - Debug y desarrollo
 */
export function useDataMode() {
  const [mode, setMode] = useState<DataMode>("mock");
  const [isDevelopment, setIsDevelopment] = useState(false);

  useEffect(() => {
    // Detectar modo desde configuración centralizada
    setMode(config.dataMode);

    // Detectar entorno desde configuración centralizada
    setIsDevelopment(config.isDevelopment);
  }, []);

  const isMock = mode === "mock";
  const isServe = mode === "serve";

  return {
    /** Modo actual: 'mock' o 'serve' */
    mode,

    /** true si estamos en Mock Mode */
    isMock,

    /** true si estamos en Serve Mode (backend real) */
    isServe,

    /** true si estamos en desarrollo */
    isDevelopment,

    /** Cliente HTTP unificado (usa el modo automáticamente) */
    httpClient,
  };
}
