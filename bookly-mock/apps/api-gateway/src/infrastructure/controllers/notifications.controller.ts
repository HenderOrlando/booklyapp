import { JwtAuthGuard } from "@libs/guards";
import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
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
  LogFilterDto,
  NotificationDto,
} from '@gateway/application/dto/websocket.dto";
import { LogStreamingService } from '@gateway/application/services/log-streaming.service";
import { NotificationService } from '@gateway/application/services/notification.service";

@ApiTags("Notifications & Logs")
@Controller("notifications")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly logStreamingService: LogStreamingService
  ) {}

  /**
   * Obtener notificaciones del usuario
   */
  @Get()
  @ApiOperation({
    summary: "Get user notifications",
    description: "Retrieve all notifications for the authenticated user",
  })
  @ApiQuery({
    name: "unreadOnly",
    required: false,
    type: Boolean,
    description: "Filter only unread notifications",
  })
  @ApiResponse({
    status: 200,
    description: "Notifications retrieved successfully",
    type: [NotificationDto],
  })
  async getNotifications(
    @Request() req: any,
    @Query("unreadOnly") unreadOnly?: string
  ): Promise<NotificationDto[]> {
    const userId = req.user.id;
    const unread = unreadOnly === "true";

    return this.notificationService.getUserNotifications(userId, unread);
  }

  /**
   * Obtener contador de no leídas
   */
  @Get("unread/count")
  @ApiOperation({
    summary: "Get unread count",
    description: "Get count of unread notifications for user",
  })
  @ApiResponse({
    status: 200,
    description: "Count retrieved successfully",
  })
  async getUnreadCount(@Request() req: any): Promise<{ count: number }> {
    const userId = req.user.id;
    const count = await this.notificationService.getUnreadCount(userId);

    return { count };
  }

  /**
   * Marcar notificación como leída
   */
  @Post(":id/read")
  @ApiOperation({
    summary: "Mark notification as read",
    description: "Mark a specific notification as read",
  })
  @ApiResponse({
    status: 200,
    description: "Notification marked as read",
  })
  @ApiResponse({
    status: 404,
    description: "Notification not found",
  })
  async markAsRead(
    @Request() req: any,
    @Param("id") notificationId: string
  ): Promise<{ success: boolean }> {
    const userId = req.user.id;
    const success = await this.notificationService.markAsRead(
      userId,
      notificationId
    );

    return { success };
  }

  /**
   * Marcar todas como leídas
   */
  @Post("read-all")
  @ApiOperation({
    summary: "Mark all as read",
    description: "Mark all notifications as read for user",
  })
  @ApiResponse({
    status: 200,
    description: "All notifications marked as read",
  })
  async markAllAsRead(@Request() req: any): Promise<{ count: number }> {
    const userId = req.user.id;
    const count = await this.notificationService.markAllAsRead(userId);

    return { count };
  }

  /**
   * Eliminar notificación
   */
  @Delete(":id")
  @ApiOperation({
    summary: "Delete notification",
    description: "Delete a specific notification",
  })
  @ApiResponse({
    status: 200,
    description: "Notification deleted successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Notification not found",
  })
  async deleteNotification(
    @Request() req: any,
    @Param("id") notificationId: string
  ): Promise<{ success: boolean }> {
    const userId = req.user.id;
    const success = await this.notificationService.deleteNotification(
      userId,
      notificationId
    );

    return { success };
  }

  /**
   * Limpiar notificaciones antiguas
   */
  @Post("clear-old")
  @ApiOperation({
    summary: "Clear old notifications",
    description: "Clear notifications older than specified days",
  })
  @ApiQuery({
    name: "days",
    required: false,
    type: Number,
    description: "Days old (default: 30)",
  })
  @ApiResponse({
    status: 200,
    description: "Old notifications cleared",
  })
  async clearOldNotifications(
    @Request() req: any,
    @Query("days") days?: string
  ): Promise<{ deleted: number }> {
    const userId = req.user.id;
    const daysOld = days ? parseInt(days, 10) : 30;
    const deleted = await this.notificationService.clearOldNotifications(
      userId,
      daysOld
    );

    return { deleted };
  }

  /**
   * Obtener logs recientes (solo admins)
   */
  @Get("logs/recent")
  @ApiOperation({
    summary: "Get recent logs",
    description: "Get recent system logs (admin only)",
  })
  @ApiQuery({
    name: "level",
    required: false,
    enum: ["error", "warn", "info", "debug"],
  })
  @ApiQuery({ name: "service", required: false, type: String })
  @ApiQuery({ name: "context", required: false, type: String })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: "Logs retrieved successfully",
  })
  async getRecentLogs(
    @Query("level") level?: string,
    @Query("service") service?: string,
    @Query("context") context?: string,
    @Query("limit") limit?: string
  ) {
    const filters: LogFilterDto = {
      level: level as any,
      service,
      context,
    };

    const limitNum = limit ? parseInt(limit, 10) : 100;

    return this.logStreamingService.getRecentLogs(filters, limitNum);
  }

  /**
   * Obtener estadísticas de logs
   */
  @Get("logs/stats")
  @ApiOperation({
    summary: "Get log statistics",
    description: "Get statistics about system logs (admin only)",
  })
  @ApiResponse({
    status: 200,
    description: "Statistics retrieved successfully",
  })
  async getLogStats() {
    return this.logStreamingService.getLogStats();
  }
}
