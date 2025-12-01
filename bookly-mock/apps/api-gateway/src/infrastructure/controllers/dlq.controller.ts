import { UserRole } from "@libs/common/enums";
import { Roles } from "@libs/decorators";
import { DeadLetterQueueService } from "@libs/event-bus/dlq";
import { JwtAuthGuard } from "@libs/guards";
import { RolesGuard } from "@libs/guards";
import {
  Body,
  Controller,
  Delete,
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
  DLQStatsResponseDto,
  GetDLQEventsQueryDto,
  ResolveDLQEventDto,
} from '@gateway/application/dto/dlq.dto";

@ApiTags("Dead Letter Queue")
@Controller("dlq")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DLQController {
  constructor(private readonly dlqService: DeadLetterQueueService) {}

  /**
   * Get DLQ statistics
   */
  @Get("stats")
  @Roles(UserRole.GENERAL_ADMIN)
  @ApiOperation({
    summary: "Get DLQ statistics",
    description:
      "Returns statistics about failed events in the Dead Letter Queue",
  })
  @ApiResponse({
    status: 200,
    description: "Statistics retrieved successfully",
    type: DLQStatsResponseDto,
  })
  async getStats(): Promise<DLQStatsResponseDto> {
    return this.dlqService.getStats();
  }

  /**
   * Get DLQ events with filters
   */
  @Get()
  @Roles(UserRole.GENERAL_ADMIN)
  @ApiOperation({
    summary: "Get DLQ events",
    description:
      "Query failed events from Dead Letter Queue with optional filters",
  })
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "topic", required: false })
  @ApiQuery({ name: "service", required: false })
  @ApiQuery({ name: "eventType", required: false })
  @ApiQuery({ name: "startDate", required: false, type: String })
  @ApiQuery({ name: "endDate", required: false, type: String })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 100 })
  @ApiResponse({
    status: 200,
    description: "DLQ events retrieved successfully",
  })
  async getDLQEvents(@Query() query: GetDLQEventsQueryDto) {
    const filter = {
      ...query,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    };

    return this.dlqService.find(filter);
  }

  /**
   * Get DLQ event by ID
   */
  @Get(":id")
  @Roles(UserRole.GENERAL_ADMIN)
  @ApiOperation({
    summary: "Get DLQ event by ID",
    description: "Get details of a specific failed event",
  })
  @ApiResponse({ status: 200, description: "DLQ event retrieved successfully" })
  @ApiResponse({ status: 404, description: "DLQ event not found" })
  async getDLQEventById(@Param("id") id: string) {
    const event = await this.dlqService.findById(id);

    if (!event) {
      throw new Error(`DLQ event not found: ${id}`);
    }

    return event;
  }

  /**
   * Retry DLQ event manually
   */
  @Post(":id/retry")
  @Roles(UserRole.GENERAL_ADMIN)
  @ApiOperation({
    summary: "Retry DLQ event",
    description: "Manually trigger retry of a failed event",
  })
  @ApiResponse({ status: 200, description: "Retry triggered successfully" })
  @ApiResponse({ status: 404, description: "DLQ event not found" })
  async retryDLQEvent(@Param("id") id: string) {
    return this.dlqService.retryManually(id);
  }

  /**
   * Resolve DLQ event manually
   */
  @Post(":id/resolve")
  @Roles(UserRole.GENERAL_ADMIN)
  @ApiOperation({
    summary: "Resolve DLQ event",
    description: "Manually mark a failed event as resolved without retry",
  })
  @ApiResponse({ status: 200, description: "Event resolved successfully" })
  @ApiResponse({ status: 404, description: "DLQ event not found" })
  async resolveDLQEvent(
    @Param("id") id: string,
    @Body() dto: ResolveDLQEventDto
  ) {
    return this.dlqService.resolveManually(
      id,
      dto.resolvedBy || "admin",
      dto.resolution
    );
  }

  /**
   * Delete DLQ event
   */
  @Delete(":id")
  @Roles(UserRole.GENERAL_ADMIN)
  @ApiOperation({
    summary: "Delete DLQ event",
    description: "Permanently delete a failed event from the Dead Letter Queue",
  })
  @ApiResponse({ status: 200, description: "Event deleted successfully" })
  @ApiResponse({ status: 404, description: "DLQ event not found" })
  async deleteDLQEvent(@Param("id") id: string) {
    await this.dlqService.remove(id);
    return { message: "Event deleted successfully", id };
  }
}
