/**
 * CalendarHeader - Molecule
 * Cabecera del calendario con navegación y selector de vista
 */

import type { CalendarView } from "@/types/calendar";
import {
  addDays,
  addMonths,
  addWeeks,
  format,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { es } from "date-fns/locale";

interface CalendarHeaderProps {
  currentDate: Date;
  view: CalendarView;
  onDateChange: (date: Date) => void;
  onViewChange: (view: CalendarView) => void;
  onToday: () => void;
}

export function CalendarHeader({
  currentDate,
  view,
  onDateChange,
  onViewChange,
  onToday,
}: CalendarHeaderProps) {
  const handlePrevious = () => {
    if (view === "month") {
      onDateChange(subMonths(currentDate, 1));
    } else if (view === "week") {
      onDateChange(subWeeks(currentDate, 1));
    } else if (view === "day") {
      onDateChange(subDays(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (view === "month") {
      onDateChange(addMonths(currentDate, 1));
    } else if (view === "week") {
      onDateChange(addWeeks(currentDate, 1));
    } else if (view === "day") {
      onDateChange(addDays(currentDate, 1));
    }
  };

  const getTitle = () => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy", { locale: es });
    } else if (view === "week") {
      return format(currentDate, "'Semana del' d 'de' MMMM", { locale: es });
    }
    return format(currentDate, "d 'de' MMMM yyyy", { locale: es });
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-[var(--color-bg-inverse)] border-b border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)]">
      {/* Título y navegación */}
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] dark:text-white capitalize">
          {getTitle()}
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevious}
            className="
              p-2 rounded-lg border border-[var(--color-border-strong)] dark:border-[var(--color-border-strong)]
              hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-bg-elevated)] transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
            aria-label="Anterior"
          >
            <svg
              className="w-5 h-5 text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            type="button"
            onClick={onToday}
            className="
              px-4 py-2 text-sm font-medium
              border border-[var(--color-border-strong)] rounded-lg
              hover:bg-[var(--color-bg-secondary)] transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
          >
            Hoy
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="
              p-2 rounded-lg border border-[var(--color-border-strong)] dark:border-[var(--color-border-strong)]
              hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-bg-elevated)] transition-colors
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
            aria-label="Siguiente"
          >
            <svg
              className="w-5 h-5 text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Selector de vista */}
      <div className="flex items-center gap-2 bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-inverse)] rounded-lg p-1">
        <button
          type="button"
          onClick={() => onViewChange("month")}
          className={`
            px-4 py-2 rounded-md font-medium transition-colors
            ${
              view === "month"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] dark:hover:text-white"
            }
          `}
        >
          Mes
        </button>
        <button
          type="button"
          onClick={() => onViewChange("week")}
          className={`
            px-4 py-2 rounded-md font-medium transition-colors
            ${
              view === "week"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] dark:hover:text-white"
            }
          `}
        >
          Semana
        </button>
        <button
          type="button"
          onClick={() => onViewChange("day")}
          className={`
            px-4 py-2 rounded-md font-medium transition-colors
            ${
              view === "day"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] dark:hover:text-white"
            }
          `}
        >
          Día
        </button>
      </div>
    </div>
  );
}
