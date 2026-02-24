/**
 * Mutations Index - Exportación centralizada de hooks de mutations
 *
 * 🎯 11 DOMINIOS COMPLETOS:
 * - Reservations: Reservas y disponibilidad (4 hooks)
 * - Resources: Recursos físicos (5 hooks)
 * - Categories: Categorías de recursos (3 hooks)
 * - Programs: Programas académicos (4 hooks)
 * - Users: Usuarios y perfiles (4 hooks)
 * - Waitlist: Lista de espera (5 hooks)
 * - Approvals: Flujo de aprobaciones (5 hooks)
 * - Reports: Reportes y análisis (7 hooks)
 * - Maintenance: Mantenimiento (7 hooks)
 * - Notifications: Notificaciones (4 hooks)
 * - Roles: Gestión de roles y permisos (5 hooks)
 *
 * 📊 TOTAL: 53 hooks de mutations + 7 queries = 60 hooks
 *
 * Todos los hooks usan React Query (TanStack Query) para:
 * - Gestión automática de estados (loading, error, success)
 * - Cache e invalidación inteligente
 * - Reintentos automáticos
 * - Optimistic updates (preparado)
 */

// ============================================
// RESERVATIONS DOMAIN
// ============================================

export {
  useCancelReservation,
  useCreateReservation,
  useDeleteReservation,
  useUpdateReservation,
} from "./useReservationMutations";

// ============================================
// RESOURCES DOMAIN
// ============================================

export {
  useCreateResource,
  useDeleteResource,
  useImportResources,
  useScheduleMaintenance,
  useUpdateResource,
  type CreateResourceDto,
  type UpdateResourceDto,
} from "./useResourceMutations";

// ============================================
// CATEGORIES DOMAIN
// ============================================

export {
  categoryKeys,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
  type CreateCategoryDto,
  type UpdateCategoryDto,
} from "./useCategoryMutations";

// ============================================
// PROGRAMS DOMAIN
// ============================================

export {
  programKeys,
  useAssignResourcesToProgram,
  useCreateProgram,
  useDeleteProgram,
  useUpdateProgram,
  type CreateProgramDto,
  type UpdateProgramDto,
} from "./useProgramMutations";

// ============================================
// USERS DOMAIN
// ============================================

export {
  useChangePassword,
  userKeys,
  useUpdateUserPreferences,
  useUpdateUserProfile,
  useUploadProfilePhoto,
  type ChangePasswordDto,
  type UpdateUserProfileDto,
} from "./useUserMutations";

// ============================================
// WAITLIST DOMAIN
// ============================================

export {
  useAcceptWaitlistOffer,
  useAddToWaitlist,
  useNotifyWaitlist,
  useRemoveFromWaitlist,
  useUpdateWaitlistPriority,
  waitlistKeys,
  type AddToWaitlistDto,
  type UpdateWaitlistPositionDto,
} from "./useWaitlistMutations";

// ============================================
// APPROVALS DOMAIN
// ============================================

export {
  approvalKeys,
  useApproveReservation,
  useBatchApprove,
  useReassignApproval,
  useRejectReservation,
  useRequestAdditionalInfo,
  type ApproveReservationDto,
  type RejectReservationDto,
  type RequestInfoDto,
} from "./useApprovalMutations";

// ============================================
// REPORTS DOMAIN
// ============================================

export {
  reportKeys,
  useDeleteReport,
  useDeleteScheduledReport,
  useExportReport,
  useGenerateReport,
  useScheduleReport,
  useShareReport,
  useUpdateScheduledReport,
  type ExportReportDto,
  type GenerateReportDto,
  type ScheduleReportDto,
} from "./useReportMutations";

// ============================================
// MAINTENANCE DOMAIN
// ============================================

export {
  maintenanceKeys,
  useAssignTechnician,
  useCancelMaintenance,
  useCompleteMaintenance,
  useCreateMaintenance,
  useReportMaintenanceIncident,
  useRescheduleMaintenance,
  useUpdateMaintenance,
  type CompleteMaintenanceDto,
  type CreateMaintenanceDto,
  type UpdateMaintenanceDto,
} from "./useMaintenanceMutations";

// ============================================
// NOTIFICATIONS DOMAIN
// ============================================

export {
  notificationKeys,
  useDeleteNotification,
  useMarkAllAsRead,
  useMarkAsRead,
  useSendNotification,
  type SendNotificationDto,
} from "./useNotificationMutations";

// ============================================
// FEEDBACK DOMAIN
// ============================================

export {
  feedbackKeys,
  useCreateEvaluation,
  useCreateFeedback,
  useDeleteFeedback,
  useUpdateEvaluation,
  useUpdateFeedback,
} from "./useFeedbackMutations";

// ============================================
// ROLES DOMAIN
// ============================================

export {
  roleKeys,
  useAssignRole,
  useCreateRole,
  useDeleteRole,
  useRevokeRole,
  useUpdateRole,
  type AssignRoleDto,
  type CreateRoleDto,
} from "./useRoleMutations";
