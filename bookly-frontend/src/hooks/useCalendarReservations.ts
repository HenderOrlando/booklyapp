/**
 * useCalendarReservations - Hook para Calendario de Reservas (RF-10)
 *
 * Obtiene reservas en formato calendario con rangos de fecha
 */

import { httpClient } from "@/infrastructure/http/httpClient";
import { useQuery } from "@tanstack/react-query";

export interface CalendarEvent {
  id: string;
  title: string;
  resourceId: string;
  resourceName: string;
  start: string;
  end: string;
  status: string;
  userId: string;
  userName: string;
  color?: string;
}

export const calendarKeys = {
  all: ["calendar"] as const,
  range: (start: string, end: string) => [...calendarKeys.all, start, end] as const,
  resource: (resourceId: string, start: string, end: string) =>
    [...calendarKeys.all, "resource", resourceId, start, end] as const,
};

export function useCalendarReservations(startDate: string, endDate: string) {
  return useQuery<CalendarEvent[]>({
    queryKey: calendarKeys.range(startDate, endDate),
    queryFn: async () => {
      const response = await httpClient.get("reservations", {
        params: { startDate, endDate, format: "calendar" },
      });
      const items = response.data?.items || response.data || [];
      return items.map((r: any) => ({
        id: r.id,
        title: r.title || r.purpose || `Reserva ${r.id}`,
        resourceId: r.resourceId,
        resourceName: r.resourceName || r.resource?.name || "",
        start: r.startDate || r.start,
        end: r.endDate || r.end,
        status: r.status,
        userId: r.userId,
        userName: r.userName || r.user?.name || "",
        color: r.color,
      }));
    },
    enabled: !!startDate && !!endDate,
    staleTime: 1000 * 60 * 3,
  });
}
