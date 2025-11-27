import { createLogger } from "@libs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import {
  GetDashboardOverviewQuery,
  GetMainKPIsQuery,
  GetOccupancyMetricsQuery,
  GetResourceComparisonQuery,
  GetTrendAnalysisQuery,
} from "../queries/dashboard.queries";
import { DashboardService } from "../services";

const logger = createLogger("DashboardHandlers");

/**
 * Get Dashboard Overview Handler
 */
@QueryHandler(GetDashboardOverviewQuery)
export class GetDashboardOverviewHandler
  implements IQueryHandler<GetDashboardOverviewQuery>
{
  constructor(private readonly dashboardService: DashboardService) {}

  async execute(query: GetDashboardOverviewQuery): Promise<any> {
    logger.info("Executing GetDashboardOverviewQuery");
    return await this.dashboardService.getOverview();
  }
}

/**
 * Get Occupancy Metrics Handler
 */
@QueryHandler(GetOccupancyMetricsQuery)
export class GetOccupancyMetricsHandler
  implements IQueryHandler<GetOccupancyMetricsQuery>
{
  constructor(private readonly dashboardService: DashboardService) {}

  async execute(query: GetOccupancyMetricsQuery): Promise<any> {
    logger.info("Executing GetOccupancyMetricsQuery");
    return await this.dashboardService.getOccupancyMetrics();
  }
}

/**
 * Get Trend Analysis Handler
 */
@QueryHandler(GetTrendAnalysisQuery)
export class GetTrendAnalysisHandler
  implements IQueryHandler<GetTrendAnalysisQuery>
{
  constructor(private readonly dashboardService: DashboardService) {}

  async execute(query: GetTrendAnalysisQuery): Promise<any> {
    logger.info("Executing GetTrendAnalysisQuery", {
      period: query.period,
      startDate: query.startDate,
      endDate: query.endDate,
    });

    return await this.dashboardService.getTrendAnalysis(
      query.period,
      query.startDate,
      query.endDate
    );
  }
}

/**
 * Get Resource Comparison Handler
 */
@QueryHandler(GetResourceComparisonQuery)
export class GetResourceComparisonHandler
  implements IQueryHandler<GetResourceComparisonQuery>
{
  constructor(private readonly dashboardService: DashboardService) {}

  async execute(query: GetResourceComparisonQuery): Promise<any> {
    logger.info("Executing GetResourceComparisonQuery", {
      resourceCount: query.resourceIds.length,
    });

    return await this.dashboardService.compareResources(query.resourceIds);
  }
}

/**
 * Get Main KPIs Handler
 */
@QueryHandler(GetMainKPIsQuery)
export class GetMainKPIsHandler implements IQueryHandler<GetMainKPIsQuery> {
  constructor(private readonly dashboardService: DashboardService) {}

  async execute(query: GetMainKPIsQuery): Promise<any> {
    logger.info("Executing GetMainKPIsQuery");
    return await this.dashboardService.getMainKPIs();
  }
}
