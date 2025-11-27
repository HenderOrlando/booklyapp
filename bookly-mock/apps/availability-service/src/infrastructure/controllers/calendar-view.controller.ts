import { CurrentUser } from "@libs/decorators";
import { JwtAuthGuard } from "@libs/guards";
import { PermissionsGuard } from "@libs/guards/permissions.guard";
import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { QueryBus } from "@nestjs/cqrs";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { GetCalendarViewQuery } from "../../application/queries/get-calendar-view.query";
import {
  CalendarViewDto,
  CalendarViewResponseDto,
} from "../dtos/calendar-view.dto";

/**
 * Calendar View Controller
 * Controlador REST para vistas de calendario
 */
@ApiTags("Calendar")
@ApiBearerAuth()
@Controller("calendar")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CalendarViewController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get("view")
  @ApiOperation({
    summary: "Obtener vista de calendario",
    description:
      "Genera una vista de calendario (mensual, semanal o diaria) con todos los slots y sus estados. Incluye códigos de color para visualización.",
  })
  @ApiResponse({
    status: 200,
    description: "Vista de calendario generada exitosamente",
    type: CalendarViewResponseDto,
    schema: {
      example: {
        view: "month",
        period: {
          start: "2025-11-01T00:00:00Z",
          end: "2025-11-30T23:59:59Z",
        },
        slots: [
          {
            date: "2025-11-08",
            startTime: "09:00",
            endTime: "10:00",
            status: "available",
            color: "#4CAF50",
            metadata: {
              resourceId: "507f1f77bcf86cd799439011",
              canBook: true,
            },
          },
          {
            date: "2025-11-08",
            startTime: "10:00",
            endTime: "11:00",
            status: "reserved",
            color: "#F44336",
            reservationId: "507f1f77bcf86cd799439012",
            metadata: {
              resourceId: "507f1f77bcf86cd799439011",
              canBook: false,
            },
          },
        ],
        legend: {
          available: "#4CAF50",
          reserved: "#F44336",
          pending: "#FFC107",
          blocked: "#9E9E9E",
          ownReservation: "#2196F3",
        },
        resource: {
          id: "507f1f77bcf86cd799439011",
        },
        metadata: {
          totalSlots: 200,
          availableSlots: 150,
          reservedSlots: 40,
          blockedSlots: 10,
          timezone: "America/Bogota",
          generatedAt: "2025-11-08T15:30:00Z",
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Parámetros inválidos",
  })
  @ApiResponse({
    status: 401,
    description: "No autenticado",
  })
  async getCalendarView(
    @Query() dto: CalendarViewDto,
    @CurrentUser() user: any
  ): Promise<CalendarViewResponseDto> {
    const query = new GetCalendarViewQuery(user.id || user.userId, dto);
    return await this.queryBus.execute(query);
  }

  @Get("month")
  @ApiOperation({
    summary: "Obtener vista mensual",
    description: "Atajo para obtener vista mensual del calendario",
  })
  @ApiResponse({
    status: 200,
    description: "Vista mensual generada exitosamente",
    type: CalendarViewResponseDto,
  })
  async getMonthView(
    @Query("year") year: number,
    @Query("month") month: number,
    @Query("resourceId") resourceId: string,
    @CurrentUser() user: any
  ): Promise<CalendarViewResponseDto> {
    const dto: CalendarViewDto = {
      view: "month" as any,
      year: Number(year),
      month: Number(month),
      resourceId,
    };

    const query = new GetCalendarViewQuery(user.id || user.userId, dto);
    return await this.queryBus.execute(query);
  }

  @Get("week")
  @ApiOperation({
    summary: "Obtener vista semanal",
    description: "Atajo para obtener vista semanal del calendario (ISO 8601)",
  })
  @ApiResponse({
    status: 200,
    description: "Vista semanal generada exitosamente",
    type: CalendarViewResponseDto,
  })
  async getWeekView(
    @Query("year") year: number,
    @Query("week") week: number,
    @Query("resourceId") resourceId: string,
    @CurrentUser() user: any
  ): Promise<CalendarViewResponseDto> {
    const dto: CalendarViewDto = {
      view: "week" as any,
      year: Number(year),
      week: Number(week),
      resourceId,
    };

    const query = new GetCalendarViewQuery(user.id || user.userId, dto);
    return await this.queryBus.execute(query);
  }

  @Get("day")
  @ApiOperation({
    summary: "Obtener vista diaria",
    description: "Atajo para obtener vista diaria del calendario",
  })
  @ApiResponse({
    status: 200,
    description: "Vista diaria generada exitosamente",
    type: CalendarViewResponseDto,
  })
  async getDayView(
    @Query("date") date: string,
    @Query("resourceId") resourceId: string,
    @CurrentUser() user: any
  ): Promise<CalendarViewResponseDto> {
    const dto: CalendarViewDto = {
      view: "day" as any,
      year: new Date(date).getFullYear(),
      date,
      resourceId,
    };

    const query = new GetCalendarViewQuery(user.id || user.userId, dto);
    return await this.queryBus.execute(query);
  }
}
