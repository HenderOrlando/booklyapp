import { createLogger } from "@libs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

const logger = createLogger("DashboardGateway");

/**
 * Tipos de eventos del dashboard en tiempo real
 */
export enum DashboardEvent {
  METRICS_UPDATED = "dashboard:metrics:updated",
  KPI_UPDATED = "dashboard:kpi:updated",
  RESERVATION_CHANGED = "dashboard:reservation:changed",
  RESOURCE_STATUS_CHANGED = "dashboard:resource:status",
  ALERT_CREATED = "dashboard:alert:created",
  OCCUPANCY_UPDATED = "dashboard:occupancy:updated",
}

/**
 * Payload de actualización de métricas
 */
export interface DashboardMetricsPayload {
  totalReservations?: number;
  activeReservations?: number;
  pendingApprovals?: number;
  utilizationRate?: number;
  satisfactionRate?: number;
  timestamp: Date;
}

/**
 * Dashboard WebSocket Gateway (RF-36)
 * Gateway para actualizaciones en tiempo real del dashboard de reportes
 *
 * Permite a los clientes suscribirse a:
 * - Métricas actualizadas
 * - Cambios de reserva
 * - Alertas
 * - Tasa de ocupación
 */
@WebSocketGateway({
  namespace: "/dashboard",
  cors: {
    origin: "*",
    credentials: true,
  },
  transports: ["websocket", "polling"],
})
export class DashboardGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private connectedClients: Map<
    string,
    { userId?: string; rooms: Set<string> }
  > = new Map();

  afterInit(): void {
    logger.info("Dashboard WebSocket Gateway initialized");
  }

  handleConnection(client: Socket): void {
    const userId = client.handshake.auth?.userId || client.handshake.query?.userId;
    this.connectedClients.set(client.id, {
      userId: userId as string,
      rooms: new Set(),
    });

    logger.info("Client connected to dashboard", {
      clientId: client.id,
      userId,
      totalClients: this.connectedClients.size,
    });
  }

  handleDisconnect(client: Socket): void {
    this.connectedClients.delete(client.id);

    logger.info("Client disconnected from dashboard", {
      clientId: client.id,
      totalClients: this.connectedClients.size,
    });
  }

  /**
   * Suscribir cliente a un canal específico del dashboard
   */
  @SubscribeMessage("dashboard:subscribe")
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channel: string },
  ): void {
    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo) {
      client.join(data.channel);
      clientInfo.rooms.add(data.channel);

      logger.debug("Client subscribed to channel", {
        clientId: client.id,
        channel: data.channel,
      });
    }
  }

  /**
   * Desuscribir cliente de un canal
   */
  @SubscribeMessage("dashboard:unsubscribe")
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channel: string },
  ): void {
    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo) {
      client.leave(data.channel);
      clientInfo.rooms.delete(data.channel);
    }
  }

  /**
   * Solicitar métricas bajo demanda
   */
  @SubscribeMessage("dashboard:request-metrics")
  handleRequestMetrics(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { period?: string; filters?: Record<string, any> },
  ): void {
    logger.debug("Metrics requested by client", {
      clientId: client.id,
      period: data?.period,
    });

    client.emit("dashboard:metrics:pending", {
      message: "Metrics are being calculated...",
      requestedAt: new Date(),
    });
  }

  /**
   * Emitir actualización de métricas a todos los clientes conectados
   */
  broadcastMetricsUpdate(metrics: DashboardMetricsPayload): void {
    this.server.emit(DashboardEvent.METRICS_UPDATED, {
      ...metrics,
      timestamp: new Date(),
    });

    logger.debug("Metrics broadcasted", {
      connectedClients: this.connectedClients.size,
    });
  }

  /**
   * Emitir actualización de KPI específico
   */
  broadcastKpiUpdate(kpiName: string, value: number, delta?: number): void {
    this.server.emit(DashboardEvent.KPI_UPDATED, {
      kpiName,
      value,
      delta,
      timestamp: new Date(),
    });
  }

  /**
   * Emitir cambio de reserva (creada, cancelada, modificada)
   */
  broadcastReservationChange(
    action: "created" | "cancelled" | "modified" | "approved" | "rejected",
    reservationId: string,
    metadata?: Record<string, any>,
  ): void {
    this.server.emit(DashboardEvent.RESERVATION_CHANGED, {
      action,
      reservationId,
      metadata,
      timestamp: new Date(),
    });
  }

  /**
   * Emitir cambio de estado de recurso
   */
  broadcastResourceStatusChange(
    resourceId: string,
    status: string,
    metadata?: Record<string, any>,
  ): void {
    this.server.emit(DashboardEvent.RESOURCE_STATUS_CHANGED, {
      resourceId,
      status,
      metadata,
      timestamp: new Date(),
    });
  }

  /**
   * Emitir alerta
   */
  broadcastAlert(alert: {
    type: string;
    severity: "low" | "medium" | "high" | "critical";
    message: string;
    resourceId?: string;
    metadata?: Record<string, any>;
  }): void {
    this.server.emit(DashboardEvent.ALERT_CREATED, {
      ...alert,
      timestamp: new Date(),
    });
  }

  /**
   * Emitir tasa de ocupación actualizada
   */
  broadcastOccupancyUpdate(
    resourceId: string,
    occupancyRate: number,
    availableSlots: number,
  ): void {
    this.server.emit(DashboardEvent.OCCUPANCY_UPDATED, {
      resourceId,
      occupancyRate,
      availableSlots,
      timestamp: new Date(),
    });
  }

  /**
   * Obtener número de clientes conectados
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}
