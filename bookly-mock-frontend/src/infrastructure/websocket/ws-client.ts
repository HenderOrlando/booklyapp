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

import { wsEvents, type WSEvent, type WSEventHandler } from "./ws-events";

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

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketClientConfig>;
  private state: ConnectionState = "DISCONNECTED";
  private reconnectAttempts = 0;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private eventHandlers: Map<string, Set<WSEventHandler>> = new Map();
  private messageQueue: string[] = [];

  constructor(config: WebSocketClientConfig) {
    this.config = {
      url: config.url,
      token: config.token || "",
      reconnect: config.reconnect ?? true,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 5,
      reconnectDelay: config.reconnectDelay ?? 1000,
      heartbeatInterval: config.heartbeatInterval ?? 30000,
    };
  }

  /**
   * Conectar al servidor WebSocket
   */
  connect(): void {
    if (this.ws && this.state === "CONNECTED") {
      console.warn("[WebSocket] Ya está conectado");
      return;
    }

    this.setState("CONNECTING");
    console.log("[WebSocket] Conectando...");

    try {
      const url = this.buildUrl();
      this.ws = new WebSocket(url);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
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

    if (this.ws) {
      this.ws.close(1000, "Client disconnect");
      this.ws = null;
    }

    this.setState("DISCONNECTED");
  }

  /**
   * Enviar mensaje al servidor
   */
  send(event: string, data?: any): void {
    const message = JSON.stringify({ event, data, timestamp: Date.now() });

    if (this.state !== "CONNECTED" || !this.ws) {
      console.warn("[WebSocket] No conectado, encolando mensaje");
      this.messageQueue.push(message);
      return;
    }

    try {
      this.ws.send(message);
      console.log(`[WebSocket] Enviado: ${event}`, data);
    } catch (error) {
      console.error("[WebSocket] Error al enviar:", error);
      this.messageQueue.push(message);
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
    return this.state === "CONNECTED" && this.ws?.readyState === WebSocket.OPEN;
  }

  // ==================== Métodos Privados ====================

  private buildUrl(): string {
    const { url, token } = this.config;
    if (token) {
      const separator = url.includes("?") ? "&" : "?";
      return `${url}${separator}token=${token}`;
    }
    return url;
  }

  private setState(newState: ConnectionState): void {
    const oldState = this.state;
    this.state = newState;
    console.log(`[WebSocket] Estado: ${oldState} → ${newState}`);
    this.emit(wsEvents.connection.stateChange, { oldState, newState });
  }

  private handleOpen(event: Event): void {
    console.log("[WebSocket] Conectado exitosamente");
    this.setState("CONNECTED");
    this.reconnectAttempts = 0;
    this.startHeartbeat();
    this.flushMessageQueue();
    this.emit(wsEvents.connection.connected, null);
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WSEvent = JSON.parse(event.data);
      console.log(
        `[WebSocket] Mensaje recibido: ${message.event}`,
        message.data
      );
      this.emit(message.event, message.data);
    } catch (error) {
      console.error("[WebSocket] Error al parsear mensaje:", error);
    }
  }

  private handleError(event: Event): void {
    console.error("[WebSocket] Error de conexión:", event);
    this.setState("ERROR");
    this.emit(wsEvents.connection.error, { error: "Connection error" });
  }

  private handleClose(event: CloseEvent): void {
    console.log(`[WebSocket] Desconectado: ${event.code} - ${event.reason}`);
    this.stopHeartbeat();
    this.setState("DISCONNECTED");
    this.emit(wsEvents.connection.disconnected, {
      code: event.code,
      reason: event.reason,
    });

    if (this.config.reconnect && event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  private emit(event: string, data: any): void {
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
      `[WebSocket] Reintentando conexión en ${delay}ms (intento ${this.reconnectAttempts + 1}/${this.config.maxReconnectAttempts})`
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
      `[WebSocket] Enviando ${this.messageQueue.length} mensajes encolados`
    );

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && this.ws) {
        try {
          this.ws.send(message);
        } catch (error) {
          console.error("[WebSocket] Error al enviar mensaje encolado:", error);
          this.messageQueue.unshift(message); // Volver a encolar
          break;
        }
      }
    }
  }
}
