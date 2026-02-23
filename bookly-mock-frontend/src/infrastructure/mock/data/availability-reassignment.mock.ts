/**
 * Datos Mock para Reasignaciones (RF-15)
 * Alineados con bookly-mock/apps/availability-service
 */

import type { ReassignmentHistoryResponseDto } from "@/types/entities/reassignment";

// ============================================
// REASSIGNMENT HISTORY
// ============================================

export const mockReassignmentHistory: ReassignmentHistoryResponseDto[] = [
  // Pendientes (sin respondedAt)
  {
    id: "reass_001",
    originalReservationId: "rsv_002",
    originalResource: {
      id: "res_002",
      name: "Laboratorio de Sistemas 201",
    },
    newResource: {
      id: "res_005",
      name: "Laboratorio de Sistemas 301",
    },
    userId: "user_003",
    reason: "MAINTENANCE",
    similarityScore: 87,
    scoreBreakdown: {
      capacity: 90,
      features: 85,
      location: 80,
      availability: 95,
      total: 87,
    },
    alternativesConsidered: ["res_005", "res_006", "res_007"],
    accepted: false,
    notificationSent: true,
    notifiedAt: "2025-11-22T10:00:00",
    createdAt: "2025-11-22T09:30:00",
  },
  {
    id: "reass_002",
    originalReservationId: "rsv_004",
    originalResource: {
      id: "res_003",
      name: "Auditorio Principal",
    },
    newResource: {
      id: "res_008",
      name: "Auditorio Secundario B",
    },
    userId: "user_001",
    reason: "EMERGENCY",
    similarityScore: 72,
    scoreBreakdown: {
      capacity: 65,
      features: 80,
      location: 70,
      availability: 75,
      total: 72,
    },
    alternativesConsidered: ["res_008", "res_009"],
    accepted: false,
    notificationSent: true,
    notifiedAt: "2025-11-23T08:15:00",
    createdAt: "2025-11-23T08:00:00",
  },
  // Respondidas (con respondedAt)
  {
    id: "reass_003",
    originalReservationId: "rsv_001",
    originalResource: {
      id: "res_001",
      name: "Aula 101",
    },
    newResource: {
      id: "res_004",
      name: "Aula 103",
    },
    userId: "user_002",
    reason: "CONFLICT",
    similarityScore: 92,
    scoreBreakdown: {
      capacity: 95,
      features: 90,
      location: 88,
      availability: 96,
      total: 92,
    },
    alternativesConsidered: ["res_004", "res_010"],
    accepted: true,
    userFeedback: "El aula alternativa es adecuada para la clase.",
    notificationSent: true,
    notifiedAt: "2025-11-20T14:00:00",
    respondedAt: "2025-11-20T15:30:00",
    createdAt: "2025-11-20T13:45:00",
  },
  {
    id: "reass_004",
    originalReservationId: "rsv_005",
    originalResource: {
      id: "res_006",
      name: "Sala de Conferencias 401",
    },
    newResource: {
      id: "res_011",
      name: "Sala de Reuniones 202",
    },
    userId: "user_001",
    reason: "UPGRADE",
    similarityScore: 68,
    scoreBreakdown: {
      capacity: 55,
      features: 75,
      location: 70,
      availability: 72,
      total: 68,
    },
    alternativesConsidered: ["res_011", "res_012"],
    accepted: false,
    userFeedback: "La capacidad no es suficiente para el evento.",
    notificationSent: true,
    notifiedAt: "2025-11-19T11:00:00",
    respondedAt: "2025-11-19T16:00:00",
    createdAt: "2025-11-19T10:30:00",
  },
];

/**
 * Obtener historial filtrado por pending
 */
export function getFilteredReassignmentHistory(
  pending?: boolean,
): ReassignmentHistoryResponseDto[] {
  if (pending === true) {
    return mockReassignmentHistory.filter((h) => !h.respondedAt);
  }
  if (pending === false) {
    return mockReassignmentHistory.filter((h) => !!h.respondedAt);
  }
  return mockReassignmentHistory;
}

/**
 * Responder a una reasignación mock
 */
export function respondToMockReassignment(
  reassignmentId: string,
  accepted: boolean,
  userFeedback?: string,
): ReassignmentHistoryResponseDto | null {
  const entry = mockReassignmentHistory.find((h) => h.id === reassignmentId);
  if (!entry) return null;

  entry.accepted = accepted;
  entry.respondedAt = new Date().toISOString();
  if (userFeedback) {
    entry.userFeedback = userFeedback;
  }

  return entry;
}
