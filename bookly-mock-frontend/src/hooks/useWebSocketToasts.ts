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

export function useWebSocketToasts(config: WebSocketToastConfig = {}) {
  const {
    enabled = true,
    showReservationEvents = true,
    showResourceEvents = true,
    showSystemMessages = true,
  } = config;

  const { socket, isConnected } = useWebSocket();
  const { showSuccess, showInfo, showWarning, showError } = useToast();

  useEffect(() => {
    if (!enabled || !socket || !isConnected) return;

    const cleanups: Array<() => void> = [];

    // Reservation events
    if (showReservationEvents) {
      const onCreated = (data: any) => {
        showSuccess(
          "Reserva creada",
          `Tu reserva de ${data?.reservation?.resourceName || "recurso"} fue registrada.`
        );
      };
      socket.on(reservationEvents.confirmed, (data: any) => {
        showSuccess(
          "Reserva confirmada",
          `Tu reserva de ${data?.reservation?.resourceName || "recurso"} fue aprobada.`
        );
      });
      socket.on(reservationEvents.cancelled, (data: any) => {
        showWarning(
          "Reserva cancelada",
          `La reserva de ${data?.reservation?.resourceName || "recurso"} fue cancelada.`
        );
      });
      socket.on(reservationEvents.reminderSent, (data: any) => {
        showInfo(
          "Recordatorio",
          `Tu reserva de ${data?.reservation?.resourceName || "recurso"} comienza pronto.`
        );
      });
      socket.on(reservationEvents.created, onCreated);

      cleanups.push(
        () => socket.off(reservationEvents.created, onCreated),
        () => socket.off(reservationEvents.confirmed, () => {}),
        () => socket.off(reservationEvents.cancelled, () => {}),
        () => socket.off(reservationEvents.reminderSent, () => {})
      );
    }

    // Resource events
    if (showResourceEvents) {
      socket.on(resourceEvents.maintenanceScheduled, (data: any) => {
        showWarning(
          "Mantenimiento programado",
          `${data?.resourceName || "Un recurso"} entrará en mantenimiento.`
        );
      });
      socket.on(resourceEvents.availabilityChanged, (data: any) => {
        showInfo(
          "Disponibilidad actualizada",
          `La disponibilidad de ${data?.resourceName || "un recurso"} cambió.`
        );
      });
    }

    // System events
    if (showSystemMessages) {
      socket.on(systemEvents.broadcast, (data: any) => {
        showInfo("Aviso del sistema", data?.message || "Mensaje del sistema");
      });
      socket.on(systemEvents.maintenance, (data: any) => {
        showWarning(
          "Mantenimiento del sistema",
          data?.message || "El sistema entrará en mantenimiento."
        );
      });
    }

    // Notification events (always active)
    socket.on(notificationEvents.new, (data: any) => {
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
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [
    enabled,
    socket,
    isConnected,
    showReservationEvents,
    showResourceEvents,
    showSystemMessages,
    showSuccess,
    showInfo,
    showWarning,
    showError,
  ]);
}
