/**
 * CalendarGrid - Molecule
 * Grid del calendario con días de la semana y celdas de días
 */

import { CalendarDayCell } from "@/components/atoms/CalendarDayCell";
import type { CalendarDay, CalendarEvent } from "@/types/calendar";
import type { Resource } from "@/types/entities/resource";
import { addDays, format, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";

interface CalendarGridProps {
  days: CalendarDay[];
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
  onDayDrop?: (date: Date) => void;
  onEventDrop?: (event: CalendarEvent, newDate: Date) => void;
  draggedResource?: Resource | null;
  draggedEvent?: CalendarEvent | null;
  firstDayOfWeek?: 0 | 1; // 0 = Domingo, 1 = Lunes
}

export function CalendarGrid({
  days,
  selectedDate,
  onDateClick,
  onDayDrop,
  onEventDrop,
  draggedResource,
  draggedEvent,
  firstDayOfWeek = 1, // Lunes por defecto
}: CalendarGridProps) {
  const [dragOverDay, setDragOverDay] = useState<string | null>(null);
  // Generar nombres de días de la semana
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(
      startOfWeek(new Date(), { weekStartsOn: firstDayOfWeek }),
      i
    );
    return {
      short: format(date, "EEE", { locale: es }),
      full: format(date, "EEEE", { locale: es }),
    };
  });

  // Organizar días en semanas (filas de 7 días)
  const weeks: CalendarDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="flex flex-col">
      {/* Encabezado de días de la semana */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {weekDays.map((day) => (
          <div
            key={day.short}
            className="py-3 text-center text-sm font-semibold text-gray-700 capitalize"
            title={day.full}
          >
            {day.short}
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <div className="grid grid-cols-7 auto-rows-fr">
        {days.map((day) => (
          <CalendarDayCell
            key={day.date.toISOString()}
            day={day}
            onClick={onDateClick}
            onDrop={onDayDrop}
            onEventDrop={onEventDrop}
            isDragOver={dragOverDay === day.date.toISOString()}
            isSelected={
              selectedDate
                ? day.date.toDateString() === selectedDate.toDateString()
                : false
            }
          />
        ))}
      </div>

      {/* Leyenda de colores */}
      <div className="flex items-center justify-center gap-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-xs text-gray-600">Pendiente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-gray-600">Confirmada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-xs text-gray-600">En progreso</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-xs text-gray-600">Cancelada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-500" />
          <span className="text-xs text-gray-600">Completada</span>
        </div>
      </div>
    </div>
  );
}
