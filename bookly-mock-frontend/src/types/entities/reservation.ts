/**
 * Tipos y entidades para el módulo de Reservas
 */

export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED";

export type RecurrenceType = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";

export interface Reservation {
  id: string;
  resourceId: string;
  resourceName?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  title: string;
  description?: string;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  status: ReservationStatus;
  recurrenceType?: RecurrenceType;
  recurrenceEndDate?: string;
  attendees?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
}

export interface TimeSlot {
  id: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  available: boolean;
  resourceId?: string;
  reservationId?: string;
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  slots: TimeSlot[];
  hasAvailability: boolean;
}

export interface ResourceAvailability {
  resourceId: string;
  resourceName: string;
  days: DayAvailability[];
}

export interface CreateReservationDto {
  resourceId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  recurrenceType?: RecurrenceType;
  recurrenceEndDate?: string;
  attendees?: number;
  notes?: string;
}

export interface UpdateReservationDto {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  notes?: string;
}
