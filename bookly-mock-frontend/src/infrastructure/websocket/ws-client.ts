/**
 * WebSocketClient - Cliente WebSocket para comunicación en tiempo real
 *
 * Características:
 * - Reconexión automática con exponential backoff
 * - Heartbeat para mantener conexión activa
 * - Sistema de eventos tipado
 * - Auto-reintento en caso de desconexión
 * - Gestión de estado de conexión
 */

import { io, type Socket } from "socket.io-client";
import { wsEvents, type WSEventHandler } from "./ws-events";

type ConnectionState =
  | "CONNECTING"
  | "CONNECTED"
  | "DISCONNECTED"
  | "RECONNECTING"
  | "ERROR";

interface WebSocketClientConfig {
  url: string;
  token?: string;
  reconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
}

interface QueuedMessage {
  event: string;
  data?: unknown;
}

interface CrudEventPayload {
  type?: string;
  data?: unknown;
}

const GATEWAY_WS_NAMESPACE = "/api/v1/ws";

export class WebSocketClient {
  private socket: Socket | null = null;
  private config: Required<WebSocketClientConfig>;
  private readonly reconnectByDefault: boolean;
  private state: ConnectionState = "DISCONNECTED";
  private reconnectAttempts = 0;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private eventHandlers: Map<string, Set<WSEventHandler>> = new Map();
  private messageQueue: QueuedMessage[] = [];

  constructor(config: WebSocketClientConfig) {
    this.reconnectByDefault = config.reconnect ?? true;
    this.config = {
      url: config.url,
      token: config.token || "",
      reconnect: this.reconnectByDefault,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 5,
      reconnectDelay: config.reconnectDelay ?? 1000,
      heartbeatInterval: config.heartbeatInterval ?? 30000,
    };
  }

  /**
   * Conectar al servidor WebSocket
   */
  connect(): void {
    if (
      this.socket &&
      (this.state === "CONNECTED" ||
        this.state === "CONNECTING" ||
        this.state === "RECONNECTING")
    ) {
      console.warn("[WebSocket] Ya está conectado");
      return;
    }

    this.config.reconnect = this.reconnectByDefault;
    this.cancelReconnect();
    this.setState("CONNECTING");
    console.log("[WebSocket] Conectando...");

    try {
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
        this.socket = null;
      }

      const url = this.buildConnectionUrl();

      this.socket = io(url, {
        autoConnect: false,
        transports: ["websocket"],
        reconnection: false,
        auth: this.config.token ? { token: this.config.token } : undefined,
      });

      this.socket.on("connect", this.handleOpen.bind(this));
      this.socket.on("disconnect", this.handleClose.bind(this));
      this.socket.on("connect_error", this.handleError.bind(this));
      this.socket.onAny((event, data) => {
        this.handleIncomingEvent(event, data);
      });

      this.socket.connect();
    } catch (error) {
      console.error("[WebSocket] Error al conectar:", error);
      this.setState("ERROR");
      this.scheduleReconnect();
    }
  }

  /**
   * Desconectar del servidor
   */
  disconnect(): void {
    console.log("[WebSocket] Desconectando...");
    this.config.reconnect = false; // Desactivar reconexión automática
    this.stopHeartbeat();
    this.cancelReconnect();

    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.setState("DISCONNECTED");
  }

  /**
   * Enviar mensaje al servidor
   */
  send(event: string, data?: unknown): void {
    if (this.state !== "CONNECTED" || !this.socket) {
      console.warn("[WebSocket] No conectado, encolando mensaje");
      this.messageQueue.push({ event, data });
      return;
    }

    try {
      this.socket.emit(event, data);
      console.log(`[WebSocket] Enviado: ${event}`, data);
    } catch (error) {
      console.error("[WebSocket] Error al enviar:", error);
      this.messageQueue.push({ event, data });
    }
  }

  /**
   * Suscribirse a un evento
   */
  on(event: string, handler: WSEventHandler): () => void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }

    this.eventHandlers.get(event)!.add(handler);
    console.log(`[WebSocket] Suscrito a evento: ${event}`);

    // Retornar función para desuscribirse
    return () => this.off(event, handler);
  }

  /**
   * Desuscribirse de un evento
   */
  off(event: string, handler: WSEventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
      console.log(`[WebSocket] Desuscrito de evento: ${event}`);
    }
  }

  /**
   * Obtener estado de conexión
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * Verificar si está conectado
   */
  isConnected(): boolean {
    return this.state === "CONNECTED" && this.socket?.connected === true;
  }

  // ==================== Métodos Privados ====================

  private buildConnectionUrl(): string {
    const { url } = this.config;
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      return `http://localhost:3000${GATEWAY_WS_NAMESPACE}`;
    }

    const [withoutQuery] = trimmedUrl.split("?");
    const normalized = withoutQuery.replace(/\/+$/, "");

    if (normalized.endsWith(GATEWAY_WS_NAMESPACE)) {
      return normalized;
    }

    return `${normalized}${GATEWAY_WS_NAMESPACE}`;
  }

  private normalizeEventName(eventName: string): string {
    return eventName.replace(/\./g, ":");
  }

  private handleIncomingEvent(eventName: string, data: unknown): void {
    if (
      eventName === "crud-event" &&
      typeof data === "object" &&
      data !== null
    ) {
      const payload = data as CrudEventPayload;

      if (typeof payload.type === "string") {
        const normalizedCrudEvent = this.normalizeEventName(payload.type);
        this.emit(normalizedCrudEvent, payload.data ?? data);
        return;
      }
    }

    this.emit(eventName, data);

    const normalized = this.normalizeEventName(eventName);
    if (normalized !== eventName) {
      this.emit(normalized, data);
    }
  }

  private setState(newState: ConnectionState): void {
    const oldState = this.state;
    this.state = newState;
    console.log(`[WebSocket] Estado: ${oldState} → ${newState}`);
    this.emit(wsEvents.connection.stateChange, { oldState, newState });
  }

  private handleOpen(): void {
    console.log("[WebSocket] Conectado exitosamente");
    this.setState("CONNECTED");
    this.reconnectAttempts = 0;
    this.startHeartbeat();
    this.flushMessageQueue();
    this.emit(wsEvents.connection.connected, null);
  }

  private handleError(error: Error): void {
    console.error("[WebSocket] Error de conexión:", error);
    this.setState("ERROR");
    this.emit(wsEvents.connection.error, {
      error: error.message || "Connection error",
    });

    this.scheduleReconnect();
  }

  private handleClose(reason: string): void {
    const closeCode = reason === "io client disconnect" ? 1000 : 1006;

    console.log(`[WebSocket] Desconectado: ${closeCode} - ${reason}`);
    this.stopHeartbeat();
    this.setState("DISCONNECTED");
    this.emit(wsEvents.connection.disconnected, {
      code: closeCode,
      reason,
    });

    if (this.config.reconnect && reason !== "io client disconnect") {
      this.scheduleReconnect();
    }
  }

  private emit(event: string, data: unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[WebSocket] Error en handler de ${event}:`, error);
        }
      });
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.send(wsEvents.heartbeat.ping);
      } else {
        this.stopHeartbeat();
        this.scheduleReconnect();
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (!this.config.reconnect) return;

    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error("[WebSocket] Máximo de reintentos alcanzado");
      this.setState("ERROR");
      this.emit(wsEvents.connection.maxReconnectFailed, {
        attempts: this.reconnectAttempts,
      });
      return;
    }

    this.cancelReconnect();
    this.setState("RECONNECTING");

    const delay =
      this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    console.log(
      `[WebSocket] Reintentando conexión en ${delay}ms (intento ${this.reconnectAttempts + 1}/${this.config.maxReconnectAttempts})`,
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }

  private cancelReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private flushMessageQueue(): void {
    if (this.messageQueue.length === 0) return;

    console.log(
      `[WebSocket] Enviando ${this.messageQueue.length} mensajes encolados`,
    );

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && this.socket) {
        try {
          this.socket.emit(message.event, message.data);
        } catch (error) {
          console.error("[WebSocket] Error al enviar mensaje encolado:", error);
          this.messageQueue.unshift(message); // Volver a encolar
          break;
        }
      }
    }
  }
}
