import { AddToWaitingListHandler } from "./add-to-waiting-list.handler";
import { CancelMaintenanceBlockHandler } from "./cancel-maintenance-block.handler";
import { CancelRecurringInstanceHandler } from "./cancel-recurring-instance.handler";
import { CancelRecurringSeriesHandler } from "./cancel-recurring-series.handler";
import { CancelReservationHandler } from "./cancel-reservation.handler";
import { CancelWaitingListHandler } from "./cancel-waiting-list.handler";
import { CheckAvailabilityHandler } from "./check-availability.handler";
import { CheckInReservationHandler } from "./check-in-reservation.handler";
import { CheckOutReservationHandler } from "./check-out-reservation.handler";
import { CompleteMaintenanceBlockHandler } from "./complete-maintenance-block.handler";
import { CreateAvailabilityExceptionHandler } from "./create-availability-exception.handler";
import { CreateAvailabilityHandler } from "./create-availability.handler";
import { CreateBatchReservationHandler } from "./create-batch-reservation.handler";
import { CreateMaintenanceBlockHandler } from "./create-maintenance-block.handler";
import { CreateRecurringReservationHandler } from "./create-recurring-reservation.handler";
import { CreateReservationHandler } from "./create-reservation.handler";
import { DeleteAvailabilityExceptionHandler } from "./delete-availability-exception.handler";
import { DeleteAvailabilityHandler } from "./delete-availability.handler";
import { GetAvailabilityExceptionsHandler } from "./get-availability-exceptions.handler";
import { GetCalendarViewHandler } from "./get-calendar-view.handler";
import { GetMaintenanceBlocksHandler } from "./get-maintenance-blocks.handler";
import { GetReassignmentHistoryHandler } from "./get-reassignment-history.handler";
import { GetRecurringAnalyticsHandler } from "./get-recurring-analytics.handler";
import { GetRecurringSeriesHandler } from "./get-recurring-series.handler";
import { GetReservationHistoryHandler } from "./get-reservation-history.handler";
import { GetReservationsHandler } from "./get-reservations.handler";
import { GetUserActivityHandler } from "./get-user-activity.handler";
import { GetUserRecurringReservationsHandler } from "./get-user-recurring-reservations.handler";
import { ModifyRecurringInstanceHandler } from "./modify-recurring-instance.handler";
import { PreviewRecurringSeriesHandler } from "./preview-recurring-series.handler";
import { RequestReassignmentHandler } from "./request-reassignment.handler";
import { RequestTeacherApprovalHandler } from "./request-teacher-approval.handler";
import { RespondReassignmentHandler } from "./respond-reassignment.handler";
import { SearchAvailabilityHandler } from "./search-availability.handler";
import { UpdateRecurringSeriesHandler } from "./update-recurring-series.handler";
import { UpdateReservationHandler } from "./update-reservation.handler";

export const AllHandlers = [
  // Command Handlers
  CreateReservationHandler,
  UpdateReservationHandler,
  CancelReservationHandler,
  CheckInReservationHandler,
  CheckOutReservationHandler,
  CreateAvailabilityHandler,
  AddToWaitingListHandler,
  CreateRecurringReservationHandler,
  UpdateRecurringSeriesHandler,
  CancelRecurringSeriesHandler,
  CancelRecurringInstanceHandler,
  ModifyRecurringInstanceHandler,
  CreateAvailabilityExceptionHandler,
  DeleteAvailabilityExceptionHandler,
  CreateMaintenanceBlockHandler,
  CompleteMaintenanceBlockHandler,
  CancelMaintenanceBlockHandler,
  RequestReassignmentHandler,
  RespondReassignmentHandler,
  CreateBatchReservationHandler,
  RequestTeacherApprovalHandler,
  DeleteAvailabilityHandler,
  CancelWaitingListHandler,

  // Query Handlers
  GetReservationsHandler,
  CheckAvailabilityHandler,
  SearchAvailabilityHandler,
  GetRecurringSeriesHandler,
  GetUserRecurringReservationsHandler,
  PreviewRecurringSeriesHandler,
  GetRecurringAnalyticsHandler,
  GetReservationHistoryHandler,
  GetUserActivityHandler,
  GetCalendarViewHandler,
  GetAvailabilityExceptionsHandler,
  GetMaintenanceBlocksHandler,
  GetReassignmentHistoryHandler,
];

export * from "./add-to-waiting-list.handler";
export * from "./cancel-maintenance-block.handler";
export * from "./cancel-recurring-instance.handler";
export * from "./cancel-recurring-series.handler";
export * from "./cancel-reservation.handler";
export * from "./check-availability.handler";
export * from "./check-in-reservation.handler";
export * from "./check-out-reservation.handler";
export * from "./complete-maintenance-block.handler";
export * from "./create-availability-exception.handler";
export * from "./create-availability.handler";
export * from "./create-batch-reservation.handler";
export * from "./create-maintenance-block.handler";
export * from "./create-recurring-reservation.handler";
export * from "./create-reservation.handler";
export * from "./delete-availability-exception.handler";
export * from "./get-availability-exceptions.handler";
export * from "./get-calendar-view.handler";
export * from "./get-maintenance-blocks.handler";
export * from "./get-reassignment-history.handler";
export * from "./get-recurring-analytics.handler";
export * from "./get-recurring-series.handler";
export * from "./get-reservation-history.handler";
export * from "./get-reservations.handler";
export * from "./get-user-activity.handler";
export * from "./get-user-recurring-reservations.handler";
export * from "./modify-recurring-instance.handler";
export * from "./preview-recurring-series.handler";
export * from "./request-reassignment.handler";
export * from "./request-teacher-approval.handler";
export * from "./respond-reassignment.handler";
export * from "./search-availability.handler";
export * from "./update-recurring-series.handler";
export * from "./update-reservation.handler";
