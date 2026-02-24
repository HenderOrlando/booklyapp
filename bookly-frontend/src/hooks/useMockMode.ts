"use client";

import { useDataMode } from "@/hooks/useDataMode";
import { MockService } from "@/infrastructure/mock/mockService";

/**
 * Hook para detectar y gestionar el modo Mock
 * Útil para mostrar indicadores UI cuando estamos en modo de desarrollo
 */
export function useMockMode() {
  const { isMock, mode } = useDataMode();

  /**
   * Ejecuta una petición en mock o real según el modo
   */
  const request = async <T>(
    endpoint: string,
    method: string = "GET",
    data?: unknown,
  ) => {
    if (isMock) {
      return await MockService.mockRequest<T>(endpoint, method, data);
    }

    // En modo 'serve', hacer petición real al backend
    throw new Error("Modo 'serve' no implementado aún. Usa Mock Mode.");
  };

  return {
    isMock,
    request,
    mode,
  };
}
