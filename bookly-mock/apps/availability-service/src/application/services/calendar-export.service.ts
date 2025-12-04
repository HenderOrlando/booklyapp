import { CalendarEvent, ICalGenerator } from "@libs/common";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Reservation } from '@availability/infrastructure/schemas';

/**
 * Calendar Export Service
 * Genera archivos iCal para exportar reservas a calendarios externos
 * Sin OAuth - solo exportación simple
 */
@Injectable()
export class CalendarExportService {
  private readonly logger = new Logger(CalendarExportService.name);

  constructor(
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<Reservation>
  ) {}

  /**
   * Convertir reserva a CalendarEvent
   */
  private reservationToCalendarEvent(
    reservation: any,
    resourceName: string
  ): CalendarEvent {
    return {
      uid: `bookly-reservation-${reservation._id}@bookly.ufps.edu.co`,
      summary: `Reserva: ${resourceName}`,
      description: this.buildDescription(reservation, resourceName),
      location:
        reservation.location || "Universidad Francisco de Paula Santander",
      startTime: new Date(reservation.startTime),
      endTime: new Date(reservation.endTime),
      organizer: {
        name: "Sistema Bookly UFPS",
        email: "bookly@ufps.edu.co",
      },
      url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/reservations/${reservation._id}`,
      status: this.mapReservationStatus(reservation.status),
      sequence: reservation.version || 0,
      createdAt: reservation.createdAt,
      updatedAt: reservation.updatedAt,
    };
  }

  /**
   * Construir descripción detallada
   */
  private buildDescription(reservation: any, resourceName: string): string {
    const lines = [
      `Reserva de ${resourceName}`,
      "",
      `Estado: ${reservation.status}`,
      `Código: ${reservation._id}`,
    ];

    if (reservation.purpose) {
      lines.push(`Propósito: ${reservation.purpose}`);
    }

    if (reservation.notes) {
      lines.push("", "Notas:", reservation.notes);
    }

    lines.push(
      "",
      "---",
      "Sistema de Reservas Bookly",
      "Universidad Francisco de Paula Santander"
    );

    return lines.join("\n");
  }

  /**
   * Mapear estado de reserva a estado iCal
   */
  private mapReservationStatus(
    status: string
  ): "CONFIRMED" | "TENTATIVE" | "CANCELLED" {
    switch (status) {
      case "confirmed":
      case "approved":
      case "active":
        return "CONFIRMED";
      case "pending":
      case "in_use":
        return "TENTATIVE";
      case "cancelled":
      case "rejected":
      case "completed":
        return "CANCELLED";
      default:
        return "TENTATIVE";
    }
  }

  /**
   * Exportar una sola reserva a iCal
   */
  async exportSingleReservation(
    reservationId: string
  ): Promise<{ content: string; filename: string; mimeType: string }> {
    this.logger.debug(`Exporting reservation ${reservationId} to iCal`);

    // Buscar reserva con populate de resource
    const reservation = await this.reservationModel
      .findById(reservationId)
      .populate("resourceId")
      .lean()
      .exec();

    if (!reservation) {
      throw new NotFoundException(`Reservation ${reservationId} not found`);
    }

    const resourceName =
      (reservation.resourceId as any)?.name || "Recurso desconocido";

    const calendarEvent = this.reservationToCalendarEvent(
      reservation,
      resourceName
    );

    return ICalGenerator.generateDownloadableFile(
      calendarEvent,
      `reserva-${reservationId}.ics`
    );
  }

  /**
   * Exportar todas las reservas de un usuario
   */
  async exportUserReservations(
    userId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      status?: string[];
    }
  ): Promise<{ content: string; filename: string; mimeType: string }> {
    this.logger.debug(`Exporting reservations for user ${userId}`);

    // Construir query
    const query: any = { userId };

    if (filters?.startDate || filters?.endDate) {
      query.startTime = {};
      if (filters.startDate) {
        query.startTime.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.startTime.$lte = filters.endDate;
      }
    }

    if (filters?.status && filters.status.length > 0) {
      query.status = { $in: filters.status };
    }

    // Buscar reservas
    const reservations = await this.reservationModel
      .find(query)
      .populate("resourceId")
      .sort({ startTime: 1 })
      .limit(100) // Máximo 100 reservas
      .lean()
      .exec();

    if (reservations.length === 0) {
      this.logger.warn(`No reservations found for user ${userId}`);
      // Generar calendario vacío
      return ICalGenerator.generateDownloadableFile(
        [],
        `mis-reservas-${Date.now()}.ics`
      );
    }

    // Convertir a calendar events
    const calendarEvents = reservations.map((reservation) => {
      const resourceName =
        (reservation.resourceId as any)?.name || "Recurso desconocido";
      return this.reservationToCalendarEvent(reservation, resourceName);
    });

    return ICalGenerator.generateDownloadableFile(
      calendarEvents,
      `mis-reservas-${Date.now()}.ics`
    );
  }

  /**
   * Generar enlaces para agregar a calendario
   */
  async getCalendarLinks(
    reservationId: string
  ): Promise<{ ical: string; google: string; outlook: string }> {
    const reservation = await this.reservationModel
      .findById(reservationId)
      .populate("resourceId")
      .lean()
      .exec();

    if (!reservation) {
      throw new NotFoundException(`Reservation ${reservationId} not found`);
    }

    const resourceName =
      (reservation.resourceId as any)?.name || "Recurso desconocido";

    const calendarEvent = this.reservationToCalendarEvent(
      reservation,
      resourceName
    );

    return ICalGenerator.generateCalendarLinks(calendarEvent);
  }
}
