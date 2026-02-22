import { createLogger, PermissionUtil } from "@libs/common";
import {
  EventType,
  ReportMetricType,
  ReportTrendPeriod,
  ReportTrendType,
} from "@libs/common/enums";
import { EventStoreService, StoredEvent } from "@libs/event-bus";
import { RedisService } from "@libs/redis";
import {
  BadRequestException,
  Inject,
  Injectable,
  Optional,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { SpanStatusCode, trace } from "@opentelemetry/api";
import {
  DashboardFiltersDto,
  DashboardIncludeSection,
  DashboardPeriod,
  DashboardUserContextDto,
} from "@reports/application/queries/dashboard.queries";
import { DashboardMetricEntity } from "@reports/domain/entities";
import { IDashboardMetricRepository } from "@reports/domain/repositories/dashboard-metric.repository.interface";
import { ResourceCache } from "@reports/infrastructure/schemas/resource-cache.schema";
import { UsageReport } from "@reports/infrastructure/schemas/usage-report.schema";
import { UserFeedback } from "@reports/infrastructure/schemas/user-feedback.schema";
import { Model } from "mongoose";
import { MetricsAggregationService } from "./metrics-aggregation.service";
import { TrendAnalysisService } from "./trend-analysis.service";

const logger = createLogger("DashboardService");
const tracer = trace.getTracer("reports-service-dashboard");

const DASHBOARD_CACHE_PREFIX = "reports:dashboard";
const DASHBOARD_CACHE_TTL_SECONDS = 30;
const DASHBOARD_REFRESH_SECONDS = 15;
const DASHBOARD_WEBSOCKET_EVENT = "dashboard:metrics:updated";
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;

const DEFAULT_INCLUDE_SECTIONS: DashboardIncludeSection[] = [
  DashboardIncludeSection.KPIS,
  DashboardIncludeSection.SUMMARY,
  DashboardIncludeSection.TREND,
  DashboardIncludeSection.ACTIVITY,
  DashboardIncludeSection.RECENT_RESERVATIONS,
  DashboardIncludeSection.TOP_RESOURCES,
];

interface NormalizedDashboardFilters {
  from: Date;
  to: Date;
  period: DashboardPeriod;
  tz: string;
  include: DashboardIncludeSection[];
  resourceTypeId?: string;
  locationId?: string;
  programId?: string;
}

interface DashboardUsageAggregate {
  totalReservations: number;
  confirmedReservations: number;
  cancelledReservations: number;
  completedReservations: number;
  noShowReservations: number;
  totalHoursUsed: number;
  averageOccupancyRate: number;
}

export interface DashboardKpisDto {
  totalReservations: number;
  activeReservations: number;
  pendingApprovals: number;
  totalResources: number;
  availableResources: number;
  utilizationRate: number;
  satisfactionRate: number;
  delta: {
    totalReservationsPct: number;
    activeReservationsPct: number;
    pendingApprovalsPct: number;
    utilizationRatePct: number;
    satisfactionRatePct: number;
  };
}

export interface DashboardReservationSummaryDto {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  completed: number;
}

export interface DashboardTrendPointDto {
  date: string;
  reservations: number;
  utilizationRate: number | null;
}

export interface DashboardActivityDto {
  id: string;
  type: string;
  title: string;
  description: string;
  at: string;
  source: string;
  metadata?: Record<string, unknown>;
}

export interface DashboardRecentReservationDto {
  id: string;
  reservationId: string;
  resourceId: string;
  resourceName: string;
  userId: string;
  status: string;
  startAt: string;
  endAt: string;
  createdAt: string;
}

export interface DashboardTopResourceDto {
  resourceId: string;
  name: string;
  type: string;
  reservations: number;
  utilizationRate: number | null;
  hoursUsed: number;
  share: number;
}

export interface DashboardResponseDto {
  generatedAt: string;
  filters: {
    from: string;
    to: string;
    period: DashboardPeriod;
    tz: string;
    include: DashboardIncludeSection[];
    resourceTypeId?: string;
    locationId?: string;
    programId?: string;
  };
  refresh: {
    intervalSeconds: number;
    websocketEvent: string;
  };
  kpis: DashboardKpisDto | null;
  reservationSummary: DashboardReservationSummaryDto | null;
  trend: DashboardTrendPointDto[];
  recentActivity: DashboardActivityDto[];
  recentReservations: DashboardRecentReservationDto[];
  topResources: DashboardTopResourceDto[];
  access: {
    canViewFullOccupancy: boolean;
    maskedSections: DashboardIncludeSection[];
  };
}

/**
 * Dashboard Service
 * Servicio principal para gestión de métricas del dashboard
 */
@Injectable()
export class DashboardService {
  constructor(
    @Inject("IDashboardMetricRepository")
    private readonly dashboardMetricRepository: IDashboardMetricRepository,
    private readonly metricsAggregationService: MetricsAggregationService,
    private readonly trendAnalysisService: TrendAnalysisService,
    @InjectModel(ResourceCache.name)
    private readonly resourceCacheModel: Model<ResourceCache>,
    @InjectModel(UsageReport.name)
    private readonly usageReportModel: Model<UsageReport>,
    @InjectModel(UserFeedback.name)
    private readonly userFeedbackModel: Model<UserFeedback>,
    @Optional() private readonly redisService?: RedisService,
    @Optional() private readonly eventStoreService?: EventStoreService,
  ) {}

  async getDashboardData(
    filters: DashboardFiltersDto,
    context: DashboardUserContextDto,
  ): Promise<DashboardResponseDto> {
    return await tracer.startActiveSpan(
      "reports.dashboard.get-dashboard-data",
      async (span) => {
        try {
          const normalizedFilters = this.normalizeFilters(filters);
          const canViewFullOccupancy = this.canViewFullOccupancy(context);
          const cacheKey = this.buildCacheKey(
            normalizedFilters,
            canViewFullOccupancy,
          );

          span.setAttribute("dashboard.period", normalizedFilters.period);
          span.setAttribute(
            "dashboard.include",
            normalizedFilters.include.join(","),
          );
          span.setAttribute(
            "dashboard.canViewFullOccupancy",
            canViewFullOccupancy,
          );

          if (this.redisService) {
            const cached =
              await this.redisService.get<DashboardResponseDto>(cacheKey);
            if (cached) {
              span.setAttribute("dashboard.cache.hit", true);
              return cached;
            }
          }

          span.setAttribute("dashboard.cache.hit", false);

          const [
            { current, previous },
            pendingApprovals,
            satisfactionRate,
            occupancyMetrics,
          ] = await Promise.all([
            this.getUsageWindowComparison(normalizedFilters),
            this.getPendingApprovals(normalizedFilters),
            this.getSatisfactionRate(normalizedFilters),
            this.metricsAggregationService.calculateOccupancyMetrics(),
          ]);

          const include = normalizedFilters.include;

          const [trend, recentActivity, recentReservations, topResources] =
            await Promise.all([
              this.isIncluded(include, DashboardIncludeSection.TREND)
                ? this.getTrendData(normalizedFilters)
                : Promise.resolve([]),
              this.isIncluded(include, DashboardIncludeSection.ACTIVITY)
                ? this.getRecentActivity(normalizedFilters)
                : Promise.resolve([]),
              this.isIncluded(
                include,
                DashboardIncludeSection.RECENT_RESERVATIONS,
              )
                ? this.getRecentReservations(normalizedFilters)
                : Promise.resolve([]),
              this.isIncluded(include, DashboardIncludeSection.TOP_RESOURCES)
                ? this.getTopResources(
                    normalizedFilters,
                    current.totalReservations,
                  )
                : Promise.resolve([]),
            ]);

          const response: DashboardResponseDto = {
            generatedAt: new Date().toISOString(),
            filters: {
              from: normalizedFilters.from.toISOString(),
              to: normalizedFilters.to.toISOString(),
              period: normalizedFilters.period,
              tz: normalizedFilters.tz,
              include: normalizedFilters.include,
              resourceTypeId: normalizedFilters.resourceTypeId,
              locationId: normalizedFilters.locationId,
              programId: normalizedFilters.programId,
            },
            refresh: {
              intervalSeconds: DASHBOARD_REFRESH_SECONDS,
              websocketEvent: DASHBOARD_WEBSOCKET_EVENT,
            },
            kpis: this.isIncluded(include, DashboardIncludeSection.KPIS)
              ? this.buildKpis(
                  current,
                  previous,
                  pendingApprovals,
                  satisfactionRate,
                  occupancyMetrics,
                )
              : null,
            reservationSummary: this.isIncluded(
              include,
              DashboardIncludeSection.SUMMARY,
            )
              ? this.buildReservationSummary(current)
              : null,
            trend,
            recentActivity,
            recentReservations,
            topResources,
            access: {
              canViewFullOccupancy,
              maskedSections: [],
            },
          };

          if (!canViewFullOccupancy) {
            this.maskSensitiveOccupancyData(response);
          }

          await this.saveDashboardMetric(
            ReportMetricType.OVERVIEW,
            this.resolveReportTrendPeriod(normalizedFilters),
            response,
          );

          if (this.redisService) {
            await this.redisService.set(cacheKey, response, {
              key: cacheKey,
              ttl: DASHBOARD_CACHE_TTL_SECONDS,
            });
          }

          logger.info("Aggregated dashboard data generated", {
            period: normalizedFilters.period,
            include: normalizedFilters.include,
            canViewFullOccupancy,
          });

          return response;
        } catch (error) {
          const typedError = error as Error;
          span.recordException(typedError);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: typedError.message,
          });

          logger.error("Failed to get aggregated dashboard data", typedError);
          throw error;
        } finally {
          span.end();
        }
      },
    );
  }

  private normalizeFilters(
    filters: DashboardFiltersDto,
  ): NormalizedDashboardFilters {
    const period = filters.period || DashboardPeriod.LAST_30;
    const include = this.normalizeInclude(filters.include);
    const tz = filters.tz?.trim() || "UTC";
    const { from, to } = this.resolveDateRange(
      period,
      filters.from,
      filters.to,
    );

    if (from.getTime() >= to.getTime()) {
      throw new BadRequestException(
        "dashboard.invalid_date_range: from must be before to",
      );
    }

    return {
      from,
      to,
      period,
      tz,
      include,
      resourceTypeId: filters.resourceTypeId,
      locationId: filters.locationId,
      programId: filters.programId,
    };
  }

  private normalizeInclude(
    include?: DashboardIncludeSection[],
  ): DashboardIncludeSection[] {
    if (!include || include.length === 0) {
      return DEFAULT_INCLUDE_SECTIONS;
    }

    const allowed = new Set(Object.values(DashboardIncludeSection));
    const normalized = Array.from(
      new Set(include.filter((section) => allowed.has(section))),
    );

    return normalized.length > 0 ? normalized : DEFAULT_INCLUDE_SECTIONS;
  }

  private resolveDateRange(
    period: DashboardPeriod,
    fromRaw?: string,
    toRaw?: string,
  ): { from: Date; to: Date } {
    const now = new Date();

    if (period === DashboardPeriod.CUSTOM) {
      if (!fromRaw || !toRaw) {
        throw new BadRequestException(
          "dashboard.custom_period_requires_from_to",
        );
      }
      return {
        from: this.parseDate(fromRaw, "from"),
        to: this.parseDate(toRaw, "to"),
      };
    }

    if (fromRaw || toRaw) {
      return {
        from: fromRaw
          ? this.parseDate(fromRaw, "from")
          : this.getDefaultFromByPeriod(period, now),
        to: toRaw ? this.parseDate(toRaw, "to") : now,
      };
    }

    return {
      from: this.getDefaultFromByPeriod(period, now),
      to: now,
    };
  }

  private getDefaultFromByPeriod(
    period: DashboardPeriod,
    reference: Date,
  ): Date {
    const from = new Date(reference);

    switch (period) {
      case DashboardPeriod.TODAY:
        from.setHours(0, 0, 0, 0);
        return from;
      case DashboardPeriod.WEEK:
        from.setDate(from.getDate() - 6);
        from.setHours(0, 0, 0, 0);
        return from;
      case DashboardPeriod.MONTH:
        from.setDate(1);
        from.setHours(0, 0, 0, 0);
        return from;
      case DashboardPeriod.LAST_30:
      default:
        from.setDate(from.getDate() - 29);
        from.setHours(0, 0, 0, 0);
        return from;
    }
  }

  private parseDate(raw: string, field: "from" | "to"): Date {
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`dashboard.invalid_${field}_date: ${raw}`);
    }
    return parsed;
  }

  private buildCacheKey(
    filters: NormalizedDashboardFilters,
    canViewFullOccupancy: boolean,
  ): string {
    const include = filters.include.join(",");
    const occupancyScope = canViewFullOccupancy ? "full" : "masked";

    return [
      DASHBOARD_CACHE_PREFIX,
      filters.period,
      filters.from.toISOString(),
      filters.to.toISOString(),
      filters.tz,
      filters.resourceTypeId || "all-resource-types",
      filters.locationId || "all-locations",
      filters.programId || "all-programs",
      include,
      occupancyScope,
    ].join(":");
  }

  private async getUsageWindowComparison(
    filters: NormalizedDashboardFilters,
  ): Promise<{
    current: DashboardUsageAggregate;
    previous: DashboardUsageAggregate;
  }> {
    const current = await this.getUsageAggregate(
      filters.from,
      filters.to,
      filters,
    );

    const windowMilliseconds =
      filters.to.getTime() - filters.from.getTime() + DAY_IN_MILLISECONDS;
    const previousTo = new Date(filters.from.getTime() - 1);
    const previousFrom = new Date(previousTo.getTime() - windowMilliseconds);

    const previous = await this.getUsageAggregate(
      previousFrom,
      previousTo,
      filters,
    );

    return { current, previous };
  }

  private async getUsageAggregate(
    from: Date,
    to: Date,
    filters: NormalizedDashboardFilters,
  ): Promise<DashboardUsageAggregate> {
    const match: Record<string, unknown> = {
      startDate: { $gte: from },
      endDate: { $lte: to },
    };

    if (filters.resourceTypeId) {
      match.resourceType = filters.resourceTypeId;
    }

    if (filters.locationId) {
      match["metadata.locationId"] = filters.locationId;
    }

    if (filters.programId) {
      match[`programsBreakdown.${filters.programId}`] = { $exists: true };
    }

    const [result] = await this.usageReportModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalReservations: { $sum: { $ifNull: ["$totalReservations", 0] } },
          confirmedReservations: {
            $sum: { $ifNull: ["$confirmedReservations", 0] },
          },
          cancelledReservations: {
            $sum: { $ifNull: ["$cancelledReservations", 0] },
          },
          completedReservations: {
            $sum: { $ifNull: ["$completedReservations", 0] },
          },
          noShowReservations: { $sum: { $ifNull: ["$noShowReservations", 0] } },
          totalHoursUsed: { $sum: { $ifNull: ["$totalHoursUsed", 0] } },
          averageOccupancyRate: {
            $avg: { $ifNull: ["$occupancyRate", 0] },
          },
        },
      },
    ]);

    return {
      totalReservations: Number(result?.totalReservations || 0),
      confirmedReservations: Number(result?.confirmedReservations || 0),
      cancelledReservations: Number(result?.cancelledReservations || 0),
      completedReservations: Number(result?.completedReservations || 0),
      noShowReservations: Number(result?.noShowReservations || 0),
      totalHoursUsed: Number(result?.totalHoursUsed || 0),
      averageOccupancyRate: this.roundTo2(
        Number(result?.averageOccupancyRate || 0),
      ),
    };
  }

  private async getPendingApprovals(
    filters: NormalizedDashboardFilters,
  ): Promise<number> {
    if (!this.eventStoreService) {
      return 0;
    }

    const events = await this.eventStoreService.getEventsByDateRange(
      filters.from,
      filters.to,
    );

    const createdApprovalEvents = new Set<string>([
      EventType.APPROVAL_REQUEST_CREATED,
      EventType.APPROVAL_REQUESTED,
    ]);
    const resolvedApprovalEvents = new Set<string>([
      EventType.APPROVAL_REQUEST_APPROVED,
      EventType.APPROVAL_REQUEST_REJECTED,
      EventType.APPROVAL_GRANTED,
      EventType.APPROVAL_REJECTED,
    ]);

    let pending = 0;

    for (const event of events) {
      if (!this.matchesEventFilters(event, filters)) {
        continue;
      }

      if (createdApprovalEvents.has(event.eventType)) {
        pending += 1;
      }

      if (resolvedApprovalEvents.has(event.eventType) && pending > 0) {
        pending -= 1;
      }
    }

    return pending;
  }

  private async getSatisfactionRate(
    filters: NormalizedDashboardFilters,
  ): Promise<number> {
    const match: Record<string, unknown> = {
      feedbackDate: { $gte: filters.from, $lte: filters.to },
    };

    if (filters.programId) {
      match["metadata.programId"] = filters.programId;
    }

    if (filters.locationId) {
      match["metadata.locationId"] = filters.locationId;
    }

    const [result] = await this.userFeedbackModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          averageRating: { $avg: { $ifNull: ["$rating", 0] } },
        },
      },
    ]);

    const averageRating = Number(result?.averageRating || 0);
    return this.roundTo2((averageRating / 5) * 100);
  }

  private buildKpis(
    current: DashboardUsageAggregate,
    previous: DashboardUsageAggregate,
    pendingApprovals: number,
    satisfactionRate: number,
    occupancyMetrics: {
      totalResources: number;
      activeResources: number;
    },
  ): DashboardKpisDto {
    const activeReservations = Math.max(
      current.confirmedReservations -
        current.completedReservations -
        current.cancelledReservations,
      0,
    );

    const previousActiveReservations = Math.max(
      previous.confirmedReservations -
        previous.completedReservations -
        previous.cancelledReservations,
      0,
    );

    return {
      totalReservations: current.totalReservations,
      activeReservations,
      pendingApprovals,
      totalResources: occupancyMetrics.totalResources,
      availableResources: Math.max(
        occupancyMetrics.totalResources - occupancyMetrics.activeResources,
        0,
      ),
      utilizationRate: current.averageOccupancyRate,
      satisfactionRate,
      delta: {
        totalReservationsPct: this.calculateDeltaPercent(
          current.totalReservations,
          previous.totalReservations,
        ),
        activeReservationsPct: this.calculateDeltaPercent(
          activeReservations,
          previousActiveReservations,
        ),
        pendingApprovalsPct: 0,
        utilizationRatePct: this.calculateDeltaPercent(
          current.averageOccupancyRate,
          previous.averageOccupancyRate,
        ),
        satisfactionRatePct: 0,
      },
    };
  }

  private buildReservationSummary(
    usage: DashboardUsageAggregate,
  ): DashboardReservationSummaryDto {
    const pending = Math.max(
      usage.totalReservations -
        usage.confirmedReservations -
        usage.cancelledReservations -
        usage.completedReservations -
        usage.noShowReservations,
      0,
    );

    return {
      total: usage.totalReservations,
      pending,
      confirmed: usage.confirmedReservations,
      cancelled: usage.cancelledReservations,
      completed: usage.completedReservations,
    };
  }

  private async getTrendData(
    filters: NormalizedDashboardFilters,
  ): Promise<DashboardTrendPointDto[]> {
    const match: Record<string, unknown> = {
      startDate: { $gte: filters.from },
      endDate: { $lte: filters.to },
    };

    if (filters.resourceTypeId) {
      match.resourceType = filters.resourceTypeId;
    }

    if (filters.locationId) {
      match["metadata.locationId"] = filters.locationId;
    }

    if (filters.programId) {
      match[`programsBreakdown.${filters.programId}`] = { $exists: true };
    }

    const rows = await this.usageReportModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$startDate",
            },
          },
          reservations: { $sum: { $ifNull: ["$totalReservations", 0] } },
          utilizationRate: { $avg: { $ifNull: ["$occupancyRate", 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const byDate = new Map<
      string,
      {
        reservations: number;
        utilizationRate: number;
      }
    >(
      rows.map((row: Record<string, unknown>) => {
        const date = String(row._id);
        return [
          date,
          {
            reservations: Number(row.reservations || 0),
            utilizationRate: this.roundTo2(Number(row.utilizationRate || 0)),
          },
        ];
      }),
    );

    const points: DashboardTrendPointDto[] = [];
    const cursor = new Date(filters.from);
    cursor.setHours(0, 0, 0, 0);
    const end = new Date(filters.to);
    end.setHours(0, 0, 0, 0);

    while (cursor.getTime() <= end.getTime()) {
      const date = cursor.toISOString().split("T")[0];
      const row = byDate.get(date);

      points.push({
        date,
        reservations: row?.reservations || 0,
        utilizationRate: row ? row.utilizationRate : null,
      });

      cursor.setTime(cursor.getTime() + DAY_IN_MILLISECONDS);
    }

    return points;
  }

  private async getRecentActivity(
    filters: NormalizedDashboardFilters,
    limit: number = 10,
  ): Promise<DashboardActivityDto[]> {
    if (!this.eventStoreService) {
      return [];
    }

    const events = await this.eventStoreService.getEventsByDateRange(
      filters.from,
      filters.to,
    );

    return events
      .filter((event) => this.matchesEventFilters(event, filters))
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, limit)
      .map((event) => {
        const payload = this.getEventPayloadData(event);

        return {
          id: event.eventId,
          type: event.eventType,
          title: this.formatActivityTitle(event.eventType),
          description: this.buildActivityDescription(payload, event),
          at: new Date(event.timestamp).toISOString(),
          source: event.service,
          metadata: {
            aggregateType: event.aggregateType,
            aggregateId: event.aggregateId,
          },
        };
      });
  }

  private async getRecentReservations(
    filters: NormalizedDashboardFilters,
    limit: number = 5,
  ): Promise<DashboardRecentReservationDto[]> {
    if (!this.eventStoreService) {
      return [];
    }

    const events = await this.eventStoreService.getEventsByType(
      EventType.RESERVATION_CREATED,
      100,
    );

    const unique = new Map<string, DashboardRecentReservationDto>();

    for (const event of events) {
      if (!this.matchesDateRange(event, filters.from, filters.to)) {
        continue;
      }

      if (!this.matchesEventFilters(event, filters)) {
        continue;
      }

      const payload = this.getEventPayloadData(event);
      const reservationId = this.getFirstString([
        payload.reservationId,
        event.aggregateId,
      ]);

      if (!reservationId || unique.has(reservationId)) {
        continue;
      }

      const startAt = this.getIsoDate([
        payload.startAt,
        payload.startTime,
        payload.startDate,
        event.timestamp,
      ]);
      const endAt = this.getIsoDate([
        payload.endAt,
        payload.endTime,
        payload.endDate,
        payload.startAt,
        payload.startTime,
      ]);

      unique.set(reservationId, {
        id: event.eventId,
        reservationId,
        resourceId: this.getFirstString([payload.resourceId]) || "unknown",
        resourceName:
          this.getFirstString([payload.resourceName, payload.resource]) ||
          "Unknown resource",
        userId: this.getFirstString([payload.userId, payload.createdBy]) || "-",
        status: (
          this.getFirstString([payload.status]) || "PENDING"
        ).toUpperCase(),
        startAt,
        endAt,
        createdAt: new Date(event.timestamp).toISOString(),
      });
    }

    return Array.from(unique.values())
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, limit);
  }

  private async getTopResources(
    filters: NormalizedDashboardFilters,
    totalReservationsBase: number,
    limit: number = 5,
  ): Promise<DashboardTopResourceDto[]> {
    const query: Record<string, unknown> = { isActive: true };

    if (filters.resourceTypeId) {
      query.type = filters.resourceTypeId;
    }

    if (filters.locationId) {
      query["metadata.locationId"] = filters.locationId;
    }

    if (filters.programId) {
      query[`programsBreakdown.${filters.programId}`] = { $exists: true };
    }

    const resources = await this.resourceCacheModel
      .find(query)
      .sort({ totalReservations: -1 })
      .limit(limit)
      .lean()
      .exec();

    const fallbackTotalReservations = resources.reduce(
      (total, resource: Record<string, unknown>) =>
        total + Number(resource.totalReservations || 0),
      0,
    );
    const denominator =
      totalReservationsBase > 0
        ? totalReservationsBase
        : fallbackTotalReservations;

    return resources.map((resource: Record<string, unknown>) => {
      const reservations = Number(resource.totalReservations || 0);

      return {
        resourceId: String(resource.resourceId || "unknown"),
        name: String(resource.name || "Unnamed resource"),
        type: String(resource.type || "UNKNOWN"),
        reservations,
        utilizationRate: this.roundTo2(Number(resource.occupancyRate || 0)),
        hoursUsed: this.roundTo2(Number(resource.totalHoursUsed || 0)),
        share:
          denominator > 0
            ? this.roundTo2((reservations / denominator) * 100)
            : 0,
      };
    });
  }

  private maskSensitiveOccupancyData(response: DashboardResponseDto): void {
    const maskedSections: DashboardIncludeSection[] = [];

    if (response.kpis) {
      response.kpis.utilizationRate = 0;
      response.kpis.delta.utilizationRatePct = 0;
      maskedSections.push(DashboardIncludeSection.KPIS);
    }

    if (response.trend.length > 0) {
      response.trend = response.trend.map((point) => ({
        ...point,
        utilizationRate: null,
      }));
      maskedSections.push(DashboardIncludeSection.TREND);
    }

    if (response.topResources.length > 0) {
      response.topResources = response.topResources.map((resource) => ({
        ...resource,
        utilizationRate: null,
      }));
      maskedSections.push(DashboardIncludeSection.TOP_RESOURCES);
    }

    response.access.maskedSections = maskedSections;
  }

  private canViewFullOccupancy(context: DashboardUserContextDto): boolean {
    const roles = context.roles || [];
    const permissions = context.permissions || [];

    if (roles.includes("GENERAL_ADMIN") || roles.includes("PROGRAM_ADMIN")) {
      return true;
    }

    return PermissionUtil.hasAnyPermission(permissions, [
      "reports:write",
      "reports:export",
    ]);
  }

  private isIncluded(
    include: DashboardIncludeSection[],
    section: DashboardIncludeSection,
  ): boolean {
    return include.includes(section);
  }

  private resolveReportTrendPeriod(
    filters: NormalizedDashboardFilters,
  ): ReportTrendPeriod {
    switch (filters.period) {
      case DashboardPeriod.TODAY:
        return ReportTrendPeriod.DAILY;
      case DashboardPeriod.WEEK:
        return ReportTrendPeriod.WEEKLY;
      case DashboardPeriod.MONTH:
      case DashboardPeriod.LAST_30:
        return ReportTrendPeriod.MONTHLY;
      case DashboardPeriod.CUSTOM:
      default: {
        const days = Math.max(
          Math.ceil(
            (filters.to.getTime() - filters.from.getTime()) /
              DAY_IN_MILLISECONDS,
          ),
          1,
        );

        if (days <= 2) {
          return ReportTrendPeriod.DAILY;
        }

        if (days <= 14) {
          return ReportTrendPeriod.WEEKLY;
        }

        return ReportTrendPeriod.MONTHLY;
      }
    }
  }

  private calculateDeltaPercent(current: number, previous: number): number {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }

    return this.roundTo2(((current - previous) / Math.abs(previous)) * 100);
  }

  private roundTo2(value: number): number {
    return Number(value.toFixed(2));
  }

  private matchesDateRange(event: StoredEvent, from: Date, to: Date): boolean {
    const timestamp = new Date(event.timestamp).getTime();
    return timestamp >= from.getTime() && timestamp <= to.getTime();
  }

  private matchesEventFilters(
    event: StoredEvent,
    filters: NormalizedDashboardFilters,
  ): boolean {
    const payload = this.getEventPayloadData(event);
    const resourceType = this.getFirstString([payload.resourceType]);
    const locationId = this.getFirstString([payload.locationId]);
    const programId = this.getFirstString([payload.programId]);

    if (
      filters.resourceTypeId &&
      (!resourceType || resourceType !== filters.resourceTypeId)
    ) {
      return false;
    }

    if (
      filters.locationId &&
      (!locationId || locationId !== filters.locationId)
    ) {
      return false;
    }

    if (filters.programId && (!programId || programId !== filters.programId)) {
      return false;
    }

    return true;
  }

  private getEventPayloadData(event: StoredEvent): Record<string, unknown> {
    const rootData = event.data as Record<string, unknown>;
    const nested = rootData?.data;

    if (nested && typeof nested === "object") {
      return nested as Record<string, unknown>;
    }

    return rootData || {};
  }

  private formatActivityTitle(eventType: string): string {
    const value = eventType.replace(/[._]/g, " ").trim();
    if (!value) {
      return "Actividad";
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private buildActivityDescription(
    payload: Record<string, unknown>,
    event: StoredEvent,
  ): string {
    const reservationId = this.getFirstString([payload.reservationId]);
    const resourceName = this.getFirstString([
      payload.resourceName,
      payload.resource,
      payload.resourceId,
    ]);

    const descriptionParts: string[] = [];

    if (reservationId) {
      descriptionParts.push(`Reserva ${reservationId}`);
    }

    if (resourceName) {
      descriptionParts.push(`Recurso ${resourceName}`);
    }

    if (descriptionParts.length === 0) {
      descriptionParts.push(`Evento ${event.aggregateType}`);
    }

    return descriptionParts.join(" · ");
  }

  private getFirstString(values: unknown[]): string | null {
    for (const value of values) {
      if (typeof value === "string" && value.trim().length > 0) {
        return value;
      }
    }

    return null;
  }

  private getIsoDate(values: unknown[]): string {
    for (const value of values) {
      if (!value) {
        continue;
      }

      const parsed = new Date(String(value));
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }

    return new Date().toISOString();
  }

  /**
   * Obtener vista general del dashboard
   */
  async getOverview(): Promise<{
    kpis: {
      totalReservations: number;
      totalReservationsToday: number;
      totalHoursUsed: number;
      averageOccupancyRate: number;
      cancelledRate: number;
      noShowRate: number;
      completionRate: number;
    };
    recentActivity: {
      lastUpdate: Date;
      activeResources: number;
      totalResources: number;
    };
  }> {
    try {
      logger.info("Getting dashboard overview");

      // Calcular KPIs
      const kpis = await this.metricsAggregationService.calculateOverviewKPIs();

      // Calcular métricas de ocupación para actividad reciente
      const occupancyMetrics =
        await this.metricsAggregationService.calculateOccupancyMetrics();

      const overview = {
        kpis,
        recentActivity: {
          lastUpdate: new Date(),
          activeResources: occupancyMetrics.activeResources,
          totalResources: occupancyMetrics.totalResources,
        },
      };

      // Guardar métrica para cache
      await this.saveDashboardMetric(
        ReportMetricType.OVERVIEW,
        ReportTrendPeriod.DAILY,
        overview,
      );

      logger.info("Dashboard overview generated", {
        totalReservations: kpis.totalReservations,
        averageOccupancyRate: kpis.averageOccupancyRate,
      });

      return overview;
    } catch (error: any) {
      logger.error("Failed to get dashboard overview", error);
      throw error;
    }
  }

  /**
   * Obtener métricas de ocupación
   */
  async getOccupancyMetrics(): Promise<{
    averageOccupancyRate: number;
    totalResources: number;
    activeResources: number;
    totalReservations: number;
    totalHoursUsed: number;
    resourcesByType: Record<string, number>;
    topResources: Array<{
      resourceId: string;
      name: string;
      occupancyRate: number;
    }>;
  }> {
    try {
      logger.info("Getting occupancy metrics");

      const metrics =
        await this.metricsAggregationService.calculateOccupancyMetrics();

      // Guardar métrica para cache
      await this.saveDashboardMetric(
        ReportMetricType.OCCUPANCY,
        ReportTrendPeriod.DAILY,
        metrics,
      );

      logger.info("Occupancy metrics generated", {
        averageOccupancyRate: metrics.averageOccupancyRate,
        activeResources: metrics.activeResources,
      });

      return metrics;
    } catch (error: any) {
      logger.error("Failed to get occupancy metrics", error);
      throw error;
    }
  }

  /**
   * Obtener análisis de tendencias
   */
  async getTrendAnalysis(
    period: ReportTrendPeriod,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    period: ReportTrendPeriod;
    dataPoints: Array<{
      date: string;
      occupancyRate: number;
      totalReservations: number;
      totalHoursUsed: number;
    }>;
    trend: ReportTrendType;
    averageGrowth: number;
  }> {
    try {
      logger.info("Getting trend analysis", {
        period,
        startDate,
        endDate,
      });

      const analysis = await this.trendAnalysisService.analyzeTrends(
        period,
        startDate,
        endDate,
      );

      // Guardar métrica para cache
      await this.saveDashboardMetric(ReportMetricType.TRENDS, period, analysis);

      logger.info("Trend analysis generated", {
        period,
        dataPointsCount: analysis.dataPoints.length,
        trend: analysis.trend,
      });

      return analysis;
    } catch (error: any) {
      logger.error("Failed to get trend analysis", error);
      throw error;
    }
  }

  /**
   * Comparar recursos
   */
  async compareResources(resourceIds: string[]): Promise<{
    resources: Array<{
      resourceId: string;
      name: string;
      type: string;
      totalReservations: number;
      occupancyRate: number;
      totalHoursUsed: number;
      cancelledRate: number;
      noShowRate: number;
    }>;
  }> {
    try {
      logger.info("Comparing resources", {
        resourceCount: resourceIds.length,
      });

      const comparison =
        await this.metricsAggregationService.compareResources(resourceIds);

      // Guardar métrica para cache
      await this.saveDashboardMetric(
        ReportMetricType.COMPARISON,
        ReportTrendPeriod.DAILY,
        {
          ...comparison,
          comparedAt: new Date(),
        },
      );

      logger.info("Resources compared", {
        resourceCount: comparison.resources.length,
      });

      return comparison;
    } catch (error: any) {
      logger.error("Failed to compare resources", error);
      throw error;
    }
  }

  /**
   * Obtener KPIs principales
   */
  async getMainKPIs(): Promise<{
    totalReservations: number;
    totalReservationsToday: number;
    totalHoursUsed: number;
    averageOccupancyRate: number;
    cancelledRate: number;
    noShowRate: number;
    completionRate: number;
    topResources: Array<{
      resourceId: string;
      name: string;
      occupancyRate: number;
    }>;
    usagePatterns: {
      peakHours: string[];
      peakDays: string[];
      lowUsageHours: string[];
    };
  }> {
    try {
      logger.info("Getting main KPIs");

      const [kpis, occupancyMetrics, patterns] = await Promise.all([
        this.metricsAggregationService.calculateOverviewKPIs(),
        this.metricsAggregationService.calculateOccupancyMetrics(),
        this.trendAnalysisService.detectUsagePatterns(),
      ]);

      const mainKPIs = {
        ...kpis,
        topResources: occupancyMetrics.topResources,
        usagePatterns: {
          peakHours: patterns.peakHours,
          peakDays: patterns.peakDays,
          lowUsageHours: patterns.lowUsageHours,
        },
      };

      logger.info("Main KPIs generated", {
        totalReservations: kpis.totalReservations,
        averageOccupancyRate: kpis.averageOccupancyRate,
      });

      return mainKPIs;
    } catch (error: any) {
      logger.error("Failed to get main KPIs", error);
      throw error;
    }
  }

  /**
   * Guardar métrica del dashboard
   */
  private async saveDashboardMetric(
    metricType: ReportMetricType,
    period: ReportTrendPeriod,
    data: any,
  ): Promise<void> {
    try {
      const metric = new DashboardMetricEntity(
        "",
        metricType,
        period,
        new Date(),
        data,
        { generatedAt: new Date().toISOString() },
      );

      await this.dashboardMetricRepository.save(metric);

      logger.debug("Dashboard metric saved", { metricType, period });
    } catch (error: any) {
      // No fallar si no se puede guardar el cache
      logger.warn("Failed to save dashboard metric", {
        metricType,
        period,
        error: error.message,
      });
    }
  }

  /**
   * Limpiar métricas antiguas (más de 90 días)
   */
  async cleanupOldMetrics(): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);

      const deletedCount =
        await this.dashboardMetricRepository.deleteOlderThan(cutoffDate);

      logger.info("Old dashboard metrics cleaned", { deletedCount });

      return deletedCount;
    } catch (error: any) {
      logger.error("Failed to cleanup old metrics", error);
      throw error;
    }
  }
}
