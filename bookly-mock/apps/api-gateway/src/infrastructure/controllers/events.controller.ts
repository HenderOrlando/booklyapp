import { UserRole } from "@libs/common/enums";
import { Roles } from "@libs/decorators";
import { JwtAuthGuard } from "@libs/guards";
import { RolesGuard } from "@libs/guards";
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  EventDashboardDataDto,
  EventMetricsResponseDto,
  EventReplayFilterDto,
  GetEventsQueryDto,
} from '@gateway/application/dto/events.dto';
import { EventsService } from '@gateway/application/services/events.service';

@ApiTags("Events")
@Controller("events")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * Get Event Bus metrics (performance, throughput, errors)
   */
  @Get("metrics")
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: "Get Event Bus metrics",
    description:
      "Returns performance metrics including latency, throughput, and error rates for the current event broker",
  })
  @ApiResponse({
    status: 200,
    description: "Metrics retrieved successfully",
    type: EventMetricsResponseDto,
  })
  async getMetrics(): Promise<EventMetricsResponseDto> {
    return this.eventsService.getMetrics();
  }

  /**
   * Get Dashboard data (overview of events)
   */
  @Get("dashboard")
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: "Get Events Dashboard data",
    description:
      "Returns overview of events including totals, top types, and recent activity",
  })
  @ApiResponse({
    status: 200,
    description: "Dashboard data retrieved successfully",
    type: EventDashboardDataDto,
  })
  async getDashboard(): Promise<EventDashboardDataDto> {
    return this.eventsService.getDashboardData();
  }

  /**
   * Get events with filters
   */
  @Get()
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: "Get events with filters",
    description: "Query events from Event Store with optional filters",
  })
  @ApiQuery({ name: "eventType", required: false })
  @ApiQuery({ name: "service", required: false })
  @ApiQuery({ name: "aggregateType", required: false })
  @ApiQuery({ name: "aggregateId", required: false })
  @ApiQuery({ name: "startDate", required: false, type: String })
  @ApiQuery({ name: "endDate", required: false, type: String })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 100 })
  @ApiResponse({ status: 200, description: "Events retrieved successfully" })
  async getEvents(@Query() query: GetEventsQueryDto) {
    const {
      eventType,
      service,
      aggregateType,
      aggregateId,
      startDate,
      endDate,
      limit,
    } = query;

    // If specific queries are provided
    if (aggregateType && aggregateId) {
      return this.eventsService.getEventsByAggregate(
        aggregateType,
        aggregateId
      );
    }

    if (eventType) {
      return this.eventsService.getEventsByType(eventType, limit || 100);
    }

    if (startDate && endDate) {
      return this.eventsService.getEventsByDateRange(
        new Date(startDate),
        new Date(endDate)
      );
    }

    // Default: get recent events
    return this.eventsService.getEventsByDateRange(
      new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      new Date()
    );
  }

  /**
   * Get events by aggregate
   */
  @Get("aggregate/:aggregateType/:aggregateId")
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: "Get events by aggregate",
    description:
      "Get all events for a specific aggregate (e.g., Resource, User)",
  })
  @ApiResponse({ status: 200, description: "Events retrieved successfully" })
  async getEventsByAggregate(
    @Param("aggregateType") aggregateType: string,
    @Param("aggregateId") aggregateId: string
  ) {
    return this.eventsService.getEventsByAggregate(aggregateType, aggregateId);
  }

  /**
   * Get events by type
   */
  @Get("type/:eventType")
  @Roles(UserRole.GENERAL_ADMIN, UserRole.PROGRAM_ADMIN)
  @ApiOperation({
    summary: "Get events by type",
    description: "Get all events of a specific type (e.g., RESOURCE_CREATED)",
  })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 100 })
  @ApiResponse({ status: 200, description: "Events retrieved successfully" })
  async getEventsByType(
    @Param("eventType") eventType: string,
    @Query("limit") limit?: number
  ) {
    return this.eventsService.getEventsByType(eventType, limit || 100);
  }

  /**
   * Replay events with filter
   */
  @Post("replay")
  @Roles(UserRole.GENERAL_ADMIN)
  @ApiOperation({
    summary: "Replay events",
    description:
      "Replay events from Event Store with optional filters. Returns all matching events in order.",
  })
  @ApiResponse({ status: 200, description: "Events replayed successfully" })
  async replayEvents(@Body() filter: EventReplayFilterDto) {
    const convertedFilter = {
      ...filter,
      startDate: filter.startDate ? new Date(filter.startDate) : undefined,
      endDate: filter.endDate ? new Date(filter.endDate) : undefined,
    };

    return this.eventsService.replayEvents(convertedFilter);
  }
}
