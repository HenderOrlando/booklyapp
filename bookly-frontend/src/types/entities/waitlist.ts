/**
 * Tipos para Lista de Espera (Waitlist)
 */

export type WaitlistPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type WaitlistStatus =
  | "WAITING"
  | "NOTIFIED"
  | "ASSIGNED"
  | "EXPIRED"
  | "CANCELLED";

/**
 * Entrada en lista de espera
 */
export interface WaitlistEntry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  resourceId: string;
  resourceName: string;
  desiredDate: string; // Fecha deseada
  startTime: string;
  endTime: string;
  priority: WaitlistPriority;
  status: WaitlistStatus;
  position: number; // Posición en la cola (1 = primero)
  reason?: string; // Razón de la solicitud
  notificationSent?: boolean;
  notificationSentAt?: string;
  assignedReservationId?: string; // Si se asignó, ID de la reserva
  expiresAt?: string; // Fecha de expiración de la notificación
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO para agregar a lista de espera
 */
export interface AddToWaitlistDto {
  resourceId: string;
  desiredDate: string;
  startTime: string;
  endTime: string;
  priority?: WaitlistPriority;
  reason?: string;
}

/**
 * Estadísticas de lista de espera
 */
export interface WaitlistStats {
  totalWaiting: number;
  totalNotified: number;
  totalAssigned: number;
  totalExpired: number;
  averageWaitTime: number; // En días
  byPriority: {
    low: number;
    normal: number;
    high: number;
    urgent: number;
  };
}
