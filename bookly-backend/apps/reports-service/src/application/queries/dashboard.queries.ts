/**
 * Dashboard Queries
 * Queries CQRS para dashboard
 */

import { ReportTrendPeriod } from "@libs/common/enums";

export enum DashboardPeriod {
  TODAY = "today",
  WEEK = "week",
  MONTH = "month",
  LAST_30 = "last30",
  CUSTOM = "custom",
}

export enum DashboardIncludeSection {
  KPIS = "kpis",
  SUMMARY = "summary",
  TREND = "trend",
  ACTIVITY = "activity",
  RECENT_RESERVATIONS = "recentReservations",
  TOP_RESOURCES = "topResources",
}

export interface DashboardFiltersDto {
  from?: string;
  to?: string;
  period?: DashboardPeriod;
  tz?: string;
  resourceTypeId?: string;
  locationId?: string;
  programId?: string;
  include?: DashboardIncludeSection[];
}

export interface DashboardUserContextDto {
  userId?: string;
  roles: string[];
  permissions: string[];
}

export class GetDashboardDataQuery {
  constructor(
    public readonly filters: DashboardFiltersDto,
    public readonly context: DashboardUserContextDto,
  ) {}
}

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
    public readonly endDate: Date,
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
