import {
  DLQFilterDto,
  EventFilterDto,
  LogFilterDto,
  WebSocketEvent,
  WebSocketSubscribeDto,
} from "@gateway/application/dto/websocket.dto";
import { EventsService } from "@gateway/application/services/events.service";
import { NotificationService } from "@gateway/application/services/notification.service";
import { createLogger } from "@libs/common";
import { EventBusService, EventStoreService } from "@libs/event-bus";
import { DeadLetterQueueService } from "@libs/event-bus/dlq";
import { OnModuleInit } from "@nestjs/common";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

const logger = createLogger("WebSocketGateway");

interface ClientSubscriptions {
  userId: string;
  channels: Set<string>;
  eventFilters?: EventFilterDto;
  dlqFilters?: DLQFilterDto;
  logFilters?: LogFilterDto;
}

/**
 * WebSocket Gateway
 * Gestiona conexiones WebSocket y streaming en tiempo real
 *
 * Características:
 * - Eventos en tiempo real desde Event Bus
 * - Monitoreo live de DLQ
 * - Dashboard reactivo de métricas
 * - Notificaciones inApp
 * - Streaming de logs
 * - Filtros configurables por cliente
 */
@WebSocketGateway({
  cors: {
    origin: "*",
    credentials: true,
  },
  namespace: "/api/v1/ws",
})
export class BooklyWebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  private clients: Map<string, ClientSubscriptions> = new Map();

  constructor(
    private readonly eventBusService: EventBusService,
    private readonly eventStoreService: EventStoreService,
    private readonly dlqService: DeadLetterQueueService,
    private readonly eventsService: EventsService,
    private readonly notificationService: NotificationService,
  ) {
    // Constructor only initializes dependencies
  }

  /**
   * Initialize services after module is ready
   * This ensures database connections are established before starting monitoring
   */
  onModuleInit() {
    this.initializeEventListeners();
    this.startMetricsUpdates();
    this.startDLQMonitoring();
  }

  /**
   * Cliente conectado
   */
  handleConnection(client: Socket) {
    const userId = this.extractUserIdFromSocket(client);

    logger.info(`WebSocket client connected`, {
      clientId: client.id,
      userId,
    });

    this.clients.set(client.id, {
      userId,
      channels: new Set(),
    });

    // Enviar estado inicial
    this.sendInitialState(client);
  }

  /**
   * Cliente desconectado
   */
  handleDisconnect(client: Socket) {
    const subscription = this.clients.get(client.id);

    logger.info(`WebSocket client disconnected`, {
      clientId: client.id,
      userId: subscription?.userId,
    });

    this.clients.delete(client.id);
  }

  /**
   * Suscribirse a canales
   */
  @SubscribeMessage("subscribe")
  handleSubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: WebSocketSubscribeDto,
  ) {
    const subscription = this.clients.get(client.id);

    if (!subscription) {
      return { error: "Client not found" };
    }

    // Actualizar suscripciones
    data.channels.forEach((channel) => {
      subscription.channels.add(channel);
      client.join(channel);
    });

    // Actualizar filtros
    if (data.eventFilters) {
      subscription.eventFilters = data.eventFilters;
    }

    if (data.dlqFilters) {
      subscription.dlqFilters = data.dlqFilters;
    }

    if (data.logFilters) {
      subscription.logFilters = data.logFilters;
    }

    logger.info(`Client subscribed to channels`, {
      clientId: client.id,
      channels: data.channels,
    });

    return {
      success: true,
      channels: Array.from(subscription.channels),
    };
  }

  /**
   * Desuscribirse de canales
   */
  @SubscribeMessage("unsubscribe")
  handleUnsubscribe(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { channels: string[] },
  ) {
    const subscription = this.clients.get(client.id);

    if (!subscription) {
      return { error: "Client not found" };
    }

    data.channels.forEach((channel) => {
      subscription.channels.delete(channel);
      client.leave(channel);
    });

    logger.info(`Client unsubscribed from channels`, {
      clientId: client.id,
      channels: data.channels,
    });

    return {
      success: true,
      channels: Array.from(subscription.channels),
    };
  }

  /**
   * Obtener notificaciones
   */
  @SubscribeMessage("notifications:get")
  async handleGetNotifications(@ConnectedSocket() client: Socket) {
    const subscription = this.clients.get(client.id);

    if (!subscription) {
      return { error: "Client not found" };
    }

    const notifications = await this.notificationService.getUserNotifications(
      subscription.userId,
    );

    return {
      success: true,
      notifications,
    };
  }

  /**
   * Marcar notificación como leída
   */
  @SubscribeMessage("notifications:read")
  async handleMarkNotificationRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string },
  ) {
    const subscription = this.clients.get(client.id);

    if (!subscription) {
      return { error: "Client not found" };
    }

    const success = await this.notificationService.markAsRead(
      subscription.userId,
      data.notificationId,
    );

    if (success) {
      client.emit(WebSocketEvent.NOTIFICATION_READ, {
        notificationId: data.notificationId,
      });
    }

    return { success };
  }

  /**
   * Enviar estado inicial al cliente
   */
  private async sendInitialState(client: Socket) {
    try {
      // Métricas iniciales
      const metrics = await this.eventsService.getMetrics();
      client.emit(WebSocketEvent.DASHBOARD_METRICS_UPDATED, metrics);

      // Estadísticas DLQ - Handle connection errors gracefully
      try {
        const dlqStats = await this.dlqService.getStats();
        client.emit(WebSocketEvent.DLQ_STATS_UPDATED, dlqStats);
      } catch (dlqError: any) {
        if (
          dlqError.message?.includes("MongoNotConnectedError") ||
          dlqError.message?.includes("Client must be connected")
        ) {
          logger.warn(
            "DLQ stats not available - waiting for database connection",
          );
          client.emit(WebSocketEvent.DLQ_STATS_UPDATED, {
            stats: null,
            message: "Database connection pending",
          });
        } else {
          throw dlqError;
        }
      }

      // Notificaciones pendientes
      const subscription = this.clients.get(client.id);
      if (subscription) {
        const notifications =
          await this.notificationService.getUserNotifications(
            subscription.userId,
            true,
          );
        client.emit("notifications:initial", notifications);
      }
    } catch (error: any) {
      if (
        error.message?.includes("MongoNotConnectedError") ||
        error.message?.includes("Client must be connected")
      ) {
        logger.warn("Initial state pending - database connection not ready");
        client.emit("connection:pending", {
          message: "Services initializing...",
        });
      } else {
        logger.error("Error sending initial state", error);
      }
    }
  }

  /**
   * Inicializar listeners de eventos del Event Bus
   * Escucha eventos CRUD de todos los microservicios y los reenvía via WebSocket
   */
  private initializeEventListeners() {
    const crudEvents = [
      "resource.created",
      "resource.updated",
      "resource.deleted",
      "reservation.created",
      "reservation.updated",
      "reservation.cancelled",
      "reservation.approved",
      "reservation.rejected",
      "approval_request.created",
      "approval_request.approved",
      "approval_request.rejected",
      "user.registered",
      "user.updated",
      "user.deleted",
      "category.created",
      "category.updated",
      "maintenance.scheduled",
      "maintenance.completed",
      "feedback.submitted",
      "report.generated",
      "app_config.updated",
    ];

    for (const eventType of crudEvents) {
      try {
        this.eventBusService.subscribe(
          eventType,
          "gateway-ws-group",
          async (eventData: any) => {
            logger.debug(`Broadcasting event: ${eventType}`, {
              eventId: eventData?.id,
            });
            this.server.emit("crud-event", {
              type: eventType,
              data: eventData,
              timestamp: new Date(),
            });
          },
        );
      } catch (error) {
        logger.warn(`Could not subscribe to event ${eventType}`, error);
      }
    }

    logger.info(
      `Event listeners initialized for ${crudEvents.length} CRUD event types`,
    );
  }

  /**
   * Actualizar métricas periódicamente
   */
  private startMetricsUpdates() {
    setInterval(async () => {
      try {
        const metrics = await this.eventsService.getMetrics();

        // Solo obtener dashboard data si Event Store está habilitado
        let dashboard: any = null;
        try {
          dashboard = await this.eventsService.getDashboardData();
        } catch (error) {
          // Event Store no está habilitado, continuar sin dashboard data
          if (error.status !== 404) {
            logger.warn("Could not get dashboard data", error.message);
          }
        }

        // Enviar a todos los clientes suscritos al canal "dashboard"
        this.server
          .to("dashboard")
          .emit(WebSocketEvent.DASHBOARD_METRICS_UPDATED, {
            metrics,
            dashboard,
            timestamp: new Date(),
          });
      } catch (error) {
        logger.error("Error updating metrics", error);
      }
    }, 5000); // Cada 5 segundos
  }

  /**
   * Monitorear DLQ periódicamente
   */
  private startDLQMonitoring() {
    setInterval(async () => {
      try {
        const stats = await this.dlqService.getStats();

        // Enviar a todos los clientes suscritos al canal "dlq"
        this.server.to("dlq").emit(WebSocketEvent.DLQ_STATS_UPDATED, {
          stats,
          timestamp: new Date(),
        });
      } catch (error: any) {
        // Handle MongoDB connection errors gracefully
        if (
          error.message?.includes("MongoNotConnectedError") ||
          error.message?.includes("Client must be connected")
        ) {
          logger.warn("DLQ monitoring waiting for database connection...");
        } else {
          logger.error("Error monitoring DLQ", error);
        }
      }
    }, 10000); // Cada 10 segundos
  }

  /**
   * Extraer userId del socket (desde handshake query o auth token)
   */
  private extractUserIdFromSocket(client: Socket): string {
    // Extraer de query params
    const userId = client.handshake.query.userId as string;

    if (userId) {
      return userId;
    }

    // Extraer de JWT token en handshake.auth
    const token = client.handshake.auth?.token as string;
    if (token) {
      try {
        const base64Payload = token.split(".")[1];
        if (base64Payload) {
          const payload = JSON.parse(
            Buffer.from(base64Payload, "base64").toString(),
          );
          if (payload.sub) {
            return payload.sub;
          }
        }
      } catch (error) {
        logger.warn("Failed to extract userId from JWT token", {
          error: (error as Error).message,
        });
      }
    }

    return "anonymous";
  }

  /**
   * Emitir evento a usuarios específicos
   */
  emitToUser(userId: string, event: WebSocketEvent, data: any) {
    // Buscar todos los clientes del usuario
    this.clients.forEach((subscription, clientId) => {
      if (subscription.userId === userId) {
        this.server.to(clientId).emit(event, data);
      }
    });
  }

  /**
   * Emitir evento a canal específico
   */
  emitToChannel(channel: string, event: WebSocketEvent, data: any) {
    this.server.to(channel).emit(event, data);
  }

  /**
   * Broadcast evento a todos los clientes
   */
  broadcast(event: WebSocketEvent, data: any) {
    this.server.emit(event, data);
  }
}
