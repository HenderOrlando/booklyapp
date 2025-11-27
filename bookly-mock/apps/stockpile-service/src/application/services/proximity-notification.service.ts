import {
  NotificationChannel,
  NotificationPriority,
} from "@libs/common/enums";
import { createLogger } from "@libs/common";
import { NotificationService } from "@libs/notifications";
import { Injectable } from "@nestjs/common";
import { CheckInOutService } from "./check-in-out.service";
import { GeolocationService } from "./geolocation.service";

const logger = createLogger("ProximityNotificationService");

/**
 * Proximity Threshold
 */
export enum ProximityThreshold {
  FAR = 200, // > 200m
  APPROACHING = 100, // 50m - 100m
  NEAR = 50, // 20m - 50m
  ARRIVED = 20, // < 20m
}

/**
 * User Proximity State
 */
interface UserProximityState {
  userId: string;
  reservationId: string;
  resourceId: string;
  lastDistance: number;
  lastThreshold: ProximityThreshold;
  lastNotificationTime: Date;
}

/**
 * Proximity Notification Service
 * Servicio para enviar notificaciones basadas en proximidad geográfica
 */
@Injectable()
export class ProximityNotificationService {
  // Cache de estados de proximidad de usuarios
  private userProximityStates = new Map<string, UserProximityState>();

  // Intervalo mínimo entre notificaciones (en ms) para evitar spam
  private readonly notificationCooldown = 60000; // 1 minuto

  constructor(
    private readonly geolocationService: GeolocationService,
    private readonly notificationService: NotificationService,
    private readonly checkInOutService: CheckInOutService
  ) {}

  /**
   * Verificar proximidad y enviar notificaciones si es necesario
   */
  async checkProximityAndNotify(
    userId: string,
    userCoords: { latitude: number; longitude: number },
    reservationId: string
  ): Promise<void> {
    try {
      // Obtener información de la reserva
      const reservation =
        await this.checkInOutService.findByReservationId(reservationId);

      if (!reservation) {
        logger.warn("Reservation not found for proximity check", {
          reservationId,
        });
        return;
      }

      // Obtener ubicación del recurso
      const resourceLocation =
        await this.geolocationService.getResourceLocation(
          reservation.resourceId
        );

      if (!resourceLocation) {
        logger.warn("Resource location not found", {
          resourceId: reservation.resourceId,
        });
        return;
      }

      // Calcular distancia actual
      const distance = this.geolocationService.calculateDistance(
        userCoords,
        resourceLocation.coordinates
      );

      // Determinar threshold actual
      const currentThreshold = this.getProximityThreshold(distance);

      // Obtener estado previo del usuario
      const stateKey = `${userId}-${reservationId}`;
      const previousState = this.userProximityStates.get(stateKey);

      // Verificar si debemos enviar notificación
      const shouldNotify = this.shouldSendNotification(
        currentThreshold,
        previousState
      );

      if (shouldNotify) {
        await this.sendProximityNotification(
          userId,
          reservationId,
          reservation.resourceId,
          distance,
          currentThreshold,
          resourceLocation.name
        );

        // Actualizar estado
        this.userProximityStates.set(stateKey, {
          userId,
          reservationId,
          resourceId: reservation.resourceId,
          lastDistance: distance,
          lastThreshold: currentThreshold,
          lastNotificationTime: new Date(),
        });
      }

      logger.debug("Proximity checked", {
        userId,
        reservationId,
        distance: Math.round(distance),
        threshold: ProximityThreshold[currentThreshold],
        notificationSent: shouldNotify,
      });
    } catch (error) {
      logger.error("Error checking proximity", error as Error, {
        userId,
        reservationId,
      });
    }
  }

  /**
   * Determinar threshold de proximidad según distancia
   */
  private getProximityThreshold(distance: number): ProximityThreshold {
    if (distance <= ProximityThreshold.ARRIVED) {
      return ProximityThreshold.ARRIVED;
    } else if (distance <= ProximityThreshold.NEAR) {
      return ProximityThreshold.NEAR;
    } else if (distance <= ProximityThreshold.APPROACHING) {
      return ProximityThreshold.APPROACHING;
    } else {
      return ProximityThreshold.FAR;
    }
  }

  /**
   * Verificar si se debe enviar notificación
   */
  private shouldSendNotification(
    currentThreshold: ProximityThreshold,
    previousState?: UserProximityState
  ): boolean {
    // Primera vez: notificar solo si está cerca
    if (!previousState) {
      return currentThreshold <= ProximityThreshold.APPROACHING;
    }

    // Verificar cooldown
    const timeSinceLastNotification =
      Date.now() - previousState.lastNotificationTime.getTime();
    if (timeSinceLastNotification < this.notificationCooldown) {
      return false;
    }

    // Notificar si cambió de threshold (acercándose)
    return currentThreshold < previousState.lastThreshold;
  }

  /**
   * Enviar notificación de proximidad
   */
  private async sendProximityNotification(
    userId: string,
    reservationId: string,
    resourceId: string,
    distance: number,
    threshold: ProximityThreshold,
    resourceName: string
  ): Promise<void> {
    try {
      const { subject, message, urgency } = this.getNotificationContent(
        threshold,
        distance,
        resourceName
      );

      // Enviar notificación push
      await this.notificationService.sendNotification(
        NotificationChannel.PUSH,
        {
          to: userId,
          subject,
          message,
          data: {
            type: "proximity",
            reservationId,
            resourceId,
            distance: Math.round(distance),
            threshold: ProximityThreshold[threshold],
            canCheckIn: threshold === ProximityThreshold.ARRIVED,
          },
          priority: urgency,
        }
      );

      logger.info("Proximity notification sent", {
        userId,
        reservationId,
        threshold: ProximityThreshold[threshold],
        distance: Math.round(distance),
      });
    } catch (error) {
      logger.error("Error sending proximity notification", error as Error);
    }
  }

  /**
   * Obtener contenido de notificación según threshold
   */
  private getNotificationContent(
    threshold: ProximityThreshold,
    distance: number,
    resourceName: string
  ): {
    subject: string;
    message: string;
    urgency: NotificationPriority;
  } {
    const roundedDistance = Math.round(distance);

    switch (threshold) {
      case ProximityThreshold.ARRIVED:
        return {
          subject: "¡Has llegado! 🎯",
          message: `Ya estás en ${resourceName}. Puedes hacer check-in ahora.`,
          urgency: NotificationPriority.HIGH,
        };

      case ProximityThreshold.NEAR:
        return {
          subject: "Muy cerca 📍",
          message: `Estás a ${roundedDistance}m de ${resourceName}. Prepárate para hacer check-in.`,
          urgency: NotificationPriority.HIGH,
        };

      case ProximityThreshold.APPROACHING:
        return {
          subject: "Te acercas 🚶",
          message: `Estás a ${roundedDistance}m de ${resourceName}. Continúa en dirección al recurso.`,
          urgency: NotificationPriority.NORMAL,
        };

      case ProximityThreshold.FAR:
      default:
        return {
          subject: "Recordatorio de reserva 📅",
          message: `Tienes una reserva en ${resourceName}. Estás a ${roundedDistance}m.`,
          urgency: NotificationPriority.LOW,
        };
    }
  }

  /**
   * Limpiar estado de usuario (cuando hace check-in o cancela)
   */
  clearUserProximityState(userId: string, reservationId: string): void {
    const stateKey = `${userId}-${reservationId}`;
    this.userProximityStates.delete(stateKey);
    logger.debug("User proximity state cleared", { userId, reservationId });
  }

  /**
   * Obtener estado actual de proximidad de un usuario
   */
  getUserProximityState(
    userId: string,
    reservationId: string
  ): UserProximityState | undefined {
    const stateKey = `${userId}-${reservationId}`;
    return this.userProximityStates.get(stateKey);
  }

  /**
   * Obtener todas las proximidades activas
   */
  getAllActiveProximities(): UserProximityState[] {
    return Array.from(this.userProximityStates.values());
  }

  /**
   * Limpiar estados antiguos (>24 horas)
   */
  cleanupOldStates(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas

    let cleaned = 0;
    for (const [key, state] of this.userProximityStates.entries()) {
      const age = now - state.lastNotificationTime.getTime();
      if (age > maxAge) {
        this.userProximityStates.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info("Old proximity states cleaned", { count: cleaned });
    }
  }
}
