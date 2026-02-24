/**
 * Tipos para Calendar Component
 */

import type { Reservation } from "./entities/reservation";

/**
 * Vista del calendario
 */
export type CalendarView = "month" | "week" | "day";

/**
 * Evento del calendario (reserva)
 */
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId: string;
  resourceName: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "ACTIVE"
    | "CANCELLED"
    | "COMPLETED"
    | "REJECTED"
    | "APPROVED"
    | "CHECKED_IN";
  color?: string;
  userId?: string;
  userName?: string;
  // Referencia a la reserva original para tooltips mejorados
  reservation?: Reservation;
}

/**
 * Día del calendario
 */
export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  events: CalendarEvent[];
  isPast: boolean;
  isDisabled: boolean;
}

/**
 * Rango de fechas
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * Props para callbacks del calendario
 */
export interface CalendarCallbacks {
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onDateRangeChange?: (range: DateRange) => void;
  onViewChange?: (view: CalendarView) => void;
}

/**
 * Configuración del calendario
 */
export interface CalendarConfig {
  view: CalendarView;
  startDate: Date;
  firstDayOfWeek?: 0 | 1; // 0 = Domingo, 1 = Lunes
  showWeekNumbers?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
}

/**
 * Estado del calendario
 */
export interface CalendarState extends CalendarConfig {
  currentDate: Date;
  selectedDate: Date | null;
  visibleRange: DateRange;
}

/**
 * Convierte una Reservation a CalendarEvent
 */
export function reservationToCalendarEvent(
  reservation: Reservation
): CalendarEvent {
  return {
    id: reservation.id,
    title: reservation.title,
    start: new Date(reservation.startDate),
    end: new Date(reservation.endDate),
    resourceId: reservation.resourceId,
    resourceName: reservation.resourceName || "Unknown",
    status: reservation.status,
    userId: reservation.userId,
    userName: reservation.userName,
    color: getStatusColor(reservation.status),
    reservation, // Incluir reserva completa para tooltips
  };
}

/**
 * Obtiene el color según el estado
 */
function getStatusColor(
  status:
    | "PENDING"
    | "CONFIRMED"
    | "ACTIVE"
    | "CANCELLED"
    | "COMPLETED"
    | "REJECTED"
    | "APPROVED"
    | "CHECKED_IN"
): string {
  const colors: Record<typeof status, string> = {
    PENDING: "#F59E0B", // Amber
    CONFIRMED: "#10B981", // Green
    ACTIVE: "#3B82F6", // Blue
    CANCELLED: "#EF4444", // Red
    COMPLETED: "#6B7280", // Gray
    REJECTED: "#DC2626", // Red darker
    APPROVED: "#10B981", // Green
    CHECKED_IN: "#8B5CF6", // Purple
  };
  return colors[status];
}
