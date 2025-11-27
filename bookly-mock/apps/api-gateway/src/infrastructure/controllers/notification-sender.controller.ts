import { JwtAuthGuard } from "@libs/guards";
import {
  BatchSendNotificationDto,
  NotificationResponseDto,
  SendNotificationDto,
} from "@libs/notifications";
import { NotificationService } from "@libs/notifications";
import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

/**
 * Notification Sender Controller
 * Controller centralizado para envío de notificaciones multicanal
 */
@ApiTags("Notification Sender")
@Controller("notification-sender")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationSenderController {
  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Enviar notificación única
   */
  @Post("send")
  @ApiOperation({
    summary: "Enviar notificación",
    description:
      "Envía una notificación por el canal especificado (EMAIL, SMS, WHATSAPP, PUSH)",
  })
  @ApiResponse({
    status: 201,
    description: "Notificación enviada exitosamente",
    type: NotificationResponseDto,
  })
  @ApiResponse({ status: 400, description: "Datos inválidos" })
  @ApiResponse({ status: 500, description: "Error al enviar notificación" })
  async send(
    @Body() dto: SendNotificationDto
  ): Promise<{ eventId: string; status: string }> {
    return await this.notificationService.sendNotification(
      dto.channel,
      {
        to: dto.to,
        subject: dto.subject,
        message: dto.message,
        data: dto.data,
        from: dto.from,
        template: dto.template,
      },
      dto.tenantId,
      dto.priority
    );
  }

  /**
   * Enviar notificaciones en batch
   */
  @Post("send-batch")
  @ApiOperation({
    summary: "Enviar notificaciones en lote",
    description: "Envía múltiples notificaciones de forma eficiente",
  })
  @ApiResponse({
    status: 201,
    description: "Notificaciones enviadas exitosamente",
    type: [NotificationResponseDto],
  })
  @ApiResponse({ status: 400, description: "Datos inválidos" })
  @ApiResponse({
    status: 500,
    description: "Error al enviar notificaciones",
  })
  async sendBatch(@Body() dto: BatchSendNotificationDto): Promise<
    Array<{
      eventId: string;
      status: string;
    }>
  > {
    const notifications = dto.notifications.map((notification) => ({
      channel: notification.channel,
      payload: {
        to: notification.to,
        subject: notification.subject,
        message: notification.message,
        data: notification.data,
        from: notification.from,
        template: notification.template,
      },
      tenantId: notification.tenantId,
      priority: notification.priority,
    }));

    return await this.notificationService.sendBatch(notifications);
  }
}
