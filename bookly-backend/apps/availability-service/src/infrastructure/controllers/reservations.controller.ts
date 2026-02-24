import { RequirePermissions } from "@libs/common/decorators";
import { ResponseUtil } from "@libs/common";
import { CurrentUser } from "@libs/decorators";
import { JwtAuthGuard, PermissionsGuard } from "@libs/guards";
import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Response } from "express";
import {
  CancelRecurringInstanceCommand,
  CancelRecurringSeriesCommand,
  CancelReservationCommand,
  CheckInReservationCommand,
  CheckOutReservationCommand,
  CreateBatchReservationCommand,
  CreateRecurringReservationCommand,
  CreateReservationCommand,
  ModifyRecurringInstanceCommand,
  UpdateRecurringSeriesCommand,
  UpdateReservationCommand,
} from '@availability/application/commands';
import {
  GetRecurringAnalyticsQuery,
  GetRecurringSeriesQuery,
  GetReservationByIdQuery,
  GetReservationsQuery,
  GetReservationStatsQuery,
  GetUserRecurringReservationsQuery,
  PreviewRecurringSeriesQuery,
} from '@availability/application/queries';
import { CalendarExportService } from '@availability/application/services/calendar-export.service';
import {
  CancelInstanceDto,
  CancelRecurringSeriesDto,
  CancelReservationDto,
  CreateBatchReservationDto,
  CreateRecurringReservationDto,
  CreateReservationDto,
  ModifyInstanceDto,
  PreviewRecurringReservationDto,
  QueryReservationDto,
  RecurringAnalyticsFiltersDto,
  RecurringReservationFiltersDto,
  UpdateRecurringSeriesDto,
  UpdateReservationDto,
} from "../dtos";

/**
 * Reservations Controller
 * Controlador REST para gestión de reservas
 */
@ApiTags("Reservations")
@ApiBearerAuth()
@Controller("reservations")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReservationsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly calendarExportService: CalendarExportService
  ) {}

  @Post()
  @RequirePermissions("reservations:create")
  @ApiOperation({ summary: "Crear una nueva reserva" })
  @ApiResponse({
    status: 201,
    description: "Reserva creada exitosamente",
  })
  @ApiResponse({
    status: 400,
    description: "Datos inválidos o conflicto de disponibilidad",
  })
  async create(
    @Body() dto: CreateReservationDto,
    @CurrentUser() user: any
  ): Promise<any> {
    const command = new CreateReservationCommand(
      dto.resourceId,
      dto.userId,
      dto.startDate,
      dto.endDate,
      dto.purpose,
      dto.isRecurring,
      dto.recurringPattern,
      dto.participants,
      dto.notes,
      dto.externalCalendarId,
      dto.externalCalendarEventId,
      user.sub
    );

    const reservation = await this.commandBus.execute(command);
    // Convertir entidad a objeto plano (incluye title, resourceName, userName)
    // para mantener consistencia con el formato de GET /reservations
    const data = typeof reservation.toObject === 'function'
      ? reservation.toObject()
      : reservation;
    return ResponseUtil.success(data, 'Reservation created successfully');
  }

  @Get()
  @ApiOperation({ summary: "Obtener lista de reservas con filtros" })
  @ApiResponse({
    status: 200,
    description: "Lista de reservas obtenida exitosamente",
  })
  async findAll(@Query() query: QueryReservationDto): Promise<any> {
    const queryObj = new GetReservationsQuery(
      {
        page: query.page || 1,
        limit: query.limit || 10,
      },
      {
        userId: query.userId,
        resourceId: query.resourceId,
        status: query.status,
        startDate: query.startDate,
        endDate: query.endDate,
      }
    );

    const result = await this.queryBus.execute(queryObj);
    
    // El handler retorna { reservations: ReservationEntity[], meta }
    const reservations = result.reservations || result.data || [];
    const meta = result.meta;

    // Convertir entidades a objetos planos (incluye title, resourceName, userName)
    const items = reservations.map((r: any) =>
      typeof r.toObject === 'function' ? r.toObject() : r,
    );

    return ResponseUtil.paginated(
      items,
      meta?.total || items.length,
      query.page || 1,
      query.limit || 10,
      'Reservations retrieved successfully'
    );
  }

  /**
   * RF-19: Crear reservas múltiples en una solicitud
   */
  @Post("batch")
  @RequirePermissions("reservations:create")
  @ApiOperation({
    summary: "Crear reservas múltiples en una solicitud (RF-19)",
    description:
      "Permite reservar múltiples recursos de forma atómica. Si failOnConflict=true (default), se hace rollback de todas las reservas si alguna falla.",
  })
  @ApiResponse({
    status: 201,
    description: "Reservas batch creadas exitosamente",
  })
  @ApiResponse({
    status: 400,
    description: "Datos inválidos o conflicto de disponibilidad",
  })
  async createBatch(
    @Body() dto: CreateBatchReservationDto,
    @CurrentUser() user: any
  ): Promise<any> {
    const command = new CreateBatchReservationCommand(
      user.sub,
      dto.reservations.map((r) => ({
        resourceId: r.resourceId,
        startDate: new Date(r.startDate),
        endDate: new Date(r.endDate),
        purpose: r.purpose,
        notes: r.notes,
      })),
      dto.failOnConflict ?? true,
      user.sub
    );

    const result = await this.commandBus.execute(command);
    return ResponseUtil.success(result, "Batch reservations processed successfully");
  }

  @Get("stats")
  @ApiOperation({ summary: "Obtener estadísticas de reservas" })
  @ApiResponse({
    status: 200,
    description: "Estadísticas obtenidas exitosamente",
  })
  async getStats(@Query() query: QueryReservationDto): Promise<any> {
    const queryObj = new GetReservationStatsQuery({
      userId: query.userId,
      resourceId: query.resourceId,
      startDate: query.startDate,
      endDate: query.endDate,
    });

    const result = await this.queryBus.execute(queryObj);
    return ResponseUtil.success(result, "Reservation stats retrieved successfully");
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener una reserva por ID" })
  @ApiResponse({
    status: 200,
    description: "Reserva obtenida exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Reserva no encontrada",
  })
  async findOne(@Param("id") id: string): Promise<any> {
    const query = new GetReservationByIdQuery(id);
    const reservation = await this.queryBus.execute(query);
    const item = typeof reservation?.toObject === 'function' ? reservation.toObject() : reservation;
    return ResponseUtil.success(item, 'Reservation retrieved successfully');
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar una reserva" })
  @ApiResponse({
    status: 200,
    description: "Reserva actualizada exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Reserva no encontrada",
  })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateReservationDto,
    @CurrentUser() user: any
  ): Promise<any> {
    const command = new UpdateReservationCommand(
      id,
      dto.startDate,
      dto.endDate,
      dto.purpose,
      dto.participants,
      dto.notes,
      user.sub
    );

    const reservation = await this.commandBus.execute(command);
    const data = typeof reservation?.toObject === 'function'
      ? reservation.toObject()
      : reservation;
    return ResponseUtil.success(data, 'Reservation updated successfully');
  }

  @Post(":id/cancel")
  @ApiOperation({ summary: "Cancelar una reserva" })
  @ApiResponse({
    status: 200,
    description: "Reserva cancelada exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Reserva no encontrada",
  })
  async cancel(
    @Param("id") id: string,
    @Body() dto: CancelReservationDto,
    @CurrentUser() user: any
  ): Promise<any> {
    const command = new CancelReservationCommand(
      id,
      user.sub,
      dto.cancellationReason
    );

    const result = await this.commandBus.execute(command);
    const data = typeof result?.toObject === 'function'
      ? result.toObject()
      : result;
    return ResponseUtil.success(data, 'Reservation cancelled successfully');
  }

  @Post(":id/check-in")
  @ApiOperation({ summary: "Realizar check-in de una reserva" })
  @ApiResponse({
    status: 200,
    description: "Check-in realizado exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Reserva no encontrada",
  })
  async checkIn(
    @Param("id") id: string,
    @CurrentUser() user: any
  ): Promise<any> {
    const command = new CheckInReservationCommand(id, user.sub);
    const result = await this.commandBus.execute(command);
    const data = typeof result?.toObject === 'function'
      ? result.toObject()
      : result;
    return ResponseUtil.success(data, 'Check-in completed successfully');
  }

  @Post(":id/check-out")
  @ApiOperation({ summary: "Realizar check-out de una reserva" })
  @ApiResponse({
    status: 200,
    description: "Check-out realizado exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Reserva no encontrada",
  })
  async checkOut(
    @Param("id") id: string,
    @CurrentUser() user: any
  ): Promise<any> {
    const command = new CheckOutReservationCommand(id, user.sub);
    const result = await this.commandBus.execute(command);
    const data = typeof result?.toObject === 'function'
      ? result.toObject()
      : result;
    return ResponseUtil.success(data, 'Check-out completed successfully');
  }

  @Delete(":id")
  @ApiOperation({ summary: "Eliminar una reserva" })
  @ApiResponse({
    status: 200,
    description: "Reserva eliminada exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Reserva no encontrada",
  })
  async remove(@Param("id") id: string): Promise<any> {
    // Para eliminar se puede usar cancel con estado específico
    // o crear un DeleteReservationCommand separado
    const command = new CancelReservationCommand(id, "system", "Deleted");
    return await this.commandBus.execute(command);
  }

  // ==================== RESERVAS RECURRENTES ====================

  @Post("recurring")
  @ApiOperation({ summary: "Crear una serie de reservas recurrentes" })
  @ApiResponse({
    status: 201,
    description: "Serie de reservas recurrentes creada exitosamente",
  })
  @ApiResponse({
    status: 400,
    description: "Datos inválidos o conflictos detectados",
  })
  async createRecurringSeries(
    @Body() dto: CreateRecurringReservationDto,
    @CurrentUser() user: any
  ): Promise<any> {
    const command = new CreateRecurringReservationCommand(dto, user.sub);
    return await this.commandBus.execute(command);
  }

  @Post("recurring/preview")
  @ApiOperation({ summary: "Preview de serie recurrente (sin crear reservas)" })
  @ApiResponse({
    status: 200,
    description: "Preview de series generado exitosamente",
  })
  @ApiResponse({
    status: 400,
    description: "Datos inválidos",
  })
  async previewRecurringSeries(
    @Body() dto: PreviewRecurringReservationDto
  ): Promise<any> {
    const query = new PreviewRecurringSeriesQuery(dto);
    return await this.queryBus.execute(query);
  }

  @Get("recurring")
  @ApiOperation({ summary: "Obtener series recurrentes del usuario" })
  @ApiResponse({
    status: 200,
    description: "Lista de series recurrentes obtenida exitosamente",
  })
  async getUserRecurringSeries(
    @Query() filters: RecurringReservationFiltersDto,
    @CurrentUser() user: any
  ): Promise<any> {
    // Asegurar que solo vea sus propias series
    filters.userId = user.sub;
    const query = new GetUserRecurringReservationsQuery(filters);
    return await this.queryBus.execute(query);
  }

  @Get("recurring/analytics")
  @ApiOperation({
    summary: "Obtener analytics y métricas de series recurrentes",
  })
  @ApiResponse({
    status: 200,
    description: "Analytics generados exitosamente",
  })
  async getRecurringAnalytics(
    @Query() filters: RecurringAnalyticsFiltersDto
  ): Promise<any> {
    const query = new GetRecurringAnalyticsQuery(filters);
    return await this.queryBus.execute(query);
  }

  @Get("series/:seriesId")
  @ApiOperation({ summary: "Obtener una serie recurrente específica" })
  @ApiResponse({
    status: 200,
    description: "Serie recurrente obtenida exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Serie no encontrada",
  })
  async getRecurringSeries(
    @Param("seriesId") seriesId: string,
    @Query("includeInstances") includeInstances: boolean = true
  ): Promise<any> {
    const query = new GetRecurringSeriesQuery(seriesId, includeInstances);
    return await this.queryBus.execute(query);
  }

  @Patch("series/:seriesId")
  @ApiOperation({ summary: "Actualizar una serie recurrente completa" })
  @ApiResponse({
    status: 200,
    description: "Serie actualizada exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Serie no encontrada",
  })
  async updateRecurringSeries(
    @Param("seriesId") seriesId: string,
    @Body() dto: UpdateRecurringSeriesDto,
    @CurrentUser() user: any
  ): Promise<any> {
    const command = new UpdateRecurringSeriesCommand(seriesId, dto, user.sub);
    return await this.commandBus.execute(command);
  }

  @Delete("series/:seriesId")
  @ApiOperation({ summary: "Cancelar una serie recurrente completa" })
  @ApiResponse({
    status: 200,
    description: "Serie cancelada exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Serie no encontrada",
  })
  async cancelRecurringSeries(
    @Param("seriesId") seriesId: string,
    @Body() dto: CancelRecurringSeriesDto,
    @CurrentUser() user: any
  ): Promise<any> {
    const command = new CancelRecurringSeriesCommand(seriesId, dto, user.sub);
    return await this.commandBus.execute(command);
  }

  @Post("series/instances/:instanceId/cancel")
  @ApiOperation({ summary: "Cancelar una instancia individual de una serie" })
  @ApiResponse({
    status: 200,
    description: "Instancia cancelada exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Instancia no encontrada",
  })
  async cancelRecurringInstance(
    @Param("instanceId") instanceId: string,
    @Body() dto: CancelInstanceDto,
    @CurrentUser() user: any
  ): Promise<any> {
    dto.instanceId = instanceId;
    const command = new CancelRecurringInstanceCommand(dto, user.sub);
    return await this.commandBus.execute(command);
  }

  @Patch("series/instances/:instanceId")
  @ApiOperation({ summary: "Modificar una instancia individual de una serie" })
  @ApiResponse({
    status: 200,
    description: "Instancia modificada exitosamente",
  })
  @ApiResponse({
    status: 404,
    description: "Instancia no encontrada",
  })
  async modifyRecurringInstance(
    @Param("instanceId") instanceId: string,
    @Body() dto: ModifyInstanceDto,
    @CurrentUser() user: any
  ): Promise<any> {
    dto.instanceId = instanceId;
    const command = new ModifyRecurringInstanceCommand(dto, user.sub);
    return await this.commandBus.execute(command);
  }

  /**
   * Exportar una reserva a formato iCal (.ics)
   */
  @Get(":id/export.ics")
  @RequirePermissions("reservations:read")
  @ApiOperation({ summary: "Exportar reserva a calendario (iCal)" })
  @ApiResponse({
    status: 200,
    description: "Archivo iCal generado",
    headers: {
      "Content-Type": {
        description: "text/calendar",
      },
      "Content-Disposition": {
        description: "attachment; filename=reserva.ics",
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Reserva no encontrada",
  })
  @Header("Content-Type", "text/calendar; charset=utf-8")
  async exportToCalendar(
    @Param("id") id: string,
    @Res() res: Response
  ): Promise<void> {
    const { content, filename, mimeType } =
      await this.calendarExportService.exportSingleReservation(id);

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(content);
  }

  /**
   * Exportar todas las reservas del usuario
   */
  @Get("export/my-reservations.ics")
  @RequirePermissions("reservations:read")
  @ApiOperation({ summary: "Exportar mis reservas a calendario" })
  @ApiResponse({
    status: 200,
    description: "Archivo iCal con todas las reservas del usuario",
  })
  @Header("Content-Type", "text/calendar; charset=utf-8")
  async exportMyReservations(
    @Res() res: Response,
    @CurrentUser() user: any,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("status") status?: string
  ): Promise<void> {
    const filters: any = {};

    if (startDate) {
      filters.startDate = new Date(startDate);
    }
    if (endDate) {
      filters.endDate = new Date(endDate);
    }
    if (status) {
      filters.status = status.split(",");
    }

    const { content, filename, mimeType } =
      await this.calendarExportService.exportUserReservations(
        user.sub,
        filters
      );

    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(content);
  }

  /**
   * Obtener enlaces para agregar a calendarios
   */
  @Get(":id/calendar-links")
  @RequirePermissions("reservations:read")
  @ApiOperation({ summary: "Obtener enlaces para agregar a calendarios" })
  @ApiResponse({
    status: 200,
    description: "Enlaces de calendario generados",
    schema: {
      example: {
        ical: "/api/v1/reservations/123/export.ics",
        google:
          "https://calendar.google.com/calendar/render?action=TEMPLATE&text=...",
        outlook: "https://outlook.live.com/calendar/0/deeplink/compose?...",
      },
    },
  })
  async getCalendarLinks(@Param("id") id: string): Promise<any> {
    const links = await this.calendarExportService.getCalendarLinks(id);
    return {
      success: true,
      data: links,
      message: "Enlaces de calendario generados",
    };
  }
}
