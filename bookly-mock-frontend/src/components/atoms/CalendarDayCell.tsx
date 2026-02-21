/**
 * CalendarDayCell - Atom
 * Celda individual de día en el calendario
 */

import { Button } from "@/components/atoms/Button/Button";
import type { CalendarDay, CalendarEvent } from "@/types/calendar";
import * as Tooltip from "@radix-ui/react-tooltip";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface CalendarDayCellProps {
  day: CalendarDay;
  onClick?: (date: Date) => void;
  onDrop?: (date: Date) => void;
  onEventDrop?: (event: CalendarEvent, newDate: Date) => void;
  isDragOver?: boolean;
  isSelected?: boolean;
}

export function CalendarDayCell({
  day,
  onClick,
  isSelected = false,
  onDrop,
  isDragOver = false,
  onEventDrop,
}: CalendarDayCellProps) {
  const handleClick = () => {
    if (!day.isDisabled && onClick) {
      onClick(day.date);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevenir menú contextual del navegador
    if (!day.isDisabled && onClick) {
      onClick(day.date); // Crear reserva rápida con click derecho
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Permitir drop
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (day.isDisabled) return;

    // Intentar leer datos del evento arrastrado
    const eventDataStr = e.dataTransfer.getData("application/json");

    if (eventDataStr) {
      // Es un evento siendo reasignado
      try {
        const event = JSON.parse(eventDataStr) as CalendarEvent;
        if (onEventDrop) {
          onEventDrop(event, day.date);
        }
      } catch (error) {
        console.error("Error parsing dragged event:", error);
      }
    } else if (onDrop) {
      // Es un recurso siendo arrastrado
      onDrop(day.date);
    }
  };

  const hasEvents = day.events.length > 0;
  const eventCount = day.events.length;

  const buttonContent = (
    <Button
      type="button"
      variant="ghost"
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      disabled={day.isDisabled}
      className={`
        relative min-h-[80px] h-auto w-full p-2 border border-[var(--color-border-subtle)]
        transition-all duration-200 flex-col items-stretch justify-start rounded-none whitespace-normal
        ${
          !day.isCurrentMonth
            ? "bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)]"
            : "bg-background text-[var(--color-text-primary)]"
        }
        ${day.isToday ? "border-2 border-[var(--color-border-focus)] ring-1 ring-[var(--color-border-focus)]" : ""}
        ${isSelected ? "bg-[var(--color-state-info-bg)] border-[var(--color-state-info-border)] hover:bg-[var(--color-state-info-bg)]" : ""}
        ${isDragOver && !day.isDisabled ? "border-2 border-[var(--color-state-success-border)] bg-[var(--color-state-success-bg)] hover:bg-[var(--color-state-success-bg)]" : ""}
        ${day.isPast && day.isCurrentMonth ? "opacity-60" : ""}
        ${
          day.isDisabled
            ? "cursor-not-allowed opacity-40"
            : "cursor-pointer hover:bg-[var(--color-state-info-bg)] hover:border-[var(--color-state-info-border)]"
        }
        ${day.isWeekend && day.isCurrentMonth ? "bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-secondary)]" : ""}
      `}
      aria-label={format(day.date, "d 'de' MMMM", { locale: es })}
      aria-current={day.isToday ? "date" : undefined}
      aria-disabled={day.isDisabled}
    >
      {/* Número del día */}
      <div className="flex items-center justify-between mb-1 w-full">
        <span
          className={`
            text-sm font-medium
            ${day.isToday ? "text-[var(--color-text-link)] font-bold" : ""}
          `}
        >
          {format(day.date, "d")}
        </span>

        {/* Indicador de eventos */}
        {hasEvents && (
          <span
            className="
              inline-flex items-center justify-center
              w-5 h-5 text-xs font-semibold
              bg-[var(--color-action-primary)] text-[var(--color-text-inverse)] rounded-full
            "
            aria-label={`${eventCount} evento${eventCount > 1 ? "s" : ""}`}
          >
            {eventCount}
          </span>
        )}
      </div>

      {/* Dots de eventos (máximo 3 visibles) */}
      {hasEvents && (
        <div className="flex gap-1 flex-wrap w-full">
          {day.events.slice(0, 3).map((event) => (
            <div
              key={event.id}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: event.color }}
              title={event.title}
              aria-hidden="true"
            />
          ))}
          {eventCount > 3 && (
            <span className="text-xs text-[var(--color-text-secondary)]">
              +{eventCount - 3}
            </span>
          )}
        </div>
      )}

      {/* Indicador de hoy */}
      {day.isToday && (
        <div
          className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-action-primary)] rounded-full"
          aria-hidden="true"
        />
      )}
    </Button>
  );

  // Si no hay eventos, retornar solo el botón
  if (!hasEvents) {
    return buttonContent;
  }

  // Si hay eventos, envolver con tooltip
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{buttonContent}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="z-50 max-w-sm overflow-hidden rounded-md border border-[var(--color-border-strong)] bg-[var(--color-bg-inverse)] px-3 py-2 text-sm shadow-md animate-in fade-in-0 zoom-in-95"
            sideOffset={5}
          >
            <div className="space-y-2">
              <div className="font-semibold text-[var(--color-text-inverse)] border-b border-[var(--color-border-strong)] pb-2">
                {format(day.date, "d 'de' MMMM 'de' yyyy", { locale: es })}
                <span className="ml-2 text-xs text-[var(--color-text-tertiary)]">
                  ({eventCount} evento{eventCount > 1 ? "s" : ""})
                </span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {day.events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-2 p-2 rounded bg-[var(--color-bg-inverse)]/50"
                  >
                    <div
                      className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0"
                      style={{ backgroundColor: event.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[var(--color-text-inverse)] truncate">
                        {event.title}
                      </div>
                      <div className="text-xs text-[var(--color-text-tertiary)]">
                        {format(new Date(event.start), "HH:mm", { locale: es })}{" "}
                        - {format(new Date(event.end), "HH:mm", { locale: es })}
                      </div>
                      {event.resourceName && (
                        <div className="text-xs text-[var(--color-text-secondary)] mt-1">
                          📍 {event.resourceName}
                        </div>
                      )}
                      {event.userName && (
                        <div className="text-xs text-[var(--color-text-secondary)]">
                          👤 {event.userName}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Tooltip.Arrow className="fill-[var(--color-bg-inverse)]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
