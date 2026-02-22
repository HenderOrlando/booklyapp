"use client";

/**
 * useWebSocketToasts — RF-30: Toast notifications vía WebSocket
 *
 * Bridge entre WebSocket events y el sistema de toasts.
 * Escucha eventos del servidor y muestra notificaciones automáticas.
 */

import { useToast } from "@/hooks/useToast";
import { useWebSocket } from "@/infrastructure/websocket/WebSocketProvider";
import {
  notificationEvents,
  reservationEvents,
  resourceEvents,
  systemEvents,
} from "@/infrastructure/websocket/ws-events";
import { useEffect } from "react";

interface WebSocketToastConfig {
  enabled?: boolean;
  showReservationEvents?: boolean;
  showResourceEvents?: boolean;
  showSystemMessages?: boolean;
}

interface ReservationToastPayload {
  reservation?: {
    resourceName?: string;
  };
}

interface ResourceToastPayload {
  resourceName?: string;
}

interface SystemToastPayload {
  message?: string;
}

interface NotificationToastPayload {
  type?: "success" | "warning" | "error" | "info";
  title?: string;
  message?: string;
}

export function useWebSocketToasts(config: WebSocketToastConfig = {}) {
  const {
    enabled = true,
    showReservationEvents = true,
    showResourceEvents = true,
    showSystemMessages = true,
  } = config;

  const { socket, isConnected, wsEnabled } = useWebSocket();
  const { showSuccess, showInfo, showWarning, showError } = useToast();

  useEffect(() => {
    if (!enabled || !socket || !isConnected || !wsEnabled) return;

    const cleanups: Array<() => void> = [];

    // Reservation events
    if (showReservationEvents) {
      const onCreated = (data: ReservationToastPayload) => {
        showSuccess(
          "Reserva creada",
          `Tu reserva de ${data?.reservation?.resourceName || "recurso"} fue registrada.`,
        );
      };

      const onConfirmed = (data: ReservationToastPayload) => {
        showSuccess(
          "Reserva confirmada",
          `Tu reserva de ${data?.reservation?.resourceName || "recurso"} fue aprobada.`,
        );
      };

      const onCancelled = (data: ReservationToastPayload) => {
        showWarning(
          "Reserva cancelada",
          `La reserva de ${data?.reservation?.resourceName || "recurso"} fue cancelada.`,
        );
      };

      const onReminderSent = (data: ReservationToastPayload) => {
        showInfo(
          "Recordatorio",
          `Tu reserva de ${data?.reservation?.resourceName || "recurso"} comienza pronto.`,
        );
      };

      socket.on(reservationEvents.created, onCreated);
      socket.on(reservationEvents.confirmed, onConfirmed);
      socket.on(reservationEvents.cancelled, onCancelled);
      socket.on(reservationEvents.reminderSent, onReminderSent);

      cleanups.push(
        () => socket.off(reservationEvents.created, onCreated),
        () => socket.off(reservationEvents.confirmed, onConfirmed),
        () => socket.off(reservationEvents.cancelled, onCancelled),
        () => socket.off(reservationEvents.reminderSent, onReminderSent),
      );
    }

    // Resource events
    if (showResourceEvents) {
      const onMaintenanceScheduled = (data: ResourceToastPayload) => {
        showWarning(
          "Mantenimiento programado",
          `${data?.resourceName || "Un recurso"} entrará en mantenimiento.`,
        );
      };

      const onAvailabilityChanged = (data: ResourceToastPayload) => {
        showInfo(
          "Disponibilidad actualizada",
          `La disponibilidad de ${data?.resourceName || "un recurso"} cambió.`,
        );
      };

      socket.on(resourceEvents.maintenanceScheduled, onMaintenanceScheduled);
      socket.on(resourceEvents.availabilityChanged, onAvailabilityChanged);

      cleanups.push(
        () =>
          socket.off(
            resourceEvents.maintenanceScheduled,
            onMaintenanceScheduled,
          ),
        () =>
          socket.off(resourceEvents.availabilityChanged, onAvailabilityChanged),
      );
    }

    // System events
    if (showSystemMessages) {
      const onBroadcast = (data: SystemToastPayload) => {
        showInfo("Aviso del sistema", data?.message || "Mensaje del sistema");
      };

      const onMaintenance = (data: SystemToastPayload) => {
        showWarning(
          "Mantenimiento del sistema",
          data?.message || "El sistema entrará en mantenimiento.",
        );
      };

      socket.on(systemEvents.broadcast, onBroadcast);
      socket.on(systemEvents.maintenance, onMaintenance);

      cleanups.push(
        () => socket.off(systemEvents.broadcast, onBroadcast),
        () => socket.off(systemEvents.maintenance, onMaintenance),
      );
    }

    // Notification events (always active)
    const onNotification = (data: NotificationToastPayload) => {
      const type = data?.type || "info";
      const title = data?.title || "Nueva notificación";
      const message = data?.message || "";

      switch (type) {
        case "success":
          showSuccess(title, message);
          break;
        case "warning":
          showWarning(title, message);
          break;
        case "error":
          showError(title, message);
          break;
        default:
          showInfo(title, message);
      }
    };

    socket.on(notificationEvents.new, onNotification);
    cleanups.push(() => socket.off(notificationEvents.new, onNotification));

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [
    enabled,
    socket,
    isConnected,
    wsEnabled,
    showReservationEvents,
    showResourceEvents,
    showSystemMessages,
    showSuccess,
    showInfo,
    showWarning,
    showError,
  ]);
}
