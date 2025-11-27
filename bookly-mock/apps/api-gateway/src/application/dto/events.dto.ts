import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class EventReplayFilterDto {
  @ApiPropertyOptional({ description: "Start date for event replay" })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: "End date for event replay" })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: "Event types to filter", type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eventTypes?: string[];

  @ApiPropertyOptional({
    description: "Aggregate types to filter",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aggregateTypes?: string[];

  @ApiPropertyOptional({
    description: "Aggregate IDs to filter",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aggregateIds?: string[];

  @ApiPropertyOptional({ description: "Services to filter", type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];
}

export class GetEventsQueryDto {
  @ApiPropertyOptional({ description: "Event type filter" })
  @IsOptional()
  @IsString()
  eventType?: string;

  @ApiPropertyOptional({ description: "Service filter" })
  @IsOptional()
  @IsString()
  service?: string;

  @ApiPropertyOptional({ description: "Aggregate type filter" })
  @IsOptional()
  @IsString()
  aggregateType?: string;

  @ApiPropertyOptional({ description: "Aggregate ID filter" })
  @IsOptional()
  @IsString()
  aggregateId?: string;

  @ApiPropertyOptional({ description: "Start date", example: "2025-01-01" })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: "End date", example: "2025-01-31" })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: "Limit number of events",
    minimum: 1,
    maximum: 1000,
    default: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number;
}

export class EventMetricsResponseDto {
  @ApiProperty({ description: "Current broker type", example: "rabbitmq" })
  brokerType: string;

  @ApiProperty({
    description: "Average latency in milliseconds",
    example: 15.3,
  })
  avgLatency: number;

  @ApiProperty({ description: "Events per second", example: 125.5 })
  throughput: number;

  @ApiProperty({ description: "Total events processed", example: 10543 })
  totalEvents: number;

  @ApiProperty({ description: "Failed events count", example: 3 })
  failedEvents: number;

  @ApiProperty({ description: "Retry count", example: 12 })
  retryCount: number;

  @ApiProperty({ description: "Event Store enabled", example: true })
  eventStoreEnabled: boolean;

  @ApiProperty({
    description: "Uptime in milliseconds",
    example: 3600000,
  })
  uptime: number;

  @ApiProperty({
    description: "Last 10 events latencies",
    type: [Number],
    example: [12, 15, 13, 20, 11, 14, 16, 18, 13, 15],
  })
  recentLatencies: number[];
}

export class EventDashboardDataDto {
  @ApiProperty({ description: "Total events in store", example: 45623 })
  totalEvents: number;

  @ApiProperty({ description: "Events today", example: 1234 })
  eventsToday: number;

  @ApiProperty({ description: "Events this hour", example: 87 })
  eventsThisHour: number;

  @ApiProperty({
    description: "Top event types",
    example: [
      { eventType: "RESOURCE_CREATED", count: 543 },
      { eventType: "RESERVATION_CREATED", count: 432 },
    ],
  })
  topEventTypes: Array<{ eventType: string; count: number }>;

  @ApiProperty({
    description: "Events by service",
    example: [
      { service: "resources-service", count: 1234 },
      { service: "availability-service", count: 987 },
    ],
  })
  eventsByService: Array<{ service: string; count: number }>;

  @ApiProperty({
    description: "Recent events",
    type: [Object],
  })
  recentEvents: any[];
}
