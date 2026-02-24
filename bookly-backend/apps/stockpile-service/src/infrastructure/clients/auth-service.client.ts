import { EventPayload } from "@libs/common";
import { createLogger } from "@libs/common";
import { EventBusService } from "@libs/event-bus";
import { Injectable, OnModuleInit } from "@nestjs/common";

const logger = createLogger("AuthServiceClient");

/**
 * User Data from Auth Service
 */
export interface UserData {
  id: string;
  email: string;
  name: string;
  phone?: string;
  roles: string[];
  department?: string;
  metadata?: Record<string, any>;
}

/**
 * Auth Service Client
 * Cliente para comunicación con auth-service vía Event Bus
 */
@Injectable()
export class AuthServiceClient implements OnModuleInit {
  private readonly pendingRequests = new Map<string, (data: any) => void>();
  private readonly requestTimeout = 5000; // 5 segundos

  constructor(private readonly eventBus: EventBusService) {}

  /**
   * Obtener datos de un usuario por ID
   * Publica evento solicitando datos y espera respuesta
   */
  async getUserById(userId: string): Promise<UserData | null> {
    try {
      const requestId = `user-${userId}-${Date.now()}`;
      logger.info("Requesting user data from auth-service", {
        userId,
        requestId,
      });

      // Crear promesa que se resolverá cuando llegue la respuesta
      const responsePromise = new Promise<UserData | null>((resolve) => {
        // Registrar resolver para este requestId
        this.pendingRequests.set(requestId, resolve);

        // Timeout: si no hay respuesta en X segundos, retornar null
        setTimeout(() => {
          if (this.pendingRequests.has(requestId)) {
            logger.warn("User data request timeout", { userId, requestId });
            this.pendingRequests.delete(requestId);
            resolve(null);
          }
        }, this.requestTimeout);
      });

      // Publicar evento para solicitar datos del usuario
      await this.eventBus.publish("bookly.auth.user-data-request", {
        eventId: requestId,
        eventType: "user.data.requested",
        service: "stockpile-service",
        timestamp: new Date(),
        data: {
          userId,
          requestId,
          replyTo: "bookly.stockpile.user-data-response",
        },
      });

      // Esperar respuesta o timeout
      return await responsePromise;
    } catch (error) {
      logger.error("Error requesting user data", error as Error, { userId });
      return null;
    }
  }

  /**
   * Obtener datos de múltiples usuarios
   */
  async getUsersByIds(userIds: string[]): Promise<Map<string, UserData>> {
    const users = new Map<string, UserData>();

    for (const userId of userIds) {
      const userData = await this.getUserById(userId);
      if (userData) {
        users.set(userId, userData);
      }
    }

    return users;
  }

  async onModuleInit() {
    // Inicializar listener para respuestas del auth-service
    await this.eventBus.subscribe(
      "bookly.stockpile.user-data-response",
      "stockpile-auth-client",
      async (payload: EventPayload) => {
        this.handleUserDataResponse(payload);
      }
    );

    logger.info("AuthServiceClient initialized and listening for responses");
  }

  /**
   * Maneja la respuesta de datos de usuario
   */
  private handleUserDataResponse(payload: EventPayload): void {
    const { requestId, user } = payload.data;

    const resolver = this.pendingRequests.get(requestId);
    if (resolver) {
      resolver(user);
      this.pendingRequests.delete(requestId);
      logger.debug("User data response received and resolved", { requestId });
    } else {
      logger.warn("Received response for unknown requestId", { requestId });
    }
  }
}
