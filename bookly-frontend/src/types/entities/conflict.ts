/**
 * Tipos para Conflictos de Disponibilidad
 */

export type ConflictType =
  | "TIME_OVERLAP"
  | "RESOURCE_UNAVAILABLE"
  | "MAINTENANCE_SCHEDULED"
  | "CAPACITY_EXCEEDED"
  | "PERMISSION_DENIED"
  | "OUTSIDE_AVAILABILITY";

export type ConflictSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ConflictResolution =
  | "MANUAL"
  | "AUTO_REASSIGN"
  | "WAITLIST"
  | "CANCEL";

/**
 * Conflicto de disponibilidad
 */
export interface AvailabilityConflict {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  reservationId?: string; // Reserva afectada
  resourceId: string;
  resourceName: string;
  conflictingReservationId?: string; // Otra reserva que causa el conflicto
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  suggestedResolution?: ConflictResolution;
  alternativeResources?: Array<{
    resourceId: string;
    resourceName: string;
    available: boolean;
  }>;
  alternativeTimeSlots?: Array<{
    startTime: string;
    endTime: string;
    available: boolean;
  }>;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO para detectar conflictos
 */
export interface CheckConflictsDto {
  resourceId: string;
  date: string;
  startTime: string;
  endTime: string;
  excludeReservationId?: string; // Excluir al editar
}

/**
 * DTO para resolver conflicto
 */
export interface ResolveConflictDto {
  conflictId: string;
  resolution: ConflictResolution;
  newResourceId?: string; // Si se reasigna
  newStartTime?: string; // Si se cambia horario
  newEndTime?: string;
  notes?: string;
}
