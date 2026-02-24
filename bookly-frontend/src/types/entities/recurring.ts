/**
 * Tipos para Reservas Periódicas/Recurrentes
 */

export type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

/**
 * Patrón de recurrencia
 */
export interface RecurrencePattern {
  frequency: RecurrenceFrequency;
  interval: number; // Cada X días/semanas/meses
  daysOfWeek?: DayOfWeek[]; // Para recurrencia semanal
  dayOfMonth?: number; // Para recurrencia mensual
  endDate?: string; // Fecha final de recurrencia
  occurrences?: number; // Número de ocurrencias (alternativa a endDate)
}

/**
 * Reserva recurrente
 */
export interface RecurringReservation {
  id: string;
  patternId: string; // ID del patrón de recurrencia
  resourceId: string;
  resourceName: string;
  userId: string;
  userName: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  pattern: RecurrencePattern;
  title?: string;
  description?: string;
  status: "ACTIVE" | "PAUSED" | "CANCELLED";
  createdInstances: number; // Instancias creadas hasta ahora
  failedInstances: number; // Instancias que fallaron por conflictos
  nextOccurrence?: string; // Próxima fecha
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO para crear reserva recurrente
 */
export interface CreateRecurringReservationDto {
  resourceId: string;
  startTime: string;
  endTime: string;
  pattern: RecurrencePattern;
  title?: string;
  description?: string;
  notifyConflicts?: boolean; // Notificar si hay conflictos
}

/**
 * Instancia de reserva generada por patrón recurrente
 */
export interface ReservationInstance {
  id: string;
  recurringReservationId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "PENDING" | "CONFIRMED" | "CONFLICT" | "CANCELLED";
  conflictReason?: string;
}
