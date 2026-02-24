import { SortByField, SortOrder } from "@libs/common/enums";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from "class-validator";

/**
 * Date range filter
 */
export class DateRangeDto {
  @ApiProperty({
    description: "Start date (ISO 8601)",
    example: "2025-01-10T00:00:00Z",
  })
  @IsDateString()
  start: string;

  @ApiProperty({
    description: "End date (ISO 8601)",
    example: "2025-01-15T23:59:59Z",
  })
  @IsDateString()
  end: string;
}

/**
 * Time range filter (hours)
 */
export class TimeRangeDto {
  @ApiProperty({
    description: "Start time in HH:MM format",
    example: "08:00",
  })
  @IsString()
  start: string;

  @ApiProperty({
    description: "End time in HH:MM format",
    example: "18:00",
  })
  @IsString()
  end: string;
}

/**
 * Capacity range filter
 */
export class CapacityRangeDto {
  @ApiPropertyOptional({
    description: "Minimum capacity required",
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  min?: number;

  @ApiPropertyOptional({
    description: "Maximum capacity required",
    example: 50,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  max?: number;
}

/**
 * Search availability filters DTO
 */
export class SearchAvailabilityDto {
  @ApiProperty({
    description: "Date range to search availability",
    type: DateRangeDto,
  })
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange: DateRangeDto;

  @ApiPropertyOptional({
    description: "Time range filter (optional)",
    type: TimeRangeDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TimeRangeDto)
  timeRange?: TimeRangeDto;

  @ApiPropertyOptional({
    description: "Resource types to search (CLASSROOM, LABORATORY, etc.)",
    type: [String],
    example: ["CLASSROOM", "LABORATORY"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resourceTypes?: string[];

  @ApiPropertyOptional({
    description: "Capacity range required",
    type: CapacityRangeDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CapacityRangeDto)
  capacity?: CapacityRangeDto;

  @ApiPropertyOptional({
    description: "Required features/amenities",
    type: [String],
    example: ["PROJECTOR", "WHITEBOARD", "AIR_CONDITIONING"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({
    description: "Program/department code filter",
    example: "ING-SISTEMAS",
  })
  @IsOptional()
  @IsString()
  program?: string;

  @ApiPropertyOptional({
    description: "Building or location filter",
    example: "Edificio A",
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: "Minimum duration required (minutes)",
    example: 120,
    minimum: 30,
  })
  @IsOptional()
  @IsNumber()
  @Min(30)
  minDuration?: number;

  @ApiPropertyOptional({
    description: "Include only resources with specific status",
    example: "AVAILABLE",
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: "Page number (1-indexed)",
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: "Items per page",
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: "Sort by field",
    enum: SortByField,
    example: SortByField.SCORE,
    default: SortByField.SCORE,
  })
  @IsOptional()
  @IsEnum(SortByField)
  sortBy?: SortByField;

  @ApiPropertyOptional({
    description: "Sort order",
    enum: SortOrder,
    example: SortOrder.DESC,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
}

/**
 * Available slot result
 */
export class AvailableSlotDto {
  @ApiProperty({
    description: "Resource ID",
    example: "6789abcdef123456",
  })
  resourceId: string;

  @ApiProperty({
    description: "Resource name",
    example: "Sala 101",
  })
  resourceName: string;

  @ApiProperty({
    description: "Resource type",
    example: "CLASSROOM",
  })
  resourceType: string;

  @ApiProperty({
    description: "Available from (ISO 8601)",
    example: "2025-01-10T08:00:00Z",
  })
  availableFrom: string;

  @ApiProperty({
    description: "Available until (ISO 8601)",
    example: "2025-01-10T12:00:00Z",
  })
  availableUntil: string;

  @ApiProperty({
    description: "Capacity of the resource",
    example: 30,
  })
  capacity: number;

  @ApiPropertyOptional({
    description: "Location/building",
    example: "Edificio A - Piso 1",
  })
  location?: string;

  @ApiPropertyOptional({
    description: "Available features",
    type: [String],
    example: ["PROJECTOR", "WHITEBOARD"],
  })
  features?: string[];

  @ApiPropertyOptional({
    description: "Relevance score (0-100)",
    example: 95.5,
  })
  score?: number;

  @ApiPropertyOptional({
    description: "Program/department",
    example: "ING-SISTEMAS",
  })
  program?: string;
}

/**
 * Search availability response
 */
export class SearchAvailabilityResponseDto {
  @ApiProperty({
    description: "Total slots found",
    example: 15,
  })
  total: number;

  @ApiProperty({
    description: "Number of unique resources",
    example: 5,
  })
  totalResources: number;

  @ApiProperty({
    description: "Available slots",
    type: [AvailableSlotDto],
  })
  slots: AvailableSlotDto[];

  @ApiPropertyOptional({
    description: "Search filters applied",
  })
  filters?: Partial<SearchAvailabilityDto>;

  @ApiPropertyOptional({
    description: "Pagination metadata",
  })
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };

  @ApiPropertyOptional({
    description: "Search execution time in milliseconds",
    example: 125,
  })
  executionTimeMs?: number;
}
