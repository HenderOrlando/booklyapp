/**
 * CalendarEventBadge - Atom
 * Badge compacto para mostrar evento/reserva en el calendario
 * Incluye tooltip mejorado con Radix UI
 */

import { ReservationTooltip } from "@/components/molecules/ReservationTooltip";
import type { CalendarEvent } from "@/types/calendar";
import { format } from "date-fns";
import React from "react";

interface CalendarEventBadgeProps {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
  onDragStart?: (event: CalendarEvent) => void;
  onDragEnd?: () => void;
  draggable?: boolean;
  compact?: boolean;
}

export function CalendarEventBadge({
  event,
  onClick,
  onDragStart,
  onDragEnd,
  draggable = true,
  compact = false,
}: CalendarEventBadgeProps) {
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    if (onDragStart) {
      onDragStart(event);
    }
    // Añadir datos al drag
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/json", JSON.stringify(event));
  };

  const handleDragEnd = () => {
    if (onDragEnd) {
      onDragEnd();
    }
  };

  const _handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick(event);
    }
  };

  const timeRange = `${format(event.start, "HH:mm")} - ${format(event.end, "HH:mm")}`;

  // Badge content
  const badgeContent = (
    <button
      type="button"
      draggable={
        draggable &&
        event.status !== "COMPLETED" &&
        event.status !== "CANCELLED"
      }
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(event);
      }}
      className={`
        w-full text-left px-2 py-1 rounded
        text-xs font-medium text-white
        transition-all duration-200
        ${draggable && event.status !== "COMPLETED" && event.status !== "CANCELLED" ? "cursor-move hover:opacity-80" : "cursor-pointer hover:opacity-90"}
        ${compact ? "truncate" : ""}
      `}
      style={{
        backgroundColor: event.color,
        borderLeft: `3px solid ${darkenColor(event.color || "#3B82F6", 20)}`,
      }}
      aria-label={`${event.title}, ${timeRange}`}
    >
      {compact ? (
        <span className="truncate block">{event.title}</span>
      ) : (
        <>
          <div className="font-semibold truncate">{event.title}</div>
          <div className="text-xs opacity-90 mt-0.5">{timeRange}</div>
          <div className="text-xs opacity-75 truncate">
            {event.resourceName} - {event.resourceId}
          </div>
        </>
      )}
    </button>
  );

  // Si hay reserva completa, mostrar tooltip mejorado
  if (event.reservation) {
    return (
      <ReservationTooltip reservation={event.reservation}>
        {badgeContent} - HENDER
      </ReservationTooltip>
    );
  }

  // Sin tooltip si no hay reserva completa
  return badgeContent;
}

/**
 * Oscurece un color hex
 */
function darkenColor(hex: string, percent: number): string {
  // Convertir hex a RGB
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Oscurecer
  const factor = 1 - percent / 100;
  const newR = Math.floor(r * factor);
  const newG = Math.floor(g * factor);
  const newB = Math.floor(b * factor);

  // Convertir a hex
  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
}
