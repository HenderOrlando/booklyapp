/**
 * Mock Data - Stockpile Service
 *
 * Datos mock centralizados para el servicio de aprobaciones, check-in/out y documentos.
 * Basado en la arquitectura del proyecto Bookly.
 */

import type {
  ApprovalHistoryEntry,
  ApprovalRequest,
  ApprovalStats,
} from "@/types/entities/approval";
import type {
  ActiveReservationView,
  CheckInOut,
  CheckInOutStats,
  VigilanceAlert,
} from "@/types/entities/checkInOut";

// ============================================
// APPROVAL REQUESTS
// ============================================

export const mockApprovalRequests: ApprovalRequest[] = [
  {
    id: "apr_001",
    reservationId: "res_r001",
    userId: "user_001",
    userName: "Carlos Rodríguez",
    userEmail: "carlos@ufps.edu.co",
    userRole: "Profesor",
    resourceId: "res_001",
    resourceName: "Auditorio Principal",
    resourceType: "Auditorio",
    categoryName: "Espacios Académicos",
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(
      Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
    ).toISOString(),
    purpose: "Conferencia magistral sobre Inteligencia Artificial",
    attendees: 150,
    requiresEquipment: ["Proyector", "Sistema de audio"],
    status: "PENDING",
    priority: "HIGH",
    currentLevel: "FIRST_LEVEL",
    maxLevel: "SECOND_LEVEL",
    requestedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 21 * 60 * 60 * 1000).toISOString(),
    qrCode: "QR_APR_001",
  },
  {
    id: "apr_002",
    reservationId: "res_r002",
    userId: "user_002",
    userName: "María González",
    userEmail: "maria@ufps.edu.co",
    userRole: "Estudiante",
    resourceId: "res_002",
    resourceName: "Sala de Reuniones B",
    resourceType: "Sala",
    categoryName: "Espacios Administrativos",
    startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(
      Date.now() + 1 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000
    ).toISOString(),
    purpose: "Reunión de proyecto de grado",
    attendees: 8,
    status: "PENDING",
    priority: "NORMAL",
    currentLevel: "FIRST_LEVEL",
    maxLevel: "FIRST_LEVEL",
    requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    qrCode: "QR_APR_002",
  },
  {
    id: "apr_003",
    reservationId: "res_r003",
    userId: "user_003",
    userName: "Pedro Sánchez",
    userEmail: "pedro@ufps.edu.co",
    userRole: "Coordinador",
    resourceId: "res_003",
    resourceName: "Laboratorio de Física",
    resourceType: "Laboratorio",
    categoryName: "Espacios Académicos",
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000
    ).toISOString(),
    purpose: "Práctica de laboratorio - Mecánica",
    attendees: 30,
    status: "APPROVED",
    priority: "NORMAL",
    currentLevel: "SECOND_LEVEL",
    maxLevel: "SECOND_LEVEL",
    requestedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    reviewerName: "Dr. López",
    comments: "Aprobado para práctica curricular",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    qrCode: "QR_APR_003",
  },
];

export const mockApprovalHistory: ApprovalHistoryEntry[] = [
  {
    id: "hist_001",
    approvalRequestId: "apr_001",
    action: "SUBMIT",
    performedBy: "user_001",
    performerName: "Carlos Rodríguez",
    performerRole: "Profesor",
    level: "FIRST_LEVEL",
    comments: "Solicitud creada y enviada para revisión",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "hist_002",
    approvalRequestId: "apr_003",
    action: "SUBMIT",
    performedBy: "user_003",
    performerName: "Pedro Sánchez",
    performerRole: "Coordinador",
    level: "FIRST_LEVEL",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "hist_003",
    approvalRequestId: "apr_003",
    action: "APPROVE",
    performedBy: "admin_001",
    performerName: "Dr. López",
    performerRole: "Administrador",
    level: "SECOND_LEVEL",
    comments: "Aprobado para práctica curricular",
    timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockApprovalStats: ApprovalStats = {
  totalPending: 12,
  totalInReview: 8,
  totalApproved: 45,
  totalRejected: 5,
  totalCancelled: 2,
  totalExpired: 3,
  averageApprovalTime: 4.5,
  approvalRate: 90,
  rejectionRate: 10,
  byPriority: {
    low: 10,
    normal: 30,
    high: 12,
    urgent: 3,
  },
  byLevel: {
    firstLevel: 25,
    secondLevel: 20,
    finalLevel: 10,
  },
};

// ============================================
// CHECK-IN / CHECK-OUT
// ============================================

export const mockCheckInOuts: CheckInOut[] = [
  // Reserva activa: ya hizo check-in, pendiente de check-out
  {
    id: "checkin_001",
    reservationId: "rsv_001",
    approvalRequestId: "apr_003",
    resourceId: "res_003",
    userId: "user_001",
    status: "SUCCESS",
    checkInTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    checkInType: "QR",
    expectedReturnTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
    reservationStartTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    reservationEndTime: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
    userName: "Dr. Carlos Rodríguez",
    userEmail: "carlos.rodriguez@ufps.edu.co",
    resourceName: "Laboratorio de Física",
    resourceType: "Laboratorio",
    qrCode: "QR_RSV_001",
    metadata: {
      vigilantId: "vigilante_001",
      vigilantName: "Juan Pérez",
      verificationStatus: "VERIFIED",
      delayMinutes: "0",
    },
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  // Reserva próxima: aún no ha hecho check-in (empieza en 10 min)
  {
    id: "checkin_002",
    reservationId: "rsv_002",
    resourceId: "res_001",
    userId: "user_001",
    status: "PENDING",
    reservationStartTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    reservationEndTime: new Date(Date.now() + 130 * 60 * 1000).toISOString(),
    userName: "Dr. Carlos Rodríguez",
    userEmail: "carlos.rodriguez@ufps.edu.co",
    resourceName: "Auditorio Principal",
    resourceType: "Auditorio",
    qrCode: "QR_RSV_002",
    metadata: {
      qrCode: "QR_RSV_002",
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  // Reserva próxima: aún no ha hecho check-in (empieza en 45 min)
  {
    id: "checkin_003",
    reservationId: "rsv_003",
    resourceId: "res_005",
    userId: "user_001",
    status: "PENDING",
    reservationStartTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    reservationEndTime: new Date(Date.now() + 165 * 60 * 1000).toISOString(),
    userName: "Dr. Carlos Rodríguez",
    userEmail: "carlos.rodriguez@ufps.edu.co",
    resourceName: "Sala de Conferencias 401",
    resourceType: "Sala",
    qrCode: "QR_RSV_003",
    metadata: {
      qrCode: "QR_RSV_003",
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  // Reserva completada: check-in y check-out realizados
  {
    id: "checkin_004",
    reservationId: "rsv_010",
    resourceId: "res_002",
    userId: "user_001",
    status: "SUCCESS",
    checkInTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    checkInType: "MANUAL",
    checkOutTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    checkOutType: "MANUAL",
    reservationStartTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    reservationEndTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    userName: "Dr. Carlos Rodríguez",
    userEmail: "carlos.rodriguez@ufps.edu.co",
    resourceName: "Laboratorio de Sistemas 201",
    resourceType: "Laboratorio",
    qrCode: "QR_RSV_010",
    resourceCondition: {
      beforeCheckIn: "GOOD",
      afterCheckOut: "GOOD",
      damageReported: false,
    },
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockActiveReservations: ActiveReservationView[] = [
  {
    reservationId: "res_001",
    resourceId: "res_003",
    resourceName: "Laboratorio de Física",
    resourceType: "Laboratorio",
    userId: "user_003",
    userName: "Pedro Sánchez",
    userEmail: "pedro@ufps.edu.co",
    startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 150 * 60 * 1000).toISOString(),
    status: "CHECKED_IN",
    checkInId: "checkin_001",
    checkInTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    qrCode: "QR_RES_001",
    canCheckIn: false,
    canCheckOut: true,
  },
  {
    reservationId: "res_002",
    resourceId: "res_001",
    resourceName: "Auditorio Principal",
    resourceType: "Auditorio",
    userId: "user_001",
    userName: "Carlos Rodríguez",
    userEmail: "carlos@ufps.edu.co",
    startTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 150 * 60 * 1000).toISOString(),
    status: "WAITING",
    qrCode: "QR_RES_002",
    canCheckIn: true,
    canCheckOut: false,
  },
];

export const mockVigilanceAlerts: VigilanceAlert[] = [
  {
    id: "alert_001",
    type: "LATE_CHECK_IN",
    severity: "MEDIUM",
    reservationId: "res_003",
    resourceId: "res_002",
    resourceName: "Sala de Juntas A",
    userId: "user_004",
    userName: "Ana Martínez",
    message: "Retraso de 20 minutos en check-in",
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    isResolved: false,
  },
  {
    id: "alert_002",
    type: "NO_CHECK_OUT",
    severity: "HIGH",
    reservationId: "res_004",
    resourceId: "res_004",
    resourceName: "Laboratorio de Computación",
    userId: "user_005",
    userName: "Luis Gómez",
    message: "No se ha realizado check-out - Reserva finalizada hace 30 min",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isResolved: false,
  },
];

export const mockCheckInOutStats: CheckInOutStats = {
  totalCheckIns: 156,
  totalCheckOuts: 142,
  onTimeCheckIns: 140,
  lateCheckIns: 16,
  missedCheckIns: 8,
  averageDelayMinutes: 5.2,
  complianceRate: 89.7,
  byMethod: {
    qr: 120,
    manual: 30,
    automatic: 6,
    biometric: 0,
  },
  byResource: {
    res_001: 45,
    res_002: 38,
    res_003: 32,
  },
  byUser: {
    user_001: 25,
    user_002: 18,
    user_003: 15,
  },
};

// ============================================
// HELPERS
// ============================================

/**
 * Obtiene una solicitud de aprobación por ID
 */
export function getApprovalRequestById(
  id: string
): ApprovalRequest | undefined {
  return mockApprovalRequests.find((req) => req.id === id);
}

/**
 * Obtiene el historial de una solicitud
 */
export function getApprovalHistory(requestId: string): ApprovalHistoryEntry[] {
  return mockApprovalHistory.filter((h) => h.approvalRequestId === requestId);
}

/**
 * Simula aprobar una solicitud
 */
export function mockApproveRequest(
  id: string,
  comments?: string
): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const request = mockApprovalRequests.find((r) => r.id === id);
      if (request) {
        request.status = "APPROVED";
        request.reviewedAt = new Date().toISOString();
        request.comments = comments;

        // Agregar entrada al historial
        mockApprovalHistory.push({
          id: `hist_${Date.now()}`,
          approvalRequestId: id,
          action: "APPROVE",
          performedBy: "current_user",
          performerName: "Usuario Actual",
          level: request.currentLevel,
          comments,
          timestamp: new Date().toISOString(),
        });
      }
      resolve();
    }, 500);
  });
}

/**
 * Simula rechazar una solicitud
 */
export function mockRejectRequest(id: string, reason: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const request = mockApprovalRequests.find((r) => r.id === id);
      if (request) {
        request.status = "REJECTED";
        request.reviewedAt = new Date().toISOString();
        request.rejectionReason = reason;

        // Agregar entrada al historial
        mockApprovalHistory.push({
          id: `hist_${Date.now()}`,
          approvalRequestId: id,
          action: "REJECT",
          performedBy: "current_user",
          performerName: "Usuario Actual",
          level: request.currentLevel,
          reason,
          timestamp: new Date().toISOString(),
        });
      }
      resolve();
    }, 500);
  });
}

/**
 * Simula agregar un comentario
 */
export function mockAddComment(id: string, comment: string): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      mockApprovalHistory.push({
        id: `hist_${Date.now()}`,
        approvalRequestId: id,
        action: "COMMENT",
        performedBy: "current_user",
        performerName: "Usuario Actual",
        level: "FIRST_LEVEL",
        comments: comment,
        timestamp: new Date().toISOString(),
      });
      resolve();
    }, 300);
  });
}

/**
 * Simula check-in
 */
export function mockPerformCheckIn(reservationId: string): Promise<CheckInOut> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const checkIn: CheckInOut = {
        id: `checkin_${Date.now()}`,
        reservationId,
        resourceId: "res_001",
        userId: "current_user",
        status: "SUCCESS",
        checkInTime: new Date().toISOString(),
        checkInType: "MANUAL",
        userName: "Usuario Actual",
        resourceName: "Recurso Mock",
        qrCode: `QR_${reservationId}`,
        metadata: {
          verificationStatus: "VERIFIED",
          scheduledTime: new Date().toISOString(),
          delayMinutes: "0",
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockCheckInOuts.push(checkIn);
      resolve(checkIn);
    }, 500);
  });
}

/**
 * Simula check-out
 */
export function mockPerformCheckOut(
  reservationId: string
): Promise<CheckInOut> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const checkOut: CheckInOut = {
        id: `checkout_${Date.now()}`,
        reservationId,
        resourceId: "res_001",
        userId: "current_user",
        status: "SUCCESS",
        checkOutTime: new Date().toISOString(),
        checkOutType: "MANUAL",
        userName: "Usuario Actual",
        resourceName: "Recurso Mock",
        metadata: {
          verificationStatus: "VERIFIED",
          scheduledTime: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockCheckInOuts.push(checkOut);
      resolve(checkOut);
    }, 500);
  });
}
