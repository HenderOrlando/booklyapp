"use client";

import { useDataMode } from "@/hooks/useDataMode";
import { useWebSocket as useManagedWebSocket } from "@/hooks/useWebSocket";
import { config } from "@/lib/config";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

type WebSocketEventHandler<T = unknown> = (payload: T) => void;

interface SocketAdapter {
  on: <T = unknown>(event: string, handler: WebSocketEventHandler<T>) => void;
  off: <T = unknown>(event: string, handler?: WebSocketEventHandler<T>) => void;
  emit: (event: string, payload?: unknown) => void;
}

interface WebSocketContextType {
  socket: SocketAdapter | null;
  isConnected: boolean;
  connectionState: string;
  wsEnabled: boolean;
  subscribe: <T = unknown>(
    event: string,
    handler: WebSocketEventHandler<T>,
  ) => () => void;
  unsubscribe: <T = unknown>(
    event: string,
    handler?: WebSocketEventHandler<T>,
  ) => void;
  connect: () => void;
  disconnect: () => void;
  send: (event: string, payload?: unknown) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
  url?: string;
  enabled?: boolean;
}

export function WebSocketProvider({
  children,
  url = config.wsUrl,
  enabled = true,
}: WebSocketProviderProps) {
  const { wsEnabled } = useDataMode();
  const shouldEnable = enabled && wsEnabled;

  const websocket = useManagedWebSocket({
    url,
    token:
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken") || undefined
        : undefined,
    enabled: shouldEnable,
    autoConnect: shouldEnable,
    reconnect: shouldEnable,
    onConnected: () => {
      if (config.isDevelopment) {
        console.log("[WebSocketProvider] connected");
      }
    },
    onDisconnected: () => {
      if (config.isDevelopment) {
        console.log("[WebSocketProvider] disconnected");
      }
    },
  });

  const subscriptionsRef = useRef<
    Map<string, Map<WebSocketEventHandler<unknown>, () => void>>
  >(new Map());

  const unsubscribe = useCallback(
    <T = unknown,>(event: string, handler?: WebSocketEventHandler<T>) => {
      const eventHandlers = subscriptionsRef.current.get(event);
      if (!eventHandlers) {
        return;
      }

      const typedHandler = handler as
        | WebSocketEventHandler<unknown>
        | undefined;

      if (typedHandler) {
        const cleanup = eventHandlers.get(typedHandler);
        cleanup?.();
        eventHandlers.delete(typedHandler);
      } else {
        eventHandlers.forEach((cleanup) => cleanup());
        eventHandlers.clear();
      }

      if (eventHandlers.size === 0) {
        subscriptionsRef.current.delete(event);
      }
    },
    [],
  );

  const subscribe = useCallback(
    <T = unknown,>(event: string, handler: WebSocketEventHandler<T>) => {
      if (!shouldEnable) {
        return () => {};
      }

      const typedHandler = handler as WebSocketEventHandler<unknown>;

      let eventHandlers = subscriptionsRef.current.get(event);
      if (!eventHandlers) {
        eventHandlers = new Map();
        subscriptionsRef.current.set(event, eventHandlers);
      }

      const cleanup = websocket.subscribe(event, typedHandler);
      eventHandlers.set(typedHandler, cleanup);

      return () => {
        unsubscribe(event, typedHandler);
      };
    },
    [shouldEnable, unsubscribe, websocket],
  );

  const unsubscribeAll = useCallback(() => {
    subscriptionsRef.current.forEach((handlers, event) => {
      handlers.forEach((cleanup) => cleanup());
      subscriptionsRef.current.delete(event);
    });
  }, []);

  useEffect(() => {
    return () => {
      unsubscribeAll();
    };
  }, [unsubscribeAll]);

  const socket = useMemo<SocketAdapter | null>(() => {
    if (!shouldEnable) {
      return null;
    }

    return {
      on: (event, handler) => {
        subscribe(event, handler);
      },
      off: (event, handler) => {
        unsubscribe(event, handler);
      },
      emit: (event, payload) => {
        websocket.send(event, payload);
      },
    };
  }, [shouldEnable, subscribe, unsubscribe, websocket]);

  const contextValue = useMemo<WebSocketContextType>(
    () => ({
      socket,
      isConnected: shouldEnable ? websocket.isConnected : false,
      connectionState: shouldEnable ? websocket.connectionState : "DISABLED",
      wsEnabled: shouldEnable,
      subscribe,
      unsubscribe,
      connect: websocket.connect,
      disconnect: websocket.disconnect,
      send: websocket.send,
    }),
    [shouldEnable, socket, subscribe, unsubscribe, websocket],
  );

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within WebSocketProvider");
  }
  return context;
};

export const useWebSocketContext = useWebSocket;
