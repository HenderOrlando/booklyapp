import { createLogger } from "@libs/common";
import { Injectable } from "@nestjs/common";
import { io, Socket } from "socket.io-client";

const logger = createLogger("StockpileWebSocketService");

/**
 * Stockpile WebSocket Service
 * Cliente WebSocket para emitir eventos al API Gateway en tiempo real
 */
@Injectable()
export class StockpileWebSocketService {
  private socket: Socket | null = null;
  private readonly gatewayUrl: string;

  constructor() {
    this.gatewayUrl =
      process.env.API_GATEWAY_WS_URL || "http://localhost:3000/api/v1/ws";
  }

  /**
   * Conectar al API Gateway WebSocket
   */
  async connect(): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    try {
      this.socket = io(this.gatewayUrl, {
        auth: {
          service: "stockpile-service",
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
      });

      this.socket.on("connect", () => {
        logger.info("Connected to API Gateway WebSocket", {
          socketId: this.socket?.id,
        });
      });

      this.socket.on("disconnect", (reason) => {
        logger.warn("Disconnected from API Gateway WebSocket", { reason });
      });

      this.socket.on("error", (error) => {
        logger.error("WebSocket error", error);
      });
    } catch (error) {
      logger.error("Failed to connect to WebSocket", error);
    }
  }

  /**
   * Desconectar
   */
  async disconnect(): Promise<void> {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      logger.info("Disconnected from WebSocket");
    }
  }

  /**
   * Emitir notificación de aprobación
   */
  async emitApprovalNotification(data: {
    userId: string;
    requestId: string;
    status: string;
    type: string;
    message: string;
    metadata?: any;
  }): Promise<void> {
    if (!this.socket?.connected) {
      await this.connect();
    }

    try {
      this.socket?.emit("notification:approval", data);
      logger.debug("Approval notification emitted", {
        requestId: data.requestId,
      });
    } catch (error) {
      logger.error("Error emitting approval notification", error);
    }
  }

  /**
   * Emitir notificación de check-in/out
   */
  async emitCheckInOutNotification(data: {
    userId: string;
    checkInId: string;
    action: "CHECK_IN" | "CHECK_OUT";
    resourceId: string;
    status: string;
    message: string;
    metadata?: any;
  }): Promise<void> {
    if (!this.socket?.connected) {
      await this.connect();
    }

    try {
      this.socket?.emit("notification:check-in-out", data);
      logger.debug("Check-in/out notification emitted", {
        checkInId: data.checkInId,
      });
    } catch (error) {
      logger.error("Error emitting check-in/out notification", error);
    }
  }

  /**
   * Emitir alerta de recurso vencido
   */
  async emitOverdueAlert(data: {
    userId: string;
    checkInId: string;
    resourceId: string;
    delayMinutes: number;
    message: string;
    severity: "warning" | "critical";
  }): Promise<void> {
    if (!this.socket?.connected) {
      await this.connect();
    }

    try {
      this.socket?.emit("alert:overdue", data);
      logger.debug("Overdue alert emitted", { checkInId: data.checkInId });
    } catch (error) {
      logger.error("Error emitting overdue alert", error);
    }
  }

  /**
   * Emitir actualización de estado de aprobación
   */
  async emitApprovalStatusUpdate(data: {
    requestId: string;
    previousStatus: string;
    newStatus: string;
    updatedBy: string;
    timestamp: Date;
    metadata?: any;
  }): Promise<void> {
    if (!this.socket?.connected) {
      await this.connect();
    }

    try {
      this.socket?.emit("approval:status:updated", data);
      logger.debug("Approval status update emitted", {
        requestId: data.requestId,
      });
    } catch (error) {
      logger.error("Error emitting approval status update", error);
    }
  }

  /**
   * Emitir notificación genérica
   */
  async emitNotification(event: string, data: any): Promise<void> {
    if (!this.socket?.connected) {
      await this.connect();
    }

    try {
      this.socket?.emit(event, data);
      logger.debug("Notification emitted", { event });
    } catch (error) {
      logger.error("Error emitting notification", error, { event, error });
    }
  }

  /**
   * Verificar conexión
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}
