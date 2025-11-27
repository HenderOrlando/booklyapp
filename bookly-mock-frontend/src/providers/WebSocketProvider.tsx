/**
 * WebSocketProvider - Proveedor de contexto para WebSocket
 *
 * Proporciona conexión WebSocket global a toda la aplicación
 */

"use client";

import { useWebSocket } from "@/hooks/useWebSocket";
import React, { createContext, useContext } from "react";

interface WebSocketContextValue {
  isConnected: boolean;
  connectionState: string;
  send: (event: string, data?: any) => void;
  subscribe: (event: string, handler: (data: any) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

interface WebSocketProviderProps {
  children: React.ReactNode;
  url?: string;
  enabled?: boolean;
}

export function WebSocketProvider({
  children,
  url = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001",
  enabled = true,
}: WebSocketProviderProps) {
  const websocket = useWebSocket({
    url,
    token:
      typeof window !== "undefined"
        ? localStorage.getItem("token") || undefined
        : undefined,
    autoConnect: enabled,
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

  // Si WebSocket está deshabilitado, proveer mock
  if (!enabled) {
    return (
      <WebSocketContext.Provider
        value={{
          isConnected: false,
          connectionState: "DISABLED",
          send: () => {},
          subscribe: () => () => {},
        }}
      >
        {children}
      </WebSocketContext.Provider>
    );
  }

  return (
    <WebSocketContext.Provider value={websocket}>
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
