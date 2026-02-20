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
 * DTO para aprobar/rechazar reasignación
 */
export interface ProcessReassignmentDto {
  reassignmentId: string;
  approved: boolean;
  notes?: string;
}

/**
 * Opciones de reasignación sugeridas
 */
export interface ReassignmentSuggestion {
  resourceId: string;
  resourceName: string;
  resourceType: string;
  capacity: number;
  location: string;
  available: boolean;
  matchScore: number; // 0-100, qué tan similar es al recurso original
  attributes: Record<string, unknown>;
}
