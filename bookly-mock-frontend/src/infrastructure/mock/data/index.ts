/**
 * Mock Data Index
 * Centraliza todas las exportaciones de datos mock
 *
 * NOTA: Usa exportaciones específicas para evitar conflictos de nombres
 * entre diferentes servicios (ej: mockUsers, mockDelay)
 */

// ============================================
// AUTH SERVICE
// ============================================
export {
  currentMockUser,
  getMockLoginResponse,
  mockCredentials,
  mockPermissions,
  mockRoles,
  mockRolesExtended,
  mockUsers,
  mockUsersExtended,
} from "./auth-service.mock";

// ============================================
// AUDIT SERVICE (Sistema transversal)
// ============================================
export { addAuditLog, getFilteredAuditLogs, mockAuditLogs } from "./audit.mock";

// ============================================
// RESOURCES SERVICE
// ============================================
export {
  mockAcademicPrograms,
  mockCategories,
  mockMaintenances,
  mockProgramResourceAssociations,
  mockProgramUserAssociations,
  mockResources,
} from "./resources-service.mock";

// ============================================
// RESERVATIONS SERVICE
// ============================================
export {
  mockReservations,
  mockResourcesForReservations,
} from "./reservations-service.mock";

// ============================================
// STOCKPILE SERVICE
// ============================================
export {
  getApprovalHistory,
  getApprovalRequestById,
  mockActiveReservations,
  mockAddComment,
  mockApprovalHistory,
  mockApprovalRequests,
  mockApprovalStats,
  mockApproveRequest,
  mockCheckInOutStats,
  mockCheckInOuts,
  mockPerformCheckIn,
  mockPerformCheckOut,
  mockRejectRequest,
  mockVigilanceAlerts,
} from "./stockpile-service.mock";

// ============================================
// UTILIDADES COMUNES
// ============================================

// ============================================
// REPORTS SERVICE
// ============================================
export {
  mockDashboardAggregatedResponse,
  mockDashboardData,
  mockDemandReport,
  mockKPIs,
  mockKPIsWithTotalUsers,
  mockResourceReport,
  mockResourceUtilization,
  mockUsageReport,
  mockUserReports,
} from "./reports-service.mock";

/**
 * Delay simulado para llamadas mock
 * Unificado para evitar duplicación
 */
export const mockDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));
