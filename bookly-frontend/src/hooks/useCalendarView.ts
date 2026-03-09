/**
 * useCalendarView - Hooks para Vista de Calendario (Availability Service)
 *
 * Cubre CalendarViewController del backend:
 * - GET /calendar/view (vista genérica)
 * - GET /calendar/month (vista mensual)
 * - GET /calendar/week (vista semanal)
 * - GET /calendar/day (vista diaria)
 */

import {
  AvailabilityClient,
  type CalendarViewParams,
  type CalendarViewResponse,
} from "@/infrastructure/api/availability-client";
import { useQuery } from "@tanstack/react-query";

// ============================================
// CACHE KEYS
// ============================================

export const calendarViewKeys = {
  all: ["calendar-view"] as const,
  view: (params?: CalendarViewParams) =>
    [...calendarViewKeys.all, "view", params] as const,
  month: (year: number, month: number, resourceId?: string) =>
    [...calendarViewKeys.all, "month", year, month, resourceId] as const,
  week: (year: number, week: number, resourceId?: string) =>
    [...calendarViewKeys.all, "week", year, week, resourceId] as const,
  day: (date: string, resourceId?: string) =>
    [...calendarViewKeys.all, "day", date, resourceId] as const,
};

// ============================================
// QUERIES
// ============================================

export function useCalendarView(params?: CalendarViewParams) {
  return useQuery<CalendarViewResponse | null>({
    queryKey: calendarViewKeys.view(params),
    queryFn: async () => {
      if (!params) return null;
      const response = await AvailabilityClient.getCalendarView(params);
      return response.data || null;
    },
    enabled: !!params,
    staleTime: 1000 * 60 * 2,
  });
}

export function useMonthView(
  year: number,
  month: number,
  resourceId?: string,
) {
  return useQuery<CalendarViewResponse | null>({
    queryKey: calendarViewKeys.month(year, month, resourceId),
    queryFn: async () => {
      const response = await AvailabilityClient.getMonthView(
        year,
        month,
        resourceId,
      );
      return response.data || null;
    },
    enabled: !!year && !!month,
    staleTime: 1000 * 60 * 2,
  });
}

export function useWeekView(
  year: number,
  week: number,
  resourceId?: string,
) {
  return useQuery<CalendarViewResponse | null>({
    queryKey: calendarViewKeys.week(year, week, resourceId),
    queryFn: async () => {
      const response = await AvailabilityClient.getWeekView(
        year,
        week,
        resourceId,
      );
      return response.data || null;
    },
    enabled: !!year && !!week,
    staleTime: 1000 * 60 * 2,
  });
}

export function useDayView(date: string, resourceId?: string) {
  return useQuery<CalendarViewResponse | null>({
    queryKey: calendarViewKeys.day(date, resourceId),
    queryFn: async () => {
      if (!date) return null;
      const response = await AvailabilityClient.getDayView(date, resourceId);
      return response.data || null;
    },
    enabled: !!date,
    staleTime: 1000 * 60 * 2,
  });
}
