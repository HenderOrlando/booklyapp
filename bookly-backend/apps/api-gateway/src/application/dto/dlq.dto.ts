import { DLQStatus } from "@libs/event-bus/dlq";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from "class-validator";

export class GetDLQEventsQueryDto {
  @ApiPropertyOptional({
    description: "Filter by status",
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

  @ApiPropertyOptional({ description: "Filter by event type" })
  @IsOptional()
  @IsString()
  eventType?: string;

  @ApiPropertyOptional({
    description: "Start date",
    example: "2025-01-01",
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: "End date",
    example: "2025-01-31",
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: "Limit number of results",
    minimum: 1,
    default: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}

export class ResolveDLQEventDto {
  @ApiProperty({ description: "Resolution description" })
  @IsString()
  resolution: string;

  @ApiPropertyOptional({ description: "Resolved by user ID" })
  @IsOptional()
  @IsString()
  resolvedBy?: string;
}

export class DLQStatsResponseDto {
  @ApiProperty({ description: "Total events in DLQ" })
  total: number;

  @ApiProperty({ description: "Pending events" })
  pending: number;

  @ApiProperty({ description: "Retrying events" })
  retrying: number;

  @ApiProperty({ description: "Failed events" })
  failed: number;

  @ApiProperty({ description: "Resolved events" })
  resolved: number;

  @ApiProperty({
    description: "Events by topic",
    example: { "bookly.resource.created": 5 },
  })
  byTopic: Record<string, number>;

  @ApiProperty({
    description: "Events by service",
    example: { "resources-service": 3 },
  })
  byService: Record<string, number>;

  @ApiProperty({
    description: "Events by event type",
    example: { RESOURCE_CREATED: 5 },
  })
  byEventType: Record<string, number>;
}
