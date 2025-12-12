/**
 * WebSocketProvider - Proveedor de contexto para WebSocket
 *
 * Proporciona conexión WebSocket global a toda la aplicación
 */

"use client";

import { useWebSocket } from "@/hooks/useWebSocket";
import { config, isMockMode } from "@/lib/config";
import React, { createContext, useContext, useMemo } from "react";

interface WebSocketContextValue {
  isConnected: boolean;
  connectionState: string;
  send: (event: string, data?: any) => void;
  subscribe: (event: string, handler: (data: any) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

const DISABLED_CONTEXT: WebSocketContextValue = {
  isConnected: false,
  connectionState: "DISABLED",
  send: () => {},
  subscribe: () => () => {},
};

interface WebSocketProviderProps {
  children: React.ReactNode;
  url?: string;
  enabled?: boolean;
}

export function WebSocketProvider({
  children,
  url = config.wsUrl,
  enabled = true,
}: WebSocketProviderProps) {
  // Desactivar WebSocket en modo mock o si está explícitamente deshabilitado
  const shouldEnable = enabled && !isMockMode() && config.features.enableWebSocket;

  const websocket = useWebSocket({
    url,
    token:
      typeof window !== "undefined"
        ? localStorage.getItem("token") || undefined
        : undefined,
    autoConnect: shouldEnable,
    reconnect: shouldEnable, // No reconectar si está deshabilitado
    onConnected: () => {
      console.log("[WebSocketProvider] Conectado al servidor");
    },
    onDisconnected: () => {
      console.log("[WebSocketProvider] Desconectado del servidor");
    },
    onError: (error) => {
      console.error("[WebSocketProvider] Error:", error);
    },
  });

  // Usar contexto deshabilitado si WebSocket no está activo
  const contextValue = useMemo(() => {
    if (!shouldEnable) {
      return DISABLED_CONTEXT;
    }
    return websocket;
  }, [shouldEnable, websocket]);

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

/**
 * Hook para acceder al contexto de WebSocket
 */
export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocketContext must be used within WebSocketProvider"
    );
  }
  return context;
}
