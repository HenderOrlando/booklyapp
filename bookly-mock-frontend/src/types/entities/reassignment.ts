/**
 * Tipos para Reasignación de Recursos
 */

export type ReassignmentReason =
  | "CONFLICT"
  | "MAINTENANCE"
  | "UPGRADE"
  | "USER_REQUEST"
  | "ADMINISTRATIVE"
  | "EMERGENCY";

export type ReassignmentStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED";

/**
 * Solicitud de reasignación
 */
export interface ResourceReassignment {
  id: string;
  reservationId: string;
  originalResourceId: string;
  originalResourceName: string;
  newResourceId: string;
  newResourceName: string;
  reason: ReassignmentReason;
  reasonDetails?: string;
  status: ReassignmentStatus;
  requestedBy: string;
  requestedByName: string;
  approvedBy?: string;
  approvedByName?: string;
  notifyUser: boolean;
  userNotified: boolean;
  oldStartTime?: string;
  oldEndTime?: string;
  newStartTime?: string; // Si también cambia el horario
  newEndTime?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  completedAt?: string;
}

/**
 * DTO para solicitar reasignación
 */
export interface RequestReassignmentDto {
  reservationId: string;
  newResourceId: string;
  reason: ReassignmentReason;
  reasonDetails?: string;
  newStartTime?: string;
  newEndTime?: string;
  notifyUser?: boolean;
}

/**
 * DTO para responder a reasignación
 */
export interface RespondReassignmentDto {
  reassignmentId: string;
  accepted: boolean;
  newResourceId?: string;
  userFeedback?: string;
  reasonDetails?: string;
  notifyUser?: boolean;
}

/**
 * Respuesta con alternativas
 */
export interface ResourceAlternative {
  resourceId: string;
  resourceName: string;
  resourceType: string;
  similarityScore: number;
  scoreBreakdown: {
    capacity: number;
    features: number;
    location: number;
    availability: number;
  };
  isAvailable: boolean;
  capacity?: number;
  features?: string[];
  location?: string;
  unavailabilityReason?: string;
}

export interface ReassignmentResponseDto {
  originalReservationId: string;
  originalResourceId: string;
  originalResourceName: string;
  alternatives: ResourceAlternative[];
  reason: string;
  totalAlternatives: number;
  bestAlternative: ResourceAlternative | null;
}

/**
 * Historial de reasignaciones
 */
export interface ReassignmentHistoryResponseDto {
  id: string;
  originalReservationId: string;
  originalResource: {
    id: string;
    name: string;
  };
  newResource: {
    id: string;
    name: string;
  };
  userId: string;
  reason: string;
  similarityScore: number;
  scoreBreakdown: {
    capacity: number;
    features: number;
    location: number;
    availability: number;
    total: number;
  };
  alternativesConsidered: string[];
  accepted: boolean;
  userFeedback?: string;
  notificationSent: boolean;
  notifiedAt?: string;
  respondedAt?: string;
  createdAt: string;
}
