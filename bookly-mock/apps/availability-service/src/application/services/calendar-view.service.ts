import { CalendarViewType, SlotStatus } from "@libs/common/enums";
import { Inject, Injectable } from "@nestjs/common";
import { IAvailabilityRepository } from "../../domain/repositories/availability.repository.interface";
import { IReservationRepository } from "../../domain/repositories/reservation.repository.interface";
import {
  CalendarLegendDto,
  CalendarSlotDto,
  CalendarViewDto,
  CalendarViewResponseDto,
} from "../../infrastructure/dtos/calendar-view.dto";
import { SlotColorService } from "./slot-color.service";

/**
 * Servicio para generación de vistas de calendario
 * Genera slots mensuales, semanales y diarios con estados y colores
 */
@Injectable()
export class CalendarViewService {
  constructor(
    @Inject("IAvailabilityRepository")
    private readonly availabilityRepository: IAvailabilityRepository,
    @Inject("IReservationRepository")
    private readonly reservationRepository: IReservationRepository,
    private readonly slotColorService: SlotColorService
  ) {}

  /**
   * Generar vista de calendario según parámetros
   */
  async generateCalendarView(
    dto: CalendarViewDto,
    currentUserId?: string
  ): Promise<CalendarViewResponseDto> {
    switch (dto.view) {
      case CalendarViewType.MONTH:
        return await this.generateMonthView(dto, currentUserId);
      case CalendarViewType.WEEK:
        return await this.generateWeekView(dto, currentUserId);
      case CalendarViewType.DAY:
        return await this.generateDayView(dto, currentUserId);
      default:
        throw new Error(`Tipo de vista no soportado: ${dto.view}`);
    }
  }

  /**
   * Generar vista mensual
   */
  private async generateMonthView(
    dto: CalendarViewDto,
    currentUserId?: string
  ): Promise<CalendarViewResponseDto> {
    if (!dto.month) {
      throw new Error("El parámetro 'month' es requerido para vista mensual");
    }

    const { year, month, resourceId } = dto;
    const startDate = new Date(year, month - 1, 1, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const slots = await this.generateSlots(
      startDate,
      endDate,
      resourceId,
      currentUserId
    );

    return this.buildResponse(
      CalendarViewType.MONTH,
      startDate,
      endDate,
      slots,
      resourceId
    );
  }

  /**
   * Generar vista semanal
   */
  private async generateWeekView(
    dto: CalendarViewDto,
    currentUserId?: string
  ): Promise<CalendarViewResponseDto> {
    if (!dto.week) {
      throw new Error("El parámetro 'week' es requerido para vista semanal");
    }

    const { year, week, resourceId } = dto;
    const { startDate, endDate } = this.getWeekDates(year, week);

    const slots = await this.generateSlots(
      startDate,
      endDate,
      resourceId,
      currentUserId
    );

    return this.buildResponse(
      CalendarViewType.WEEK,
      startDate,
      endDate,
      slots,
      resourceId
    );
  }

  /**
   * Generar vista diaria
   */
  private async generateDayView(
    dto: CalendarViewDto,
    currentUserId?: string
  ): Promise<CalendarViewResponseDto> {
    if (!dto.date) {
      throw new Error("El parámetro 'date' es requerido para vista diaria");
    }

    const { resourceId } = dto;
    const startDate = new Date(dto.date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(dto.date);
    endDate.setHours(23, 59, 59, 999);

    const slots = await this.generateSlots(
      startDate,
      endDate,
      resourceId,
      currentUserId
    );

    return this.buildResponse(
      CalendarViewType.DAY,
      startDate,
      endDate,
      slots,
      resourceId
    );
  }

  /**
   * Generar slots dentro de un rango de fechas
   */
  private async generateSlots(
    startDate: Date,
    endDate: Date,
    resourceId: string,
    currentUserId?: string
  ): Promise<CalendarSlotDto[]> {
    // 1. Obtener disponibilidades del recurso
    const availabilities =
      await this.availabilityRepository.findByResource(resourceId);

    // 2. Obtener reservas existentes en el rango
    const reservations = await this.reservationRepository.findByDateRange(
      resourceId,
      startDate,
      endDate
    );

    const slots: CalendarSlotDto[] = [];

    // 3. Generar slots basados en disponibilidades
    for (const availability of availabilities) {
      const daySlots = this.generateDaySlots(
        availability,
        reservations,
        currentUserId
      );
      slots.push(...daySlots);
    }

    // 4. Ordenar por fecha y hora
    return slots.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });
  }

  /**
   * Generar slots para un día específico basado en disponibilidad
   */
  private generateDaySlots(
    availability: any,
    reservations: any[],
    currentUserId?: string
  ): CalendarSlotDto[] {
    const slots: CalendarSlotDto[] = [];
    const {
      startTime,
      endTime,
      slotDuration = 60,
      resourceId,
      daysOfWeek,
      startDate: availStartDate,
      endDate: availEndDate,
    } = availability;

    // Generar fechas dentro del rango de disponibilidad
    const currentDate = new Date(availStartDate);
    const lastDate = new Date(availEndDate);

    while (currentDate <= lastDate) {
      const dayOfWeek = currentDate.getDay();

      // Verificar si el día está en los días permitidos
      if (daysOfWeek && daysOfWeek.includes(dayOfWeek)) {
        const dateStr = currentDate.toISOString().split("T")[0];

        // Generar slots de tiempo para este día
        const timeSlots = this.generateTimeSlots(
          startTime,
          endTime,
          slotDuration
        );

        for (const timeSlot of timeSlots) {
          // Buscar si hay reserva en este slot
          const reservation = this.findReservationInSlot(
            reservations,
            dateStr,
            timeSlot.start,
            timeSlot.end
          );

          let status: SlotStatus;
          let reservationId: string | undefined;
          let userId: string | undefined;

          if (reservation) {
            reservationId = reservation._id.toString();
            userId = reservation.userId.toString();

            if (reservation.status === "PENDING") {
              status = SlotStatus.PENDING;
            } else {
              status =
                userId === currentUserId
                  ? SlotStatus.OWN_RESERVATION
                  : SlotStatus.RESERVED;
            }
          } else {
            status = SlotStatus.AVAILABLE;
          }

          const color = this.slotColorService.getColorByStatus(
            status,
            userId === currentUserId
          );

          slots.push({
            date: dateStr,
            startTime: timeSlot.start,
            endTime: timeSlot.end,
            status,
            color,
            reservationId,
            userId,
            metadata: {
              resourceId: resourceId.toString(),
              canBook: status === SlotStatus.AVAILABLE,
              isRecurring: availability.isRecurring || false,
            },
          });
        }
      }

      // Avanzar al siguiente día
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return slots;
  }

  /**
   * Generar intervalos de tiempo dentro de un rango
   */
  private generateTimeSlots(
    startTime: string,
    endTime: string,
    durationMinutes: number
  ): Array<{ start: string; end: string }> {
    const slots: Array<{ start: string; end: string }> = [];
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    let currentMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    while (currentMinutes < endMinutes) {
      const nextMinutes = currentMinutes + durationMinutes;

      if (nextMinutes <= endMinutes) {
        const startH = Math.floor(currentMinutes / 60)
          .toString()
          .padStart(2, "0");
        const startM = (currentMinutes % 60).toString().padStart(2, "0");
        const endH = Math.floor(nextMinutes / 60)
          .toString()
          .padStart(2, "0");
        const endM = (nextMinutes % 60).toString().padStart(2, "0");

        slots.push({
          start: `${startH}:${startM}`,
          end: `${endH}:${endM}`,
        });
      }

      currentMinutes = nextMinutes;
    }

    return slots;
  }

  /**
   * Buscar reserva que ocupe un slot específico
   */
  private findReservationInSlot(
    reservations: any[],
    date: string,
    startTime: string,
    endTime: string
  ): any | null {
    return reservations.find((res) => {
      const resStartDate = new Date(res.startDate).toISOString().split("T")[0];
      const resStartTime = new Date(res.startDate).toTimeString().slice(0, 5);
      const resEndTime = new Date(res.endDate).toTimeString().slice(0, 5);

      return (
        resStartDate === date &&
        this.timesOverlap(startTime, endTime, resStartTime, resEndTime)
      );
    });
  }

  /**
   * Verificar si dos rangos de tiempo se solapan
   */
  private timesOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    return start1 < end2 && end1 > start2;
  }

  /**
   * Obtener fechas de inicio y fin de una semana ISO
   */
  private getWeekDates(
    year: number,
    week: number
  ): { startDate: Date; endDate: Date } {
    // ISO 8601: La semana 1 es la primera semana con un jueves
    const jan4 = new Date(year, 0, 4);
    const startOfYear = new Date(jan4);
    startOfYear.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7));

    const startDate = new Date(startOfYear);
    startDate.setDate(startDate.getDate() + (week - 1) * 7);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  }

  /**
   * Construir respuesta de vista de calendario
   */
  private buildResponse(
    viewType: CalendarViewType,
    startDate: Date,
    endDate: Date,
    slots: CalendarSlotDto[],
    resourceId: string
  ): CalendarViewResponseDto {
    const legend: CalendarLegendDto = this.slotColorService.getLegend();

    const availableSlots = slots.filter(
      (s) => s.status === SlotStatus.AVAILABLE
    ).length;
    const reservedSlots = slots.filter(
      (s) =>
        s.status === SlotStatus.RESERVED ||
        s.status === SlotStatus.OWN_RESERVATION
    ).length;
    const blockedSlots = slots.filter(
      (s) => s.status === SlotStatus.BLOCKED
    ).length;

    return {
      view: viewType,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      slots,
      legend,
      resource: {
        id: resourceId,
      },
      metadata: {
        totalSlots: slots.length,
        availableSlots,
        reservedSlots,
        blockedSlots,
        timezone: "America/Bogota", // TODO: Hacer configurable
        generatedAt: new Date().toISOString(),
      },
    };
  }
}
