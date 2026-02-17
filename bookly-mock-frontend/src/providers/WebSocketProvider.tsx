/**
 * WebSocketProvider - Proveedor de contexto para WebSocket
 *
 * Proporciona conexión WebSocket global a toda la aplicación
 */

"use client";

import { useDataMode } from "@/hooks/useDataMode";
import { useWebSocket } from "@/hooks/useWebSocket";
import { config } from "@/lib/config";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

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
  const { isMock, useDirectServices } = useDataMode();

  // WebSocket only enabled when: serve mode + gateway routing + feature flag on
  const shouldEnable = enabled && !isMock && !useDirectServices;

  const websocket = useWebSocket({
    url,
    token:
      typeof window !== "undefined"
        ? localStorage.getItem("token") || undefined
        : undefined,
    autoConnect: shouldEnable,
    reconnect: shouldEnable,
    onConnected: () => {
      console.log("[WebSocketProvider] Conectado al servidor (serve+gateway)");
    },
    onDisconnected: () => {
      console.log("[WebSocketProvider] Desconectado del servidor");
    },
    onError: (error) => {
      console.error("[WebSocketProvider] Error:", error);
    },
  });

  // Disconnect when mode changes away from serve+gateway
  const prevShouldEnable = useRef(shouldEnable);
  useEffect(() => {
    if (prevShouldEnable.current && !shouldEnable) {
      console.log("[WebSocketProvider] Modo cambió — desconectando WebSocket");
      websocket.disconnect();
    } else if (!prevShouldEnable.current && shouldEnable) {
      console.log(
        "[WebSocketProvider] Modo serve+gateway — conectando WebSocket",
      );
      websocket.connect();
    }
    prevShouldEnable.current = shouldEnable;
  }, [shouldEnable, websocket]);

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
      "useWebSocketContext must be used within WebSocketProvider",
    );
  }
  return context;
}
