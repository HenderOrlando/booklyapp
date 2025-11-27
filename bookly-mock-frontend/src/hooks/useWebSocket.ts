/**
 * useWebSocket - Hook para manejar conexión WebSocket
 *
 * ✅ TODOs IMPLEMENTADOS:
 * - Reconnection automática con exponential backoff
 * - Heartbeat para detectar desconexiones (30s)
 * - Queue de mensajes offline (hasta 100 mensajes)
 *
 * Proporciona:
 * - Conexión automática al montar
 * - Desconexión automática al desmontar
 * - Estado de conexión reactivo
 * - Suscripción fácil a eventos
 * - Integración con React Query para invalidar cache
 */

"use client";

import { WebSocketClient } from "@/infrastructure/websocket/ws-client";
import {
  wsEvents,
  type WSEventHandler,
} from "@/infrastructure/websocket/ws-events";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseWebSocketOptions {
  url: string;
  token?: string;
  autoConnect?: boolean;
  reconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: any) => void;
  onReconnecting?: (attempt: number) => void;
}

export function useWebSocket(options: UseWebSocketOptions) {
  const {
    url,
    token,
    autoConnect = true,
    reconnect = true,
    maxReconnectAttempts = 5,
    reconnectDelay = 1000,
    heartbeatInterval = 30000,
    onConnected,
    onDisconnected,
    onError,
    onReconnecting,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] =
    useState<string>("DISCONNECTED");
  const clientRef = useRef<WebSocketClient | null>(null);
  const queryClient = useQueryClient();

  // Inicializar cliente
  useEffect(() => {
    const client = new WebSocketClient({
      url,
      token,
      reconnect,
      maxReconnectAttempts,
      reconnectDelay,
      heartbeatInterval,
    });

    clientRef.current = client;

    // Eventos de conexión
    client.on(wsEvents.connection.connected, () => {
      setIsConnected(true);
      setConnectionState("CONNECTED");
      onConnected?.();
    });

    client.on(wsEvents.connection.disconnected, () => {
      setIsConnected(false);
      setConnectionState("DISCONNECTED");
      onDisconnected?.();
    });

    client.on(wsEvents.connection.error, (error) => {
      setConnectionState("ERROR");
      onError?.(error);
    });

    client.on(wsEvents.connection.stateChange, ({ newState }) => {
      setConnectionState(newState);

      // Notificar cuando está reconectando
      if (newState === "RECONNECTING" || newState === "CONNECTING") {
        const attemptMatch = newState.match(/(\d+)/);
        const attempt = attemptMatch ? parseInt(attemptMatch[1]) : 1;
        onReconnecting?.(attempt);
      }
    });

    // Eventos de dominio que invalidan cache de React Query
    client.on(wsEvents.reservation.created, () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    });

    client.on(wsEvents.reservation.updated, () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    });

    client.on(wsEvents.reservation.cancelled, () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    });

    client.on(wsEvents.resource.updated, () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    });

    client.on(wsEvents.notification.new, () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    });

    // Conectar automáticamente si está habilitado
    if (autoConnect) {
      client.connect();
    }

    // Cleanup al desmontar
    return () => {
      client.disconnect();
    };
  }, [
    url,
    token,
    autoConnect,
    queryClient,
    onConnected,
    onDisconnected,
    onError,
  ]);

  // Método para enviar mensajes
  const send = useCallback((event: string, data?: any) => {
    clientRef.current?.send(event, data);
  }, []);

  // Método para suscribirse a eventos
  const subscribe = useCallback(
    (event: string, handler: WSEventHandler): (() => void) => {
      if (!clientRef.current) {
        console.warn("[useWebSocket] Cliente no inicializado");
        return () => {};
      }
      return clientRef.current.on(event, handler);
    },
    []
  );

  // Métodos de conexión manual
  const connect = useCallback(() => {
    clientRef.current?.connect();
  }, []);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
  }, []);

  return {
    isConnected,
    connectionState,
    send,
    subscribe,
    connect,
    disconnect,
  };
}
