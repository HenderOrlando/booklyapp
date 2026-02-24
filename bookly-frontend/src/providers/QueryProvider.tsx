/**
 * Query Provider con configuración de React Query
 *
 * Configura el QueryClient con defaults optimizados para Bookly
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { config } from "@/lib/config";
import { useState } from "react";

/**
 * Configuración por defecto del QueryClient
 */
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Configuración global de queries
        staleTime: 1000 * 60 * 5, // 5 minutos por defecto
        gcTime: 1000 * 60 * 30, // 30 minutos en cache
        retry: 2, // Reintentar 2 veces en caso de error
        refetchOnWindowFocus: false, // No refetch al cambiar de pestaña
        refetchOnReconnect: true, // Refetch al reconectar internet
      },
      mutations: {
        // Configuración global de mutations
        retry: 0, // No reintentar mutations automáticamente
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Obtiene el QueryClient (singleton en client, nuevo en SSR)
 */
function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: siempre crea un nuevo query client
    return makeQueryClient();
  } else {
    // Browser: usa singleton
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

/**
 * Provider de React Query para toda la aplicación
 *
 * @example
 * ```typescript
 * // En layout.tsx o _app.tsx
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html>
 *       <body>
 *         <QueryProvider>
 *           {children}
 *         </QueryProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // NOTE: Evita usar useState para el QueryClient en Next.js 13+ App Router
  // Ya que el componente se renderiza en el servidor
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools solo en desarrollo */}
      {config.isDevelopment && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
