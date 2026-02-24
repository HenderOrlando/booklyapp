      import type { RecurrencePattern } from "@/types/entities/recurring";
import type {
  CreateReservationDto,
  Reservation,
} from "@/types/entities/reservation";
import {
  addDays,
  addMonths,
  format,
  isAfter,
  parse,
  startOfDay,
} from "date-fns";

/**
 * Genera fechas de ocurrencias basadas en el patrón de recurrencia
 */
export function generateRecurrenceDates(
  startDate: Date,
  pattern: RecurrencePattern
): Date[] {
  const dates: Date[] = [];
  let currentDate = startOfDay(startDate);
  const maxIterations = pattern.occurrences || 365; // Máximo 365 instancias o hasta endDate

  // Función para determinar si continuar generando
  const shouldContinue = (date: Date, count: number): boolean => {
    if (pattern.occurrences && count >= pattern.occurrences) return false;
    if (pattern.endDate) {
      const endDate = startOfDay(new Date(pattern.endDate));
      if (isAfter(date, endDate)) return false;
    }
    return count < maxIterations;
  };

  let count = 0;

  while (shouldContinue(currentDate, count)) {
    // Verificar si la fecha cumple con el patrón
    let shouldAdd = false;

    switch (pattern.frequency) {
      case "DAILY":
        shouldAdd = true;
        break;

      case "WEEKLY":
        // Verificar si el día de la semana coincide
        if (pattern.daysOfWeek && pattern.daysOfWeek.length > 0) {
          const dayOfWeek = format(currentDate, "EEEE").toUpperCase() as
            | "MONDAY"
            | "TUESDAY"
            | "WEDNESDAY"
            | "THURSDAY"
            | "FRIDAY"
            | "SATURDAY"
            | "SUNDAY";
          shouldAdd = pattern.daysOfWeek.includes(dayOfWeek);
        } else {
          shouldAdd = true;
        }
        break;

      case "MONTHLY":
        // Verificar si el día del mes coincide
        const dayOfMonth = currentDate.getDate();
        if (pattern.dayOfMonth) {
          shouldAdd = dayOfMonth === pattern.dayOfMonth;
        } else {
          // Si no se especifica, usar el día del startDate
          shouldAdd = dayOfMonth === startDate.getDate();
        }
        break;
    }

    if (shouldAdd) {
      dates.push(new Date(currentDate));
      count++;
    }

    // Avanzar según el intervalo
    switch (pattern.frequency) {
      case "DAILY":
        currentDate = addDays(currentDate, pattern.interval);
        break;
      case "WEEKLY":
        currentDate = addDays(currentDate, 1); // Avanzar día a día para verificar daysOfWeek
        break;
      case "MONTHLY":
        currentDate = addMonths(currentDate, pattern.interval);
        break;
    }

    // Prevenir bucles infinitos
    if (dates.length > maxIterations) break;
  }

  return dates;
}

/**
 * Genera instancias de reservas a partir de un patrón recurrente
 */
export function generateReservationInstances(
  baseReservation: CreateReservationDto,
  pattern: RecurrencePattern
): Reservation[] {
  const startDate = parse(
    baseReservation.startDate.split("T")[0],
    "yyyy-MM-dd",
    new Date()
  );
  const startTime = baseReservation.startDate.split("T")[1];
  const endTime = baseReservation.endDate.split("T")[1];

  const occurrenceDates = generateRecurrenceDates(startDate, pattern);

  return occurrenceDates.map((date, index) => {
    const dateStr = format(date, "yyyy-MM-dd");

    return {
      id: `recurring-${baseReservation.resourceId}-${dateStr}-${index}`,
      resourceId: baseReservation.resourceId,
      resourceName: `Recurso ${baseReservation.resourceId}`,
      userId: "current-user", // En producción vendría del token
      userName: "Usuario Actual",
      userEmail: "user@example.com",
      title: baseReservation.title,
      description: baseReservation.description || "",
      startDate: `${dateStr}T${startTime}`,
      endDate: `${dateStr}T${endTime}`,
      status: "CONFIRMED" as const,
      recurrenceType: pattern.frequency,
      attendees: baseReservation.attendees || 1,
      notes:
        baseReservation.notes || `Instancia ${index + 1} de reserva recurrente`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Reservation;
  });
}

/**
 * Valida si se pueden crear todas las instancias sin conflictos
 */
export function validateRecurringReservations(
  instances: Reservation[],
  existingReservations: Reservation[]
): {
  canCreate: boolean;
  conflicts: Array<{ date: string; conflictingReservation: Reservation }>;
  successCount: number;
  failureCount: number;
} {
  const conflicts: Array<{
    date: string;
    conflictingReservation: Reservation;
  }> = [];

  instances.forEach((instance) => {
    const hasConflict = existingReservations.some((existing) => {
      if (existing.resourceId !== instance.resourceId) return false;
      if (existing.status === "CANCELLED" || existing.status === "REJECTED")
        return false;

      const instanceStart = new Date(instance.startDate);
      const instanceEnd = new Date(instance.endDate);
      const existingStart = new Date(existing.startDate);
      const existingEnd = new Date(existing.endDate);

      // Verificar solapamiento
      return (
        (instanceStart >= existingStart && instanceStart < existingEnd) ||
        (instanceEnd > existingStart && instanceEnd <= existingEnd) ||
        (instanceStart <= existingStart && instanceEnd >= existingEnd)
      );
    });

    if (hasConflict) {
      const conflicting = existingReservations.find((existing) => {
        const instanceStart = new Date(instance.startDate);
        const existingStart = new Date(existing.startDate);
        const existingEnd = new Date(existing.endDate);
        return instanceStart >= existingStart && instanceStart < existingEnd;
      });

      if (conflicting) {
        conflicts.push({
          date: instance.startDate.split("T")[0],
          conflictingReservation: conflicting,
        });
      }
    }
  });

  return {
    canCreate: conflicts.length === 0,
    conflicts,
    successCount: instances.length - conflicts.length,
    failureCount: conflicts.length,
  };
}

/**
 * Resumen de patrón recurrente en lenguaje natural
 */
export function describeRecurrencePattern(pattern: RecurrencePattern): string {
  let description = "";

  // Frecuencia e intervalo
  switch (pattern.frequency) {
    case "DAILY":
      description =
        pattern.interval === 1
          ? "Todos los días"
          : `Cada ${pattern.interval} días`;
      break;
    case "WEEKLY": {
      const days = pattern.daysOfWeek
        ?.map((d) => {
          const dayMap: Record<string, string> = {
            MONDAY: "Lun",
            TUESDAY: "Mar",
            WEDNESDAY: "Mié",
            THURSDAY: "Jue",
            FRIDAY: "Vie",
            SATURDAY: "Sáb",
            SUNDAY: "Dom",
          };
          return dayMap[d];
        })
        .join(", ");
      description =
        pattern.interval === 1
          ? `Todas las semanas los ${days}`
          : `Cada ${pattern.interval} semanas los ${days}`;
      break;
    }
    case "MONTHLY":
      description =
        pattern.interval === 1
          ? `Todos los meses el día ${pattern.dayOfMonth || "mismo"}`
          : `Cada ${pattern.interval} meses el día ${pattern.dayOfMonth || "mismo"}`;
      break;
  }

  // Fin de recurrencia
  if (pattern.endDate) {
    description += ` hasta el ${format(new Date(pattern.endDate), "dd/MM/yyyy")}`;
  } else if (pattern.occurrences) {
    description += ` por ${pattern.occurrences} veces`;
  }

  return description;
}
