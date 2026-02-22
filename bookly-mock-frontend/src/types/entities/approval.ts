/**
 * Tipos para Sistema de Aprobaciones (Stockpile Service)
 */

export type ApprovalStatus =
  | "PENDING" // Pendiente de revisión
  | "IN_REVIEW" // En revisión por aprobador
  | "APPROVED" // Aprobada y lista
  | "REJECTED" // Rechazada
  | "CANCELLED" // Cancelada por usuario
  | "EXPIRED"; // Expirada por timeout

export type ApprovalLevel =
  | "FIRST_LEVEL" // Primer nivel (jefe de programa/coordinador)
  | "SECOND_LEVEL" // Segundo nivel (decano/director)
  | "FINAL_LEVEL"; // Nivel final (rectoría/vicerrectoría)

export type ApprovalPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

/**
 * Solicitud de aprobación para una reserva
 */
export interface ApprovalRequest {
  id: string;
  reservationId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole?: string;
  resourceId: string;
  resourceName: string;
  resourceType?: string;
  categoryId?: string;
  categoryName?: string;
  programId?: string;
  programName?: string;
  startDate: string;
  endDate: string;
  purpose: string; // Propósito/motivo de la reserva
  attendees: number;
  requiresEquipment?: string[]; // Equipamiento adicional requerido
  specialRequirements?: string; // Requisitos especiales
  status: ApprovalStatus;
  priority: ApprovalPriority;
  currentLevel: ApprovalLevel;
  maxLevel: ApprovalLevel; // Nivel máximo requerido
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerName?: string;
  reviewerRole?: string;
  comments?: string;
  rejectionReason?: string;
  documentUrl?: string; // URL del documento generado (PDF)
  qrCode?: string; // Código QR para check-in
  expiresAt?: string; // Fecha de expiración si no se aprueba
  notificationsSent?: number; // Contador de notificaciones enviadas
  history?: ApprovalHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Entrada del historial de aprobaciones
 */
export interface ApprovalHistoryEntry {
  id: string;
  approvalRequestId: string;
  action: ApprovalActionType;
  performedBy: string;
  performerName: string;
  performerRole?: string;
  level: ApprovalLevel;
  comments?: string;
  reason?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Acción de aprobación
 */
export type ApprovalActionType =
  | "SUBMIT" // Enviar solicitud
  | "APPROVE" // Aprobar
  | "REJECT" // Rechazar
  | "REQUEST_CHANGES" // Solicitar cambios
  | "DELEGATE" // Delegar a otro aprobador
  | "ESCALATE" // Escalar a siguiente nivel
  | "CANCEL" // Cancelar solicitud
  | "COMMENT" // Agregar comentario
  | "GENERATE_DOCUMENT"; // Generar documento

/**
 * DTO para realizar una acción de aprobación
 */
export interface ApprovalActionDto {
  action: ApprovalActionType;
  comments: string;
  nextLevel?: ApprovalLevel;
  delegateToUserId?: string;
  notifyUser?: boolean;
  generateDocument?: boolean;
  sendEmail?: boolean;
  rejectionReason?: string;
}

/**
 * Configuración de flujo de aprobaciones
 */
export interface ApprovalFlowConfig {
  id: string;
  name: string;
  description?: string;
  resourceTypes: string[]; // Tipos de recursos que usan este flujo
  steps: ApprovalStepConfig[];
  autoApproveConditions?: Record<string, unknown>; // Condiciones para auto-aprobación
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Configuración de paso de aprobación
 */
export interface ApprovalStepConfig {
  name: string;
  description?: string;
  approverRoles: string[]; // Roles que pueden aprobar en este paso
  order: number;
  isRequired: boolean;
  allowParallel: boolean;
  timeoutHours?: number; // Opcional, para el frontend
}

/**
 * Estadísticas de aprobaciones
 */
export interface ApprovalStats {
  totalPending: number;
  totalInReview: number;
  totalApproved: number;
  totalRejected: number;
  totalCancelled: number;
  totalExpired: number;
  averageApprovalTime: number; // En minutos
  byLevel: {
    firstLevel: number;
    secondLevel: number;
    finalLevel: number;
  };
  byPriority: {
    low: number;
    normal: number;
    high: number;
    urgent: number;
  };
  approvalRate: number; // Porcentaje de aprobadas vs total
  rejectionRate: number; // Porcentaje de rechazadas vs total
}

/**
 * Filtros para consultar solicitudes de aprobación
 */
export interface ApprovalFilters {
  status?: ApprovalStatus | ApprovalStatus[];
  level?: ApprovalLevel;
  priority?: ApprovalPriority;
  userId?: string;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
  reviewerId?: string;
  programId?: string;
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string; // Búsqueda por texto
}

/**
 * DTO para crear solicitud de aprobación
 */
export interface CreateApprovalRequestDto {
  reservationId: string;
  requesterId: string;
  approvalFlowId: string;
  metadata?: Record<string, any>;
  
  // Legacy fields for backward compatibility in UI
  purpose?: string;
  attendees?: number;
  requiresEquipment?: string[];
  specialRequirements?: string;
  priority?: ApprovalPriority;
  preferredLevel?: ApprovalLevel;
}

/**
 * DTO para actualizar solicitud
 */
export interface UpdateApprovalRequestDto {
  id: string;
  purpose?: string;
  attendees?: number;
  requiresEquipment?: string[];
  specialRequirements?: string;
  priority?: ApprovalPriority;
}
