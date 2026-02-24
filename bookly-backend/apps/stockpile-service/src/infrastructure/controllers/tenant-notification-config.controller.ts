import {
  TenantNotificationConfigEntity,
  TenantNotificationConfigRepository,
  TenantNotificationConfigService,
} from "@libs/notifications";
import { ResponseUtil } from "@libs/common";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  CreateTenantNotificationConfigDto,
  TenantNotificationConfigResponseDto,
  UpdateTenantNotificationConfigDto,
} from "@stockpile/application/dto/tenant-notification-config.dto";

/**
 * Tenant Notification Configuration Controller
 * Gestión de configuraciones de notificación por tenant
 */
@ApiTags("Tenant Notification Config")
@Controller("tenant-notification-configs")
export class TenantNotificationConfigController {
  constructor(
    private readonly configService: TenantNotificationConfigService,
    private readonly repository: TenantNotificationConfigRepository
  ) {}

  /**
   * Crear configuración de tenant
   */
  @Post()
  @ApiOperation({
    summary: "Crear configuración de notificación para un tenant",
  })
  @ApiResponse({
    status: 201,
    description: "Configuración creada exitosamente",
    type: TenantNotificationConfigResponseDto,
  })
  async create(
    @Body() dto: CreateTenantNotificationConfigDto
  ): Promise<TenantNotificationConfigResponseDto> {
    const entity = new TenantNotificationConfigEntity(
      undefined as any,
      dto.tenantId,
      dto.emailProvider as any,
      dto.smsProvider as any,
      dto.whatsappProvider as any,
      dto.isActive ?? true
    );

    const created = await this.repository.create(entity);

    // Actualizar cache del servicio
    await this.configService.setTenantConfig(dto.tenantId, {
      tenantId: dto.tenantId,
      email: dto.emailProvider as any,
      sms: dto.smsProvider as any,
      whatsapp: dto.whatsappProvider as any,
    });

    return this.toResponseDto(created);
  }

  /**
   * Obtener configuración por tenant ID
   */
  @Get(":tenantId")
  @ApiOperation({ summary: "Obtener configuración de un tenant" })
  @ApiResponse({
    status: 200,
    description: "Configuración encontrada",
    type: TenantNotificationConfigResponseDto,
  })
  @ApiResponse({ status: 404, description: "Configuración no encontrada" })
  async findByTenantId(
    @Param("tenantId") tenantId: string
  ): Promise<TenantNotificationConfigResponseDto | null> {
    const entity = await this.repository.findByTenantId(tenantId);
    return entity ? this.toResponseDto(entity) : null;
  }

  /**
   * Listar todas las configuraciones
   */
  @Get()
  @ApiOperation({ summary: "Listar todas las configuraciones de tenants" })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Número de página (default: 1)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items por página (default: 20)",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de configuraciones",
    type: [TenantNotificationConfigResponseDto],
  })
  async findAll(
    @Query("page") page?: number,
    @Query("limit") limit?: number
  ): Promise<any> {
    const entities = await this.repository.findAll(false);
    const items = entities.map((entity) => this.toResponseDto(entity));
    
    // Aplicar paginación en memoria
    const currentPage = page || 1;
    const pageSize = limit || 20;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedItems = items.slice(startIndex, endIndex);
    
    return ResponseUtil.paginated(
      paginatedItems,
      items.length,
      currentPage,
      pageSize,
      'Tenant notification configs retrieved successfully'
    );
  }

  /**
   * Actualizar configuración
   */
  @Put(":tenantId")
  @ApiOperation({ summary: "Actualizar configuración de un tenant" })
  @ApiResponse({
    status: 200,
    description: "Configuración actualizada exitosamente",
    type: TenantNotificationConfigResponseDto,
  })
  async update(
    @Param("tenantId") tenantId: string,
    @Body() dto: UpdateTenantNotificationConfigDto
  ): Promise<TenantNotificationConfigResponseDto | null> {
    const existing = await this.repository.findByTenantId(tenantId);
    if (!existing) {
      return null;
    }

    const entity = new TenantNotificationConfigEntity(
      existing.id,
      existing.tenantId,
      (dto.emailProvider as any) ?? existing.emailProvider,
      (dto.smsProvider as any) ?? existing.smsProvider,
      (dto.whatsappProvider as any) ?? existing.whatsappProvider,
      dto.isActive ?? existing.isActive,
      existing.createdAt,
      new Date()
    );

    const updated = await this.repository.update(tenantId, entity);

    if (updated) {
      // Actualizar cache
      await this.configService.setTenantConfig(tenantId, {
        tenantId: updated.tenantId,
        email: updated.emailProvider as any,
        sms: updated.smsProvider as any,
        whatsapp: updated.whatsappProvider as any,
      });
    }

    return updated ? this.toResponseDto(updated) : null;
  }

  /**
   * Eliminar configuración
   */
  @Delete(":tenantId")
  @ApiOperation({ summary: "Eliminar configuración de un tenant" })
  @ApiResponse({
    status: 200,
    description: "Configuración eliminada exitosamente",
  })
  @ApiResponse({ status: 404, description: "Configuración no encontrada" })
  async delete(
    @Param("tenantId") tenantId: string
  ): Promise<{ success: boolean }> {
    const success = await this.repository.delete(tenantId);
    if (success) {
      await this.configService.deleteTenantConfig(tenantId);
    }
    return { success };
  }

  /**
   * Activar configuración
   */
  @Put(":tenantId/activate")
  @ApiOperation({ summary: "Activar configuración de un tenant" })
  @ApiResponse({ status: 200, description: "Configuración activada" })
  async activate(
    @Param("tenantId") tenantId: string
  ): Promise<{ success: boolean }> {
    const success = await this.repository.activate(tenantId);
    return { success };
  }

  /**
   * Desactivar configuración
   */
  @Put(":tenantId/deactivate")
  @ApiOperation({ summary: "Desactivar configuración de un tenant" })
  @ApiResponse({ status: 200, description: "Configuración desactivada" })
  async deactivate(
    @Param("tenantId") tenantId: string
  ): Promise<{ success: boolean }> {
    const success = await this.repository.deactivate(tenantId);
    return { success };
  }

  /**
   * Obtener información de proveedor actual
   */
  @Get(":tenantId/provider-info/:channel")
  @ApiOperation({ summary: "Obtener información del proveedor configurado" })
  @ApiResponse({ status: 200, description: "Información del proveedor" })
  async getProviderInfo(
    @Param("tenantId") tenantId: string,
    @Param("channel") channel: string
  ): Promise<any> {
    // TODO: Implementar según el canal (email, sms, whatsapp)
    return { tenantId, channel, message: "Not implemented" };
  }

  /**
   * Mapear entidad a DTO de respuesta
   */
  private toResponseDto(
    entity: TenantNotificationConfigEntity
  ): TenantNotificationConfigResponseDto {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      emailProvider: entity.emailProvider as any,
      smsProvider: entity.smsProvider as any,
      whatsappProvider: entity.whatsappProvider as any,
      isActive: entity.isActive,
      createdAt: entity.createdAt!,
      updatedAt: entity.updatedAt!,
    };
  }
}
