import { createLogger } from "@libs/common";
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
import { CheckInOutService } from '@stockpile/application/services/check-in-out.service";
import { GeolocationService } from '@stockpile/application/services/geolocation.service";

const logger = createLogger("GeolocationDashboardGateway");

/**
 * User Location Update
 */
export interface UserLocationUpdate {
  userId: string;
  reservationId: string;
  coordinates: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  timestamp: Date;
}

/**
 * Active User with Location
 */
export interface ActiveUserLocation {
  userId: string;
  reservationId: string;
  resourceId: string;
  checkInTime: Date;
  currentLocation: {
    latitude: number;
    longitude: number;
    lastUpdate: Date;
  };
  metadata?: Record<string, any>;
}

/**
 * Geolocation Dashboard Gateway
 * WebSocket gateway para dashboard de geolocalización en tiempo real
 */
@WebSocketGateway({
  namespace: "/geolocation",
  cors: {
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000, // 60 segundos - Tiempo máximo de espera para ping
  pingInterval: 25000, // 25 segundos - Intervalo entre pings
  connectTimeout: 45000, // 45 segundos - Timeout de conexión inicial
  transports: ["websocket", "polling"], // Soportar ambos transportes
})
export class GeolocationDashboardGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Mapa de usuarios activos con su última ubicación
  private activeUsersLocations = new Map<string, UserLocationUpdate>();

  // Mapa de sockets conectados por userId
  private connectedUsers = new Map<string, Socket>();

  constructor(
    private readonly checkInOutService: CheckInOutService,
    private readonly geolocationService: GeolocationService
  ) {}

  /**
   * Manejo de conexión de cliente
   */
  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (!userId) {
      logger.warn("Client connected without userId", {
        socketId: client.id,
      });
      client.disconnect();
      return;
    }

    this.connectedUsers.set(userId, client);

    logger.info("Client connected to geolocation dashboard", {
      socketId: client.id,
      userId,
    });

    // Enviar estado actual al cliente recién conectado
    await this.sendActiveUsersToClient(client);
  }

  /**
   * Manejo de desconexión de cliente
   */
  handleDisconnect(client: Socket) {
    const userId = Array.from(this.connectedUsers.entries()).find(
      ([_, socket]) => socket.id === client.id
    )?.[0];

    if (userId) {
      this.connectedUsers.delete(userId);
      this.activeUsersLocations.delete(userId);

      logger.info("Client disconnected from geolocation dashboard", {
        socketId: client.id,
        userId,
      });
    }
  }

  /**
   * Recibir actualización de ubicación del usuario
   */
  @SubscribeMessage("user-location-update")
  async handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: UserLocationUpdate
  ): Promise<void> {
    try {
      const { userId, reservationId, coordinates } = data;

      // Actualizar ubicación en caché local
      this.activeUsersLocations.set(userId, {
        ...data,
        timestamp: new Date(),
      });

      logger.debug("User location updated", {
        userId,
        reservationId,
        coordinates,
      });

      // Broadcast actualización a todos los clientes conectados
      this.server.emit("location-update", {
        userId,
        reservationId,
        coordinates,
        timestamp: new Date(),
      });

      // Verificar proximidad al recurso
      await this.checkProximityAlert(userId, reservationId, coordinates);
    } catch (error) {
      logger.error("Error handling location update", error as Error);
      client.emit("error", {
        message: "Error procesando actualización de ubicación",
      });
    }
  }

  /**
   * Enviar lista de usuarios activos a un cliente específico
   */
  private async sendActiveUsersToClient(client: Socket): Promise<void> {
    try {
      const activeCheckIns = await this.checkInOutService.findActive();
      const activeUsersWithLocation: ActiveUserLocation[] = [];

      for (const checkIn of activeCheckIns) {
        const locationUpdate = this.activeUsersLocations.get(checkIn.userId);

        if (locationUpdate) {
          activeUsersWithLocation.push({
            userId: checkIn.userId,
            reservationId: checkIn.reservationId,
            resourceId: checkIn.resourceId,
            checkInTime: checkIn.checkInTime || new Date(),
            currentLocation: {
              latitude: locationUpdate.coordinates.latitude,
              longitude: locationUpdate.coordinates.longitude,
              lastUpdate: locationUpdate.timestamp,
            },
            metadata: checkIn.metadata,
          });
        }
      }

      client.emit("active-users", activeUsersWithLocation);

      logger.debug("Active users sent to client", {
        socketId: client.id,
        count: activeUsersWithLocation.length,
      });
    } catch (error) {
      logger.error("Error sending active users", error as Error);
    }
  }

  /**
   * Broadcast de usuarios activos a todos los clientes
   */
  async broadcastActiveUsers(): Promise<void> {
    try {
      const activeCheckIns = await this.checkInOutService.findActive();
      const activeUsersWithLocation: ActiveUserLocation[] = [];

      for (const checkIn of activeCheckIns) {
        const locationUpdate = this.activeUsersLocations.get(checkIn.userId);

        if (locationUpdate) {
          activeUsersWithLocation.push({
            userId: checkIn.userId,
            reservationId: checkIn.reservationId,
            resourceId: checkIn.resourceId,
            checkInTime: checkIn.checkInTime || new Date(),
            currentLocation: {
              latitude: locationUpdate.coordinates.latitude,
              longitude: locationUpdate.coordinates.longitude,
              lastUpdate: locationUpdate.timestamp,
            },
            metadata: checkIn.metadata,
          });
        }
      }

      this.server.emit("active-users", activeUsersWithLocation);

      logger.debug("Active users broadcasted", {
        count: activeUsersWithLocation.length,
      });
    } catch (error) {
      logger.error("Error broadcasting active users", error as Error);
    }
  }

  /**
   * Notificar check-in a todos los clientes
   */
  async notifyCheckIn(
    userId: string,
    reservationId: string,
    resourceId: string,
    coordinates: { latitude: number; longitude: number }
  ): Promise<void> {
    try {
      this.server.emit("check-in", {
        userId,
        reservationId,
        resourceId,
        coordinates,
        timestamp: new Date(),
      });

      logger.info("Check-in notification sent", {
        userId,
        reservationId,
        resourceId,
      });
    } catch (error) {
      logger.error("Error notifying check-in", error as Error);
    }
  }

  /**
   * Notificar check-out a todos los clientes
   */
  async notifyCheckOut(
    userId: string,
    reservationId: string,
    resourceId: string
  ): Promise<void> {
    try {
      // Eliminar ubicación del caché
      this.activeUsersLocations.delete(userId);

      this.server.emit("check-out", {
        userId,
        reservationId,
        resourceId,
        timestamp: new Date(),
      });

      logger.info("Check-out notification sent", {
        userId,
        reservationId,
        resourceId,
      });
    } catch (error) {
      logger.error("Error notifying check-out", error as Error);
    }
  }

  /**
   * Verificar proximidad y enviar alerta si es necesario
   */
  private async checkProximityAlert(
    userId: string,
    reservationId: string,
    coordinates: { latitude: number; longitude: number }
  ): Promise<void> {
    try {
      // Obtener información de la reserva
      const checkIn =
        await this.checkInOutService.findByReservationId(reservationId);

      if (!checkIn) return;

      // Obtener ubicación del recurso
      const resourceLocation =
        await this.geolocationService.getResourceLocation(checkIn.resourceId);

      if (!resourceLocation) return;

      // Calcular distancia
      const distance = this.geolocationService.calculateDistance(
        coordinates,
        resourceLocation.coordinates
      );

      // Enviar alerta si está cerca (< 100m)
      if (distance < 100 && distance > 50) {
        this.server
          .to(this.connectedUsers.get(userId)?.id || "")
          .emit("proximity-alert", {
            type: "approaching",
            distance: Math.round(distance),
            message: `Estás a ${Math.round(distance)}m del recurso`,
            resourceId: checkIn.resourceId,
          });

        logger.info("Proximity alert sent (approaching)", {
          userId,
          distance,
        });
      } else if (distance <= 50) {
        this.server
          .to(this.connectedUsers.get(userId)?.id || "")
          .emit("proximity-alert", {
            type: "arrived",
            distance: Math.round(distance),
            message: "Has llegado al recurso",
            resourceId: checkIn.resourceId,
            canCheckIn: true,
          });

        logger.info("Proximity alert sent (arrived)", { userId, distance });
      }
    } catch (error) {
      logger.error("Error checking proximity alert", error as Error);
    }
  }

  /**
   * Solicitar estadísticas de dashboard
   */
  @SubscribeMessage("request-stats")
  async handleStatsRequest(@ConnectedSocket() client: Socket): Promise<void> {
    try {
      const totalActive = this.activeUsersLocations.size;
      const totalConnected = this.connectedUsers.size;
      const activeCheckIns = await this.checkInOutService.findActive();

      client.emit("dashboard-stats", {
        totalActiveUsers: totalActive,
        totalConnectedClients: totalConnected,
        totalActiveCheckIns: activeCheckIns.length,
        timestamp: new Date(),
      });

      logger.debug("Dashboard stats sent", {
        socketId: client.id,
        stats: { totalActive, totalConnected },
      });
    } catch (error) {
      logger.error("Error sending stats", error as Error);
      client.emit("error", { message: "Error obteniendo estadísticas" });
    }
  }
}
