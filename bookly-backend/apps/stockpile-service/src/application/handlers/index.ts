// Command Handlers
export * from "./activate-approval-flow.handler";
export * from "./approve-step.handler";
export * from "./cancel-approval-request.handler";
export * from "./check-in.handler";
export * from "./check-out.handler";
export * from "./create-approval-flow.handler";
export * from "./create-approval-request.handler";
export * from "./deactivate-approval-flow.handler";
export * from "./delete-approval-flow.handler";
export * from "./delete-approval-request.handler";
export * from "./reject-step.handler";
export * from "./update-approval-flow.handler";

// Query Handlers
export * from "./get-active-today-approvals.handler";
export * from "./get-approval-flow-by-id.handler";
export * from "./get-approval-flows.handler";
export * from "./get-approval-request-by-id.handler";
export * from "./get-approval-requests.handler";
export * from "./get-approval-statistics.handler";

import { ActivateApprovalFlowHandler } from "./activate-approval-flow.handler";
import { ApproveStepHandler } from "./approve-step.handler";
import { CancelApprovalRequestHandler } from "./cancel-approval-request.handler";
import { CheckInHandler } from "./check-in.handler";
import { CheckOutHandler } from "./check-out.handler";
import { CreateApprovalFlowHandler } from "./create-approval-flow.handler";
import { CreateApprovalRequestHandler } from "./create-approval-request.handler";
import { DeactivateApprovalFlowHandler } from "./deactivate-approval-flow.handler";
import { DeleteApprovalFlowHandler } from "./delete-approval-flow.handler";
import { DeleteApprovalRequestHandler } from "./delete-approval-request.handler";
import { GetActiveTodayApprovalsHandler } from "./get-active-today-approvals.handler";
import { GetApprovalFlowByIdHandler } from "./get-approval-flow-by-id.handler";
import { GetApprovalFlowsHandler } from "./get-approval-flows.handler";
import { GetApprovalRequestByIdHandler } from "./get-approval-request-by-id.handler";
import { GetApprovalRequestsHandler } from "./get-approval-requests.handler";
import { GetApprovalStatisticsHandler } from "./get-approval-statistics.handler";
import { RejectStepHandler } from "./reject-step.handler";
import { UpdateApprovalFlowHandler } from "./update-approval-flow.handler";

/**
 * All Handlers
 * Array de todos los handlers para inyección en el módulo
 */
export const AllHandlers = [
  // Command Handlers
  ApproveStepHandler,
  CancelApprovalRequestHandler,
  CheckInHandler,
  CheckOutHandler,
  CreateApprovalFlowHandler,
  CreateApprovalRequestHandler,
  DeactivateApprovalFlowHandler,
  ActivateApprovalFlowHandler,
  DeleteApprovalFlowHandler,
  DeleteApprovalRequestHandler,
  RejectStepHandler,
  UpdateApprovalFlowHandler,

  // Query Handlers
  GetActiveTodayApprovalsHandler,
  GetApprovalFlowByIdHandler,
  GetApprovalFlowsHandler,
  GetApprovalRequestByIdHandler,
  GetApprovalRequestsHandler,
  GetApprovalStatisticsHandler,
];
