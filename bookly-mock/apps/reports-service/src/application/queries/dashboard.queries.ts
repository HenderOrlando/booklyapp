/**
 * Dashboard Queries
 * Queries CQRS para dashboard
 */

import { ReportTrendPeriod } from "@libs/common/enums";

/**
 * Get Dashboard Overview Query
 */
export class GetDashboardOverviewQuery {
  constructor() {}
}

/**
 * Get Occupancy Metrics Query
 */
export class GetOccupancyMetricsQuery {
  constructor() {}
}

/**
 * Get Trend Analysis Query
 */
export class GetTrendAnalysisQuery {
  constructor(
    public readonly period: ReportTrendPeriod,
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {}
}

/**
 * Get Resource Comparison Query
 */
export class GetResourceComparisonQuery {
  constructor(public readonly resourceIds: string[]) {}
}

/**
 * Get Main KPIs Query
 */
export class GetMainKPIsQuery {
  constructor() {}
}
