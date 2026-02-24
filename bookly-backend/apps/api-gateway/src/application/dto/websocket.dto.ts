import { DLQStatus } from "@libs/event-bus/dlq";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";

export enum WebSocketEvent {
  // Events
  EVENT_CREATED = "event:created",
  EVENT_FAILED = "event:failed",
  EVENT_REPLAYED = "event:replayed",

  // DLQ
  DLQ_EVENT_ADDED = "dlq:event:added",
  DLQ_EVENT_RETRYING = "dlq:event:retrying",
  DLQ_EVENT_RESOLVED = "dlq:event:resolved",
  DLQ_EVENT_FAILED = "dlq:event:failed",
  DLQ_STATS_UPDATED = "dlq:stats:updated",

  // Dashboard
  DASHBOARD_METRICS_UPDATED = "dashboard:metrics:updated",
  SERVICE_STATUS_CHANGED = "service:status:changed",
  INFRASTRUCTURE_STATUS_CHANGED = "infrastructure:status:changed",

  // Notifications
  NOTIFICATION_CREATED = "notification:created",
  NOTIFICATION_READ = "notification:read",
  NOTIFICATION_DELETED = "notification:deleted",

  // Logs
  LOG_ENTRY = "log:entry",
  LOG_ERROR = "log:error",
  LOG_WARNING = "log:warning",
}

export enum NotificationType {
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
  ACTION_REQUIRED = "action_required",
}

export enum NotificationCategory {
  EVENT = "event",
  USER = "user",
  RESOURCE = "resource",
  RESERVATION = "reservation",
  LIMIT = "limit",
  ERROR = "error",
  SYSTEM = "system",
}

export class EventFilterDto {
  @ApiPropertyOptional({ description: "Filter by event types", type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  eventTypes?: string[];

  @ApiPropertyOptional({ description: "Filter by services", type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];

  @ApiPropertyOptional({
    description: "Filter by aggregate types",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aggregateTypes?: string[];
}

export class DLQFilterDto {
  @ApiPropertyOptional({
    description: "Filter by DLQ status",
    enum: DLQStatus,
  })
  @IsOptional()
  @IsEnum(DLQStatus)
  status?: DLQStatus;

  @ApiPropertyOptional({ description: "Filter by topic" })
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiPropertyOptional({ description: "Filter by service" })
  @IsOptional()
  @IsString()
  service?: string;
}

export class LogFilterDto {
  @ApiPropertyOptional({
    description: "Filter by log level",
    enum: ["error", "warn", "info", "debug"],
  })
  @IsOptional()
  @IsEnum(["error", "warn", "info", "debug"])
  level?: string;

  @ApiPropertyOptional({ description: "Filter by service" })
  @IsOptional()
  @IsString()
  service?: string;

  @ApiPropertyOptional({ description: "Filter by context" })
  @IsOptional()
  @IsString()
  context?: string;
}

export class NotificationDto {
  @ApiProperty({ description: "Notification ID" })
  id: string;

  @ApiProperty({ description: "User ID" })
  userId: string;

  @ApiProperty({ enum: NotificationType })
  type: NotificationType;

  @ApiProperty({ enum: NotificationCategory })
  category: NotificationCategory;

  @ApiProperty({ description: "Notification title" })
  title: string;

  @ApiProperty({ description: "Notification message" })
  message: string;

  @ApiPropertyOptional({ description: "Additional data" })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiProperty({ description: "Read status" })
  read: boolean;

  @ApiProperty({ description: "Created at" })
  createdAt: Date;

  @ApiPropertyOptional({ description: "Action URL" })
  @IsOptional()
  @IsString()
  actionUrl?: string;
}

export class WebSocketSubscribeDto {
  @ApiProperty({
    description: "Channels to subscribe",
    type: [String],
    example: ["events", "dlq", "notifications", "logs"],
  })
  @IsArray()
  @IsString({ each: true })
  channels: string[];

  @ApiPropertyOptional({ description: "Event filters" })
  @IsOptional()
  eventFilters?: EventFilterDto;

  @ApiPropertyOptional({ description: "DLQ filters" })
  @IsOptional()
  dlqFilters?: DLQFilterDto;

  @ApiPropertyOptional({ description: "Log filters" })
  @IsOptional()
  logFilters?: LogFilterDto;
}
