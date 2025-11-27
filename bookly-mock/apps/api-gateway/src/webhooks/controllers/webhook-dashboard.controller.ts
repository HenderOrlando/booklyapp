import { NotificationChannel } from "@libs/common/enums";
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
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import {
  RegisterWebhookDto,
  TestWebhookDto,
  UpdateWebhookDto,
  WebhookLogDto,
  WebhookResponseDto,
  WebhookStatsDto,
} from "../dto/webhook.dto";

/**
 * Webhook Dashboard Controller
 * Controller para administración de webhooks desde el API Gateway
 */
@ApiTags("Webhook Dashboard")
@Controller("admin/webhooks")
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard, RolesGuard) // TODO: Descomentar cuando se implemente auth
export class WebhookDashboardController {
  constructor(
    private readonly channelWebhookService: ChannelWebhookService,
    private readonly sendGridHandler: SendGridWebhookHandler,
    private readonly twilioHandler: TwilioWebhookHandler,
    private readonly metaWhatsAppHandler: MetaWhatsAppWebhookHandler,
    private readonly firebaseHandler: FirebaseWebhookHandler
  ) {
    this.initializeHandlers();
  }

  /**
   * Inicializar handlers de webhooks
   */
  private initializeHandlers(): void {
    // Registrar handlers por canal
    this.channelWebhookService.registerHandler(
      NotificationChannel.EMAIL,
      this.sendGridHandler
    );

    this.channelWebhookService.registerHandler(
      NotificationChannel.SMS,
      this.twilioHandler
    );

    this.channelWebhookService.registerHandler(
      NotificationChannel.WHATSAPP,
      this.twilioHandler
    );

    this.channelWebhookService.registerHandler(
      NotificationChannel.WHATSAPP,
      this.metaWhatsAppHandler
    );

    this.channelWebhookService.registerHandler(
      NotificationChannel.PUSH,
      this.firebaseHandler
    );
  }

  /**
   * Listar todos los webhooks configurados
   */
  @Get()
  @ApiOperation({ summary: "Listar todos los webhooks" })
  @ApiResponse({ status: 200, type: [WebhookResponseDto] })
  async listWebhooks(): Promise<any> {
    // TODO: Implementar con base de datos
    const channels = this.channelWebhookService.getAvailableChannels();

    const webhooks = channels.map((channel) => {
      const providers =
        this.channelWebhookService.getHandlersByChannel(channel);

      return providers.map((provider) => ({
        id: `${channel}-${provider}`,
        channel,
        provider,
        url: `/webhooks/${channel.toLowerCase()}/${provider}`,
        active: true,
        hasSecret: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    });

    return {
      success: true,
      data: webhooks.flat(),
      message: "Webhooks retrieved successfully",
    };
  }

  /**
   * Obtener webhooks por canal
   */
  @Get("channel/:channel")
  @ApiOperation({ summary: "Obtener webhooks por canal" })
  @ApiResponse({ status: 200, type: [WebhookResponseDto] })
  async getWebhooksByChannel(
    @Param("channel") channel: NotificationChannel
  ): Promise<any> {
    const providers = this.channelWebhookService.getHandlersByChannel(channel);

    const webhooks = providers.map((provider) => ({
      id: `${channel}-${provider}`,
      channel,
      provider,
      url: `/webhooks/${channel.toLowerCase()}/${provider}`,
      active: true,
      hasSecret: true,
    }));

    return {
      success: true,
      data: webhooks,
      message: `Webhooks for channel ${channel} retrieved`,
    };
  }

  /**
   * Registrar nuevo webhook
   */
  @Post()
  @ApiOperation({ summary: "Registrar nuevo webhook" })
  @ApiResponse({ status: 201, type: WebhookResponseDto })
  async registerWebhook(@Body() dto: RegisterWebhookDto): Promise<any> {
    // TODO: Guardar en base de datos

    // Verificar que existe handler para este canal/provider
    const hasHandler = this.channelWebhookService.hasHandler(
      dto.channel,
      dto.provider
    );

    if (!hasHandler) {
      return {
        success: false,
        error: `No handler found for ${dto.provider} in channel ${dto.channel}`,
        statusCode: 404,
      };
    }

    const webhook = {
      id: `${dto.channel}-${dto.provider}-${Date.now()}`,
      channel: dto.channel,
      provider: dto.provider,
      url: dto.url,
      active: dto.active ?? true,
      hasSecret: !!dto.secret,
      config: dto.config,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      success: true,
      data: webhook,
      message: "Webhook registered successfully",
    };
  }

  /**
   * Actualizar webhook
   */
  @Put(":id")
  @ApiOperation({ summary: "Actualizar webhook" })
  @ApiResponse({ status: 200, type: WebhookResponseDto })
  async updateWebhook(
    @Param("id") id: string,
    @Body() dto: UpdateWebhookDto
  ): Promise<any> {
    // TODO: Actualizar en base de datos

    return {
      success: true,
      data: {
        id,
        ...dto,
        updatedAt: new Date(),
      },
      message: "Webhook updated successfully",
    };
  }

  /**
   * Eliminar webhook
   */
  @Delete(":id")
  @ApiOperation({ summary: "Eliminar webhook" })
  @ApiResponse({ status: 200 })
  async deleteWebhook(@Param("id") id: string): Promise<any> {
    // TODO: Eliminar de base de datos

    return {
      success: true,
      data: null,
      message: "Webhook deleted successfully",
    };
  }

  /**
   * Obtener estadísticas de webhook
   */
  @Get(":id/stats")
  @ApiOperation({ summary: "Obtener estadísticas de webhook" })
  @ApiResponse({ status: 200, type: WebhookStatsDto })
  async getWebhookStats(@Param("id") id: string): Promise<any> {
    // TODO: Obtener estadísticas de base de datos

    const stats: WebhookStatsDto = {
      webhookId: id,
      channel: NotificationChannel.EMAIL,
      provider: "sendgrid",
      totalEvents: 1000,
      successfulEvents: 950,
      failedEvents: 50,
      successRate: 95.0,
      averageProcessingTime: 125,
      lastEventAt: new Date(),
      eventsByType: {
        delivered: 800,
        opened: 100,
        clicked: 50,
      },
    };

    return {
      success: true,
      data: stats,
      message: "Stats retrieved successfully",
    };
  }

  /**
   * Obtener logs de webhook
   */
  @Get(":id/logs")
  @ApiOperation({ summary: "Obtener logs de webhook" })
  @ApiQuery({ name: "limit", required: false, type: Number })
  @ApiQuery({ name: "offset", required: false, type: Number })
  @ApiResponse({ status: 200, type: [WebhookLogDto] })
  async getWebhookLogs(
    @Param("id") id: string,
    @Query("limit") limit: number = 50,
    @Query("offset") offset: number = 0
  ): Promise<any> {
    // TODO: Obtener logs de base de datos

    const logs: WebhookLogDto[] = [];

    return {
      success: true,
      data: logs,
      total: logs.length,
      limit,
      offset,
    };
  }

  /**
   * Probar webhook
   */
  @Post(":id/test")
  @ApiOperation({ summary: "Probar webhook con evento simulado" })
  @ApiResponse({ status: 200 })
  async testWebhook(
    @Param("id") id: string,
    @Body() dto: TestWebhookDto
  ): Promise<any> {
    // TODO: Generar evento de prueba y enviarlo

    const testPayload = {
      eventType: dto.eventType,
      messageId: `test-${Date.now()}`,
      timestamp: new Date(),
      testData: dto.testData,
    };

    return {
      success: true,
      data: testPayload,
      message: "Test webhook event sent successfully",
    };
  }

  /**
   * Endpoint para recibir webhooks (público)
   */
  @Post("receive/:channel/:provider")
  @ApiOperation({ summary: "Recibir webhook de proveedor" })
  @ApiResponse({ status: 200 })
  async receiveWebhook(
    @Param("channel") channel: NotificationChannel,
    @Param("provider") provider: string,
    @Body() body: any,
    @Headers("x-signature") signature?: string,
    @Headers("x-twilio-signature") twilioSignature?: string
  ): Promise<any> {
    // Usar la firma correcta según el proveedor
    const finalSignature = twilioSignature || signature;

    // TODO: Obtener secret desde base de datos
    const secret =
      process.env[`WEBHOOK_SECRET_${provider.toUpperCase()}`] || "";

    try {
      const result = await this.channelWebhookService.processWebhook(
        channel,
        provider,
        body,
        finalSignature,
        secret
      );

      return {
        success: true,
        data: result,
        message: "Webhook processed successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Webhook processing failed",
        statusCode: 400,
      };
    }
  }

  /**
   * Obtener resumen general de webhooks
   */
  @Get("dashboard/summary")
  @ApiOperation({ summary: "Obtener resumen general de webhooks" })
  @ApiResponse({ status: 200 })
  async getDashboardSummary(): Promise<any> {
    const channels = this.channelWebhookService.getAvailableChannels();

    const summary = {
      totalChannels: channels.length,
      channels: channels.map((channel) => ({
        channel,
        providers: this.channelWebhookService.getHandlersByChannel(channel),
        totalProviders:
          this.channelWebhookService.getHandlersByChannel(channel).length,
      })),
      totalWebhooks: channels.reduce(
        (acc, channel) =>
          acc + this.channelWebhookService.getHandlersByChannel(channel).length,
        0
      ),
    };

    return {
      success: true,
      data: summary,
      message: "Dashboard summary retrieved",
    };
  }
}
