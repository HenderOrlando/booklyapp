/**
 * useConflictValidator - Hook para validar conflictos de reservas en tiempo real
 *
 * Valida:
 * - Solapamiento de horarios en mismo recurso
 * - Disponibilidad del recurso en fecha/hora específica
 * - Reservas existentes que crean conflicto
 */

import { useReservations } from "@/hooks/useReservations";
import type { CalendarEvent } from "@/types/calendar";
import type { Reservation } from "@/types/entities/reservation";
import { useMemo } from "react";

export interface ConflictValidationResult {
  hasConflict: boolean;
  conflictType?: "OVERLAP" | "UNAVAILABLE" | "RESOURCE_BUSY";
  conflictingReservations?: Reservation[];
  message?: string;
}

interface UseConflictValidatorParams {
  resourceId?: string;
  startDate?: string;
  endDate?: string;
  excludeReservationId?: string; // Para excluir la reserva actual al editar
}

export function useConflictValidator({
  resourceId,
  startDate,
  endDate,
  excludeReservationId,
}: UseConflictValidatorParams = {}): ConflictValidationResult {
  // Cargar todas las reservas para validación
  const { data: reservationsData } = useReservations();

  const result = useMemo<ConflictValidationResult>(() => {
    // Si no hay datos suficientes, no hay conflicto
    if (!resourceId || !startDate || !endDate || !reservationsData?.items) {
      return { hasConflict: false };
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Filtrar reservas relevantes (mismo recurso, no canceladas)
    const relevantReservations = reservationsData.items.filter(
      (r) =>
        r.resourceId === resourceId &&
        r.id !== excludeReservationId &&
        r.status !== "CANCELLED" &&
        r.status !== "REJECTED" &&
        r.status !== "COMPLETED"
    );

    // Buscar solapamientos
    const conflicting = relevantReservations.filter((reservation) => {
      const resStart = new Date(reservation.startDate);
      const resEnd = new Date(reservation.endDate);

      // Verificar solapamiento
      const overlaps =
        (start >= resStart && start < resEnd) || // Inicio dentro de reserva existente
        (end > resStart && end <= resEnd) || // Fin dentro de reserva existente
        (start <= resStart && end >= resEnd); // Engloba reserva existente

      return overlaps;
    });

    if (conflicting.length > 0) {
      const conflictNames = conflicting
        .map((r) => `"${r.title}" (${r.userName || "Usuario"})`)
        .join(", ");

      return {
        hasConflict: true,
        conflictType: "OVERLAP",
        conflictingReservations: conflicting,
        message: `Conflicto con ${conflicting.length} reserva${conflicting.length > 1 ? "s" : ""}: ${conflictNames}`,
      };
    }

    return { hasConflict: false };
  }, [resourceId, startDate, endDate, excludeReservationId, reservationsData]);

  return result;
}

/**
 * Validar conflicto para un evento de calendario específico
 */
export function useEventConflictValidator(
  event: CalendarEvent | null,
  newDate?: Date
): ConflictValidationResult {
  // Si hay una nueva fecha, calcular nuevas fechas de inicio/fin
  const startDate = useMemo(() => {
    if (!event) return undefined;
    if (!newDate) return event.start.toISOString();

    // Mantener la misma hora pero cambiar la fecha
    const newStart = new Date(newDate);
    newStart.setHours(event.start.getHours(), event.start.getMinutes(), 0, 0);
    return newStart.toISOString();
  }, [event, newDate]);

  const endDate = useMemo(() => {
    if (!event) return undefined;
    if (!newDate) return event.end.toISOString();

    // Calcular duración original
    const duration = event.end.getTime() - event.start.getTime();

    // Aplicar misma duración a nueva fecha
    const newStart = new Date(newDate);
    newStart.setHours(event.start.getHours(), event.start.getMinutes(), 0, 0);
    const newEnd = new Date(newStart.getTime() + duration);

    return newEnd.toISOString();
  }, [event, newDate]);

  return useConflictValidator({
    resourceId: event?.resourceId,
    startDate,
    endDate,
    excludeReservationId: event?.id,
  });
}

/**
 * Hook simplificado para validar al arrastrar un evento
 */
export function useDragConflictValidator() {
  return {
    validateEventDrop: (
      event: CalendarEvent,
      targetDate: Date
    ): ConflictValidationResult => {
      // Calcular nuevas fechas manteniendo la hora
      const newStart = new Date(targetDate);
      newStart.setHours(event.start.getHours(), event.start.getMinutes(), 0, 0);

      const duration = event.end.getTime() - event.start.getTime();
      const newEnd = new Date(newStart.getTime() + duration);

      // Por ahora retornamos sin conflicto, pero esto debería
      // hacer una query real al hook useConflictValidator
      // Lo implementaremos en el componente padre
      return {
        hasConflict: false,
      };
    },
  };
}
