/**
 * CalendarView - Organism
 * Calendario completo con navegación, grid y eventos
 * Integrado con React Query para cargar reservas
 */

"use client";

import { CalendarGrid } from "@/components/molecules/CalendarGrid";
import { CalendarHeader } from "@/components/molecules/CalendarHeader";
import { useReservations } from "@/hooks/useReservations";
import type {
  CalendarDay,
  CalendarEvent,
  CalendarView as CalendarViewType,
} from "@/types/calendar";
import { reservationToCalendarEvent as convertToEvent } from "@/types/calendar";
import { Resource } from "@/types/entities/resource";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  isBefore,
  isSameMonth,
  isToday,
  isWeekend,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { useMemo, useState } from "react";

interface CalendarViewProps {
  onDateClick?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onDayDrop?: (date: Date) => void;
  onEventDrop?: (event: CalendarEvent, newDate: Date) => void;
  draggedResource?: Resource | null;
  onEventDragStart?: (event: CalendarEvent) => void;
  onEventDragEnd?: () => void;
  firstDayOfWeek?: 0 | 1;
  resourceId?: string; // Filtrar por recurso específico
  userId?: string; // Filtrar por usuario específico
}

export function CalendarView({
  onDateClick,
  onEventClick,
  onDayDrop,
  onEventDrop,
  draggedResource,
  onEventDragStart,
  onEventDragEnd,
  firstDayOfWeek = 1,
  resourceId,
  userId,
}: CalendarViewProps) {
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  // Estado local
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarViewType>("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Cargar reservas con React Query
  const { data: reservationsData, isLoading } = useReservations();

  // Convertir reservas a eventos
  const events = useMemo(() => {
    if (!reservationsData?.items) return [];

    let filteredReservations = reservationsData.items;

    // Filtrar por recurso si se especifica
    if (resourceId) {
      filteredReservations = filteredReservations.filter(
        (r: { resourceId: string }) => r.resourceId === resourceId,
      );
    }

    // Filtrar por usuario si se especifica
    if (userId) {
      filteredReservations = filteredReservations.filter(
        (r: { userId: string }) => r.userId === userId,
      );
    }

    return filteredReservations.map(convertToEvent);
  }, [reservationsData, resourceId, userId]);

  // Generar días del calendario según la vista
  const calendarDays = useMemo(() => {
    const days: CalendarDay[] = [];

    if (view === "month") {
      // Vista mensual: mostrar mes completo + días de semanas parciales
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const startDate = startOfWeek(monthStart, {
        weekStartsOn: firstDayOfWeek,
      });
      const endDate = endOfWeek(monthEnd, { weekStartsOn: firstDayOfWeek });

      let day = startDate;
      while (day <= endDate) {
        const dayEvents = events.filter((event: CalendarEvent) => {
          const eventStart = startOfDay(event.start);
          const eventEnd = startOfDay(event.end);
          const currentDay = startOfDay(day);
          return currentDay >= eventStart && currentDay <= eventEnd;
        });

        days.push({
          date: new Date(day),
          isCurrentMonth: isSameMonth(day, currentDate),
          isToday: isToday(day),
          isWeekend: isWeekend(day),
          events: dayEvents,
          isPast: isBefore(day, startOfDay(new Date())),
          isDisabled: false,
        });

        day = addDays(day, 1);
      }
    } else if (view === "week") {
      // Vista semanal: 7 días
      const weekStart = startOfWeek(currentDate, {
        weekStartsOn: firstDayOfWeek,
      });

      for (let i = 0; i < 7; i++) {
        const day = addDays(weekStart, i);
        const dayEvents = events.filter((event: CalendarEvent) => {
          const eventStart = startOfDay(event.start);
          const eventEnd = startOfDay(event.end);
          const currentDay = startOfDay(day);
          return currentDay >= eventStart && currentDay <= eventEnd;
        });

        days.push({
          date: new Date(day),
          isCurrentMonth: true,
          isToday: isToday(day),
          isWeekend: isWeekend(day),
          events: dayEvents,
          isPast: isBefore(day, startOfDay(new Date())),
          isDisabled: false,
        });
      }
    } else {
      // Vista diaria: solo el día actual
      const dayEvents = events.filter((event: CalendarEvent) => {
        const eventStart = startOfDay(event.start);
        const eventEnd = startOfDay(event.end);
        const currentDay = startOfDay(currentDate);
        return currentDay >= eventStart && currentDay <= eventEnd;
      });

      days.push({
        date: new Date(currentDate),
        isCurrentMonth: true,
        isToday: isToday(currentDate),
        isWeekend: isWeekend(currentDate),
        events: dayEvents,
        isPast: isBefore(currentDate, startOfDay(new Date())),
        isDisabled: false,
      });
    }

    return days;
  }, [currentDate, view, events, firstDayOfWeek]);

  // Handlers
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (onDateClick) {
      onDateClick(date);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventDragStart = (event: CalendarEvent) => {
    setDraggedEvent(event);
    onEventDragStart?.(event);
  };

  const handleEventDragEnd = () => {
    setDraggedEvent(null);
    onEventDragEnd?.();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-background rounded-lg border border-[var(--color-border-subtle)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[var(--color-text-secondary)]">
            Cargando calendario...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-background rounded-lg border border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)] shadow-sm overflow-hidden">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onDateChange={setCurrentDate}
        onViewChange={setView}
        onToday={handleToday}
      />

      {view === "month" || view === "week" ? (
        <CalendarGrid
          days={calendarDays}
          selectedDate={selectedDate}
          onDateClick={handleDateClick}
          onDayDrop={onDayDrop}
          onEventDrop={onEventDrop}
          draggedResource={draggedResource}
          draggedEvent={draggedEvent}
          firstDayOfWeek={firstDayOfWeek}
        />
      ) : (
        // Vista diaria: lista detallada de eventos
        <div className="p-6 bg-background rounded-lg">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] dark:text-white mb-4">
            Eventos del día
          </h3>
          {calendarDays[0]?.events.length > 0 ? (
            <div className="space-y-2">
              {calendarDays[0].events.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => onEventClick?.(event)}
                  className="
                    w-full text-left p-4 rounded-lg border border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)]
                    bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-inverse)] hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-bg-elevated)] transition-colors
                  "
                  style={{
                    borderLeftWidth: "4px",
                    borderLeftColor: event.color,
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-[var(--color-text-primary)] dark:text-white">
                        {event.title}
                      </h4>
                      <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mt-1">
                        {event.resourceName}
                      </p>
                    </div>
                    <span
                      className="px-2 py-1 text-xs font-medium rounded"
                      style={{
                        backgroundColor: event.color,
                        color: "white",
                      }}
                    >
                      {event.status}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)] mt-2">
                    {event.start.toLocaleTimeString("es", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {event.end.toLocaleTimeString("es", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] text-center py-8">
              No hay eventos para este día
            </p>
          )}
        </div>
      )}
    </div>
  );
}
