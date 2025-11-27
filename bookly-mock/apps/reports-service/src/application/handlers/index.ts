export * from "./dashboard.handlers";
export * from "./evaluation.handlers";
export * from "./export.handlers";
export * from "./feedback.handlers";
export * from "./generate-usage-report.handler";
export * from "./get-demand-reports.handler";
export * from "./get-usage-reports.handler";
export * from "./get-user-reports.handler";

import {
  GetDashboardOverviewHandler,
  GetMainKPIsHandler,
  GetOccupancyMetricsHandler,
  GetResourceComparisonHandler,
  GetTrendAnalysisHandler,
} from "./dashboard.handlers";
import {
  CreateEvaluationHandler,
  DeleteEvaluationHandler,
  GetEvaluationByIdHandler,
  GetEvaluationsByPeriodHandler,
  GetEvaluationsNeedingFollowUpHandler,
  GetGeneralEvaluationStatisticsHandler,
  GetLatestUserEvaluationHandler,
  GetPriorityUsersHandler,
  GetUserEvaluationsHandler,
  GetUserEvaluationStatisticsHandler,
  UpdateEvaluationHandler,
} from "./evaluation.handlers";
import {
  GetExportStatusHandler,
  GetUserExportHistoryHandler,
  RequestExportHandler,
} from "./export.handlers";
import {
  CreateFeedbackHandler,
  DeleteFeedbackHandler,
  GetAllFeedbackHandler,
  GetFeedbackByIdHandler,
  GetFeedbackByStatusHandler,
  GetFeedbackGeneralStatisticsHandler,
  GetFeedbackResourceStatisticsHandler,
  GetResourceFeedbackHandler,
  GetUserFeedbackHandler,
  RespondToFeedbackHandler,
  UpdateFeedbackStatusHandler,
} from "./feedback.handlers";
import { GenerateUsageReportHandler } from "./generate-usage-report.handler";
import { GetDemandReportsHandler } from "./get-demand-reports.handler";
import { GetUsageReportsHandler } from "./get-usage-reports.handler";
import { GetUserReportsHandler } from "./get-user-reports.handler";

export const AllHandlers = [
  // Dashboard Handlers
  GetDashboardOverviewHandler,
  GetOccupancyMetricsHandler,
  GetTrendAnalysisHandler,
  GetResourceComparisonHandler,
  GetMainKPIsHandler,
  // Evaluation Handlers
  CreateEvaluationHandler,
  UpdateEvaluationHandler,
  DeleteEvaluationHandler,
  GetEvaluationByIdHandler,
  GetUserEvaluationsHandler,
  GetLatestUserEvaluationHandler,
  GetEvaluationsByPeriodHandler,
  GetPriorityUsersHandler,
  GetEvaluationsNeedingFollowUpHandler,
  GetUserEvaluationStatisticsHandler,
  GetGeneralEvaluationStatisticsHandler,
  // Export Handlers
  RequestExportHandler,
  GetExportStatusHandler,
  GetUserExportHistoryHandler,
  // Feedback Handlers
  CreateFeedbackHandler,
  RespondToFeedbackHandler,
  UpdateFeedbackStatusHandler,
  DeleteFeedbackHandler,
  GetFeedbackByIdHandler,
  GetUserFeedbackHandler,
  GetResourceFeedbackHandler,
  GetFeedbackByStatusHandler,
  GetAllFeedbackHandler,
  GetFeedbackResourceStatisticsHandler,
  GetFeedbackGeneralStatisticsHandler,
  // Report Handlers
  GenerateUsageReportHandler,
  GetDemandReportsHandler,
  GetUsageReportsHandler,
  GetUserReportsHandler,
];
