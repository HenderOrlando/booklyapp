/**
 * iCal Generator Utility
 * Genera archivos .ics (iCalendar) para exportar reservas
 * Cumple con RFC 5545 (iCalendar specification)
 */

export interface CalendarEvent {
  uid: string;
  summary: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  organizer?: {
    name: string;
    email: string;
  };
  attendees?: Array<{
    name: string;
    email: string;
  }>;
  url?: string;
  status?: "CONFIRMED" | "TENTATIVE" | "CANCELLED";
  sequence?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ICalGenerator {
  /**
   * Escapa caracteres especiales para iCal
   */
  private static escapeText(text: string): string {
    if (!text) return "";
    return text
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "");
  }

  /**
   * Formatea fecha a formato iCal (UTC)
   */
  private static formatDate(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hour = String(date.getUTCHours()).padStart(2, "0");
    const minute = String(date.getUTCMinutes()).padStart(2, "0");
    const second = String(date.getUTCSeconds()).padStart(2, "0");

    return `${year}${month}${day}T${hour}${minute}${second}Z`;
  }

  /**
   * Genera VEVENT para un solo evento
   */
  private static generateVEvent(event: CalendarEvent): string {
    const lines: string[] = [];

    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${event.uid}`);
    lines.push(`DTSTAMP:${this.formatDate(new Date())}`);
    lines.push(`DTSTART:${this.formatDate(event.startTime)}`);
    lines.push(`DTEND:${this.formatDate(event.endTime)}`);
    lines.push(`SUMMARY:${this.escapeText(event.summary)}`);

    if (event.description) {
      lines.push(`DESCRIPTION:${this.escapeText(event.description)}`);
    }

    if (event.location) {
      lines.push(`LOCATION:${this.escapeText(event.location)}`);
    }

    if (event.organizer) {
      lines.push(
        `ORGANIZER;CN=${this.escapeText(event.organizer.name)}:mailto:${event.organizer.email}`
      );
    }

    if (event.attendees && event.attendees.length > 0) {
      event.attendees.forEach((attendee) => {
        lines.push(
          `ATTENDEE;CN=${this.escapeText(attendee.name)};ROLE=REQ-PARTICIPANT:mailto:${attendee.email}`
        );
      });
    }

    if (event.url) {
      lines.push(`URL:${event.url}`);
    }

    lines.push(`STATUS:${event.status || "CONFIRMED"}`);
    lines.push(`SEQUENCE:${event.sequence || 0}`);

    if (event.createdAt) {
      lines.push(`CREATED:${this.formatDate(event.createdAt)}`);
    }

    if (event.updatedAt) {
      lines.push(`LAST-MODIFIED:${this.formatDate(event.updatedAt)}`);
    }

    lines.push("END:VEVENT");

    return lines.join("\r\n");
  }

  /**
   * Genera archivo iCal completo con uno o más eventos
   */
  static generateICalendar(
    events: CalendarEvent | CalendarEvent[],
    calendarName = "Bookly Reservations",
    timezone = "America/Bogota"
  ): string {
    const eventArray = Array.isArray(events) ? events : [events];
    const lines: string[] = [];

    // Header
    lines.push("BEGIN:VCALENDAR");
    lines.push("VERSION:2.0");
    lines.push("PRODID:-//Bookly//Reservation System//ES");
    lines.push("CALSCALE:GREGORIAN");
    lines.push("METHOD:PUBLISH");
    lines.push(`X-WR-CALNAME:${this.escapeText(calendarName)}`);
    lines.push(`X-WR-TIMEZONE:${timezone}`);

    // Timezone definition (opcional, para mejor compatibilidad)
    lines.push("BEGIN:VTIMEZONE");
    lines.push(`TZID:${timezone}`);
    lines.push("BEGIN:STANDARD");
    lines.push("DTSTART:19700101T000000");
    lines.push("TZOFFSETFROM:-0500");
    lines.push("TZOFFSETTO:-0500");
    lines.push("TZNAME:COT");
    lines.push("END:STANDARD");
    lines.push("END:VTIMEZONE");

    // Events
    eventArray.forEach((event) => {
      lines.push(this.generateVEvent(event));
    });

    // Footer
    lines.push("END:VCALENDAR");

    return lines.join("\r\n");
  }

  /**
   * Genera archivo iCal para descarga directa
   */
  static generateDownloadableFile(
    events: CalendarEvent | CalendarEvent[],
    filename = "reserva.ics"
  ): { content: string; filename: string; mimeType: string } {
    return {
      content: this.generateICalendar(events),
      filename,
      mimeType: "text/calendar; charset=utf-8",
    };
  }

  /**
   * Genera URL de Google Calendar
   */
  static generateGoogleCalendarUrl(event: CalendarEvent): string {
    const baseUrl = "https://calendar.google.com/calendar/render";
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: event.summary,
      dates: `${this.formatDate(event.startTime)}/${this.formatDate(event.endTime)}`,
      details: event.description || "",
      location: event.location || "",
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Genera URL de Outlook Calendar
   */
  static generateOutlookCalendarUrl(event: CalendarEvent): string {
    const baseUrl = "https://outlook.live.com/calendar/0/deeplink/compose";
    const params = new URLSearchParams({
      subject: event.summary,
      startdt: event.startTime.toISOString(),
      enddt: event.endTime.toISOString(),
      body: event.description || "",
      location: event.location || "",
      path: "/calendar/action/compose",
      rru: "addevent",
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Genera URLs para múltiples calendarios
   */
  static generateCalendarLinks(event: CalendarEvent): {
    ical: string;
    google: string;
    outlook: string;
  } {
    return {
      ical: `/api/v1/reservations/${event.uid}/export.ics`,
      google: this.generateGoogleCalendarUrl(event),
      outlook: this.generateOutlookCalendarUrl(event),
    };
  }
}
