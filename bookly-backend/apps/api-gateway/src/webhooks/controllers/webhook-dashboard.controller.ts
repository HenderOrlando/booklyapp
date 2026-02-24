import { ResponseUtil, createLogger } from "@libs/common";
import { NotificationChannel } from "@libs/common/enums";
import { CurrentUser, Roles } from "@libs/decorators";
import { JwtAuthGuard, RolesGuard } from "@libs/guards";
import {
  ChannelWebhookService,
  FirebaseWebhookHandler,
  MetaWhatsAppWebhookHandler,
  SendGridWebhookHandler,
  TwilioWebhookHandler,
} from "@libs/notifications";
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Model } from "mongoose";
import {
  RegisterWebhookDto,
  TestWebhookDto,
  UpdateWebhookDto,
  WebhookResponseDto,
  WebhookStatsDto,
} from "../dto/webhook.dto";
import { WebhookLog, WebhookLogDocument } from "../schemas/webhook-log.schema";
import { Webhook, WebhookDocument } from "../schemas/webhook.schema";

const logger = createLogger("WebhookDashboardController");

/**
 * Webhook Dashboard Controller
 * Controller para administración de webhooks desde el API Gateway
 * Admin-only: requiere JWT + rol GENERAL_ADMIN
 */
@ApiTags("Webhook Dashboard")
@Controller("admin/webhooks")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("GENERAL_ADMIN")
export class WebhookDashboardController {
  constructor(
    @InjectModel(Webhook.name)
    private readonly webhookModel: Model<WebhookDocument>,
    @InjectModel(WebhookLog.name)
    private readonly webhookLogModel: Model<WebhookLogDocument>,
    private readonly channelWebhookService: ChannelWebhookService,
    private readonly sendGridHandler: SendGridWebhookHandler,
    private readonly twilioHandler: TwilioWebhookHandler,
    private readonly metaWhatsAppHandler: MetaWhatsAppWebhookHandler,
    private readonly firebaseHandler: FirebaseWebhookHandler,
  ) {
    this.initializeHandlers();
  }

  /**
   * Inicializar handlers de webhooks
   */
  private initializeHandlers(): void {
    this.channelWebhookService.registerHandler(
      NotificationChannel.EMAIL,
      this.sendGridHandler,
    );
    this.channelWebhookService.registerHandler(
      NotificationChannel.SMS,
      this.twilioHandler,
    );
    this.channelWebhookService.registerHandler(
      NotificationChannel.WHATSAPP,
      this.twilioHandler,
    );
    this.channelWebhookService.registerHandler(
      NotificationChannel.WHATSAPP,
      this.metaWhatsAppHandler,
    );
    this.channelWebhookService.registerHandler(
      NotificationChannel.PUSH,
      this.firebaseHandler,
    );
  }

  /**
   * Listar todos los webhooks configurados
   */
  @Get()
  @ApiOperation({ summary: "Listar todos los webhooks" })
  @ApiResponse({ status: 200, type: [WebhookResponseDto] })
  async listWebhooks(
    @Query("channel") channel?: string,
    @Query("active") active?: string,
  ): Promise<any> {
    const filter: Record<string, any> = {};
    if (channel) filter.channel = channel;
    if (active !== undefined) filter.active = active === "true";

    const webhooks = await this.webhookModel
      .find(filter)
      .select("-secret")
      .sort({ createdAt: -1 })
      .exec();

    return ResponseUtil.success(webhooks, "Webhooks retrieved successfully");
  }

  /**
   * Obtener webhooks por canal
   */
  @Get("channel/:channel")
  @ApiOperation({ summary: "Obtener webhooks por canal" })
  @ApiResponse({ status: 200, type: [WebhookResponseDto] })
  async getWebhooksByChannel(
    @Param("channel") channel: NotificationChannel,
  ): Promise<any> {
    const webhooks = await this.webhookModel
      .find({ channel })
      .select("-secret")
      .exec();

    return ResponseUtil.success(
      webhooks,
      `Webhooks for channel ${channel} retrieved`,
    );
  }

  /**
   * Registrar nuevo webhook
   */
  @Post()
  @ApiOperation({ summary: "Registrar nuevo webhook" })
  @ApiResponse({ status: 201, type: WebhookResponseDto })
  async registerWebhook(
    @Body() dto: RegisterWebhookDto,
    @CurrentUser("sub") userId: string,
  ): Promise<any> {
    const hasHandler = this.channelWebhookService.hasHandler(
      dto.channel,
      dto.provider,
    );

    if (!hasHandler) {
      throw new NotFoundException(
        `No handler found for ${dto.provider} in channel ${dto.channel}`,
      );
    }

    const webhook = await this.webhookModel.create({
      channel: dto.channel,
      provider: dto.provider,
      url: dto.url,
      secret: dto.secret,
      config: dto.config,
      active: dto.active ?? true,
      createdBy: userId,
    });

    logger.info("Webhook registered", {
      webhookId: webhook._id,
      channel: dto.channel,
      provider: dto.provider,
      createdBy: userId,
    });

    const result = webhook.toObject();
    delete result.secret;

    return ResponseUtil.success(result, "Webhook registered successfully");
  }

  /**
   * Actualizar webhook
   */
  @Put(":id")
  @ApiOperation({ summary: "Actualizar webhook" })
  @ApiResponse({ status: 200, type: WebhookResponseDto })
  async updateWebhook(
    @Param("id") id: string,
    @Body() dto: UpdateWebhookDto,
    @CurrentUser("sub") userId: string,
  ): Promise<any> {
    const updateData: Record<string, any> = { updatedBy: userId };
    if (dto.url !== undefined) updateData.url = dto.url;
    if (dto.secret !== undefined) updateData.secret = dto.secret;
    if (dto.config !== undefined) updateData.config = dto.config;
    if (dto.active !== undefined) updateData.active = dto.active;

    const webhook = await this.webhookModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .select("-secret")
      .exec();

    if (!webhook) {
      throw new NotFoundException(`Webhook ${id} not found`);
    }

    logger.info("Webhook updated", { webhookId: id, updatedBy: userId });

    return ResponseUtil.success(webhook, "Webhook updated successfully");
  }

  /**
   * Eliminar webhook
   */
  @Delete(":id")
  @ApiOperation({ summary: "Eliminar webhook" })
  @ApiResponse({ status: 200 })
  async deleteWebhook(
    @Param("id") id: string,
    @CurrentUser("sub") userId: string,
  ): Promise<any> {
    const webhook = await this.webhookModel.findByIdAndDelete(id).exec();

    if (!webhook) {
      throw new NotFoundException(`Webhook ${id} not found`);
    }

    logger.info("Webhook deleted", {
      webhookId: id,
      channel: webhook.channel,
      provider: webhook.provider,
      deletedBy: userId,
    });

    return ResponseUtil.success(null, "Webhook deleted successfully");
  }

  /**
   * Obtener estadísticas de webhook
   */
  @Get(":id/stats")
  @ApiOperation({ summary: "Obtener estadísticas de webhook" })
  @ApiResponse({ status: 200, type: WebhookStatsDto })
  async getWebhookStats(@Param("id") id: string): Promise<any> {
    const webhook = await this.webhookModel
      .findById(id)
      .select("-secret")
      .exec();
    if (!webhook) {
      throw new NotFoundException(`Webhook ${id} not found`);
    }

    const successRate =
      webhook.totalEvents > 0
        ? (webhook.successfulEvents / webhook.totalEvents) * 100
        : 0;

    const eventsByType = await this.webhookLogModel.aggregate([
      { $match: { webhookId: id } },
      { $group: { _id: "$eventType", count: { $sum: 1 } } },
    ]);

    const stats: WebhookStatsDto = {
      webhookId: id,
      channel: webhook.channel as NotificationChannel,
      provider: webhook.provider,
      totalEvents: webhook.totalEvents,
      successfulEvents: webhook.successfulEvents,
      failedEvents: webhook.failedEvents,
      successRate: Math.round(successRate * 100) / 100,
      averageProcessingTime: 0,
      lastEventAt: webhook.lastEventAt,
      eventsByType: Object.fromEntries(
        eventsByType.map((e: any) => [e._id || "unknown", e.count]),
      ),
    };

    return ResponseUtil.success(stats, "Stats retrieved successfully");
  }

  /**
   * Obtener logs de webhook
   */
  @Get(":id/logs")
  @ApiOperation({ summary: "Obtener logs de webhook" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "offset", required: false, type: Number })
  @ApiResponse({ status: 200 })
  async getWebhookLogs(
    @Param("id") id: string,
    @Query("limit") limit: number = 50,
    @Query("offset") offset: number = 0,
  ): Promise<any> {
    const numLimit = Number(limit) || 50;
    const numOffset = Number(offset) || 0;

    const [logs, total] = await Promise.all([
      this.webhookLogModel
        .find({ webhookId: id })
        .sort({ createdAt: -1 })
        .skip(numOffset)
        .limit(numLimit)
        .exec(),
      this.webhookLogModel.countDocuments({ webhookId: id }).exec(),
    ]);

    return ResponseUtil.paginated(
      logs,
      total,
      Math.floor(numOffset / numLimit) + 1,
      numLimit,
    );
  }

  /**
   * Probar webhook
   */
  @Post(":id/test")
  @ApiOperation({ summary: "Probar webhook con evento simulado" })
  @ApiResponse({ status: 200 })
  async testWebhook(
    @Param("id") id: string,
    @Body() dto: TestWebhookDto,
  ): Promise<any> {
    const webhook = await this.webhookModel.findById(id).exec();
    if (!webhook) {
      throw new NotFoundException(`Webhook ${id} not found`);
    }

    const testPayload = {
      eventType: dto.eventType,
      messageId: `test-${Date.now()}`,
      timestamp: new Date(),
      testData: dto.testData,
    };

    const startTime = Date.now();
    let success = true;
    let error: string | undefined;

    try {
      await this.channelWebhookService.processWebhook(
        webhook.channel as NotificationChannel,
        webhook.provider,
        testPayload,
        undefined,
        webhook.secret || "",
      );
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : "Test failed";
    }

    await this.webhookLogModel.create({
      webhookId: id,
      channel: webhook.channel,
      provider: webhook.provider,
      eventType: dto.eventType,
      messageId: testPayload.messageId,
      success,
      error,
      requestBody: testPayload,
      responseStatus: success ? 200 : 500,
      processingTime: Date.now() - startTime,
    });

    return ResponseUtil.success(
      { ...testPayload, success, error },
      success
        ? "Test webhook event sent successfully"
        : "Test webhook event failed",
    );
  }

  /**
   * Endpoint para recibir webhooks (público — no requiere auth)
   * NOTE: This specific endpoint bypasses admin guards via route exclusion
   */
  @Post("receive/:channel/:provider")
  @ApiOperation({ summary: "Recibir webhook de proveedor" })
  @ApiResponse({ status: 200 })
  async receiveWebhook(
    @Param("channel") channel: NotificationChannel,
    @Param("provider") provider: string,
    @Body() body: any,
    @Headers("x-signature") signature?: string,
    @Headers("x-twilio-signature") twilioSignature?: string,
  ): Promise<any> {
    const finalSignature = twilioSignature || signature;

    // Get secret from DB instead of env
    const webhook = await this.webhookModel
      .findOne({ channel, provider, active: true })
      .exec();
    const secret =
      webhook?.secret ||
      process.env[`WEBHOOK_SECRET_${provider.toUpperCase()}`] ||
      "";

    const startTime = Date.now();
    let success = true;
    let error: string | undefined;
    let result: any;

    try {
      result = await this.channelWebhookService.processWebhook(
        channel,
        provider,
        body,
        finalSignature,
        secret,
      );
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : "Webhook processing failed";
    }

    // Log event and update stats
    if (webhook) {
      await Promise.all([
        this.webhookLogModel.create({
          webhookId: webhook._id!.toString(),
          channel,
          provider,
          eventType: body?.event || body?.eventType,
          messageId: body?.messageId || body?.MessageSid,
          success,
          error,
          requestBody: body,
          responseStatus: success ? 200 : 400,
          processingTime: Date.now() - startTime,
        }),
        this.webhookModel.findByIdAndUpdate(webhook._id, {
          $inc: {
            totalEvents: 1,
            ...(success ? { successfulEvents: 1 } : { failedEvents: 1 }),
          },
          $set: { lastEventAt: new Date() },
        }),
      ]);
    }

    if (!success) {
      return ResponseUtil.error(error || "Webhook processing failed");
    }
    return ResponseUtil.success(result, "Webhook processed successfully");
  }

  /**
   * Obtener resumen general de webhooks
   */
  @Get("dashboard/summary")
  @ApiOperation({ summary: "Obtener resumen general de webhooks" })
  @ApiResponse({ status: 200 })
  async getDashboardSummary(): Promise<any> {
    const channels = this.channelWebhookService.getAvailableChannels();
    const [totalWebhooks, activeWebhooks, recentLogs] = await Promise.all([
      this.webhookModel.countDocuments().exec(),
      this.webhookModel.countDocuments({ active: true }).exec(),
      this.webhookLogModel
        .countDocuments({
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        })
        .exec(),
    ]);

    const summary = {
      totalChannels: channels.length,
      channels: channels.map((channel) => ({
        channel,
        providers: this.channelWebhookService.getHandlersByChannel(channel),
        totalProviders:
          this.channelWebhookService.getHandlersByChannel(channel).length,
      })),
      totalWebhooks,
      activeWebhooks,
      eventsLast24h: recentLogs,
    };

    return ResponseUtil.success(summary, "Dashboard summary retrieved");
  }
}
