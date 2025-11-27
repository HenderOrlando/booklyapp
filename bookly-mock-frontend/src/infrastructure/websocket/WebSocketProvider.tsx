"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  subscribe: (channels: string[]) => void;
  unsubscribe: (channels: string[]) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Por ahora solo inicializar sin conectar
    // La conexión se hará después del login
    const socketInstance = io(process.env.NEXT_PUBLIC_WS_URL || "", {
      path: "/api/v1/ws",
      autoConnect: false, // No conectar automáticamente
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("[WebSocket] Connected");
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("[WebSocket] Disconnected");
    });

    socketInstance.on("connect_error", (error) => {
      console.error("[WebSocket] Connection error:", error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const subscribe = (channels: string[]) => {
    if (socket && isConnected) {
      socket.emit("subscribe", { channels });
      console.log("[WebSocket] Subscribed to channels:", channels);
    }
  };

  const unsubscribe = (channels: string[]) => {
    if (socket && isConnected) {
      socket.emit("unsubscribe", { channels });
      console.log("[WebSocket] Unsubscribed from channels:", channels);
    }
  };

  return (
    <WebSocketContext.Provider
      value={{
        socket,
        isConnected,
        subscribe,
        unsubscribe,
      }}
    >
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
