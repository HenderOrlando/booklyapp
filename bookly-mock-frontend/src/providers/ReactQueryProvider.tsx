/**
 * ReactQueryProvider - Provider configurado con DevTools
 *
 * Configuración global de React Query con DevTools para desarrollo
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { config } from "@/lib/config";
import * as React from "react";

// Configuración del QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo que los datos se consideran "frescos"
      staleTime: 1000 * 60 * 5, // 5 minutos por defecto

      // Tiempo que los datos se mantienen en cache sin usar
      gcTime: 1000 * 60 * 30, // 30 minutos (antes cacheTime)

      // Refetch automático
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,

      // Retry
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry para mutations
      retry: false,

      // Tiempo de garbage collection para mutations
      gcTime: 1000 * 60 * 5, // 5 minutos
    },
  },
});

interface ReactQueryProviderProps {
  children: React.ReactNode;
}

/**
 * Provider de React Query con DevTools
 *
 * @example
 * ```typescript
 * <ReactQueryProvider>
 *   <App />
 * </ReactQueryProvider>
 * ```
 */
export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools solo en desarrollo */}
      {config.isDevelopment && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom" />
      )}
    </QueryClientProvider>
  );
}

// Export del queryClient para uso directo si es necesario
export { queryClient };
