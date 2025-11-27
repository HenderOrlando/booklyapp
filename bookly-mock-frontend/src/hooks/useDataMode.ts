"use client";

import { httpClient } from "@/infrastructure/http";
import { DataMode } from "@/lib/config";
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
    // Detectar modo desde configuración (solo en cliente)
    const dataMode = process.env.NEXT_PUBLIC_DATA_MODE || "mock";
    setMode(dataMode as DataMode);

    // Detectar entorno
    setIsDevelopment(process.env.NODE_ENV === "development");
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
