"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { DayPicker } from "react-day-picker";

/**
 * Calendar Component - Bookly Design System
 *
 * Selector de fecha visual usando react-day-picker
 * Usado en: formularios de reserva, filtros de fecha, rangos
 *
 * Tokens aplicados:
 * - Fondo seleccionado: action.primary
 * - Hover: bg.muted
 * - Texto: text.primary / text.secondary
 * - Bordes: border.subtle
 */

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-[var(--color-text-primary)]",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
          "text-[var(--color-text-primary)]"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: cn(
          "text-[var(--color-text-secondary)] rounded-md w-9 font-normal text-[0.8rem]"
        ),
        row: "flex w-full mt-2",
        cell: cn(
          "h-9 w-9 text-center text-sm p-0 relative",
          "[&:has([aria-selected].day-range-end)]:rounded-r-md",
          "[&:has([aria-selected].day-outside)]:bg-accent/50",
          "[&:has([aria-selected])]:bg-accent",
          "first:[&:has([aria-selected])]:rounded-l-md",
          "last:[&:has([aria-selected])]:rounded-r-md",
          "focus-within:relative focus-within:z-20"
        ),
        day: cn(
          "h-9 w-9 p-0 font-normal rounded-md",
          "text-[var(--color-text-primary)]",
          "hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)]",
          "aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected: cn(
          "bg-brand-primary-500 text-white",
          "hover:bg-brand-primary-600 hover:text-white",
          "focus:bg-brand-primary-600 focus:text-white"
        ),
        day_today: cn(
          "bg-[var(--color-bg-muted)] text-[var(--color-text-primary)]",
          "font-semibold"
        ),
        day_outside: cn(
          "day-outside text-[var(--color-text-secondary)] opacity-50",
          "aria-selected:bg-accent/50 aria-selected:text-[var(--color-text-secondary)]",
          "aria-selected:opacity-30"
        ),
        day_disabled: "text-[var(--color-text-secondary)] opacity-50",
        day_range_middle: cn(
          "aria-selected:bg-accent aria-selected:text-accent-foreground"
        ),
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => (
          <svg
            className="h-4 w-4"
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
        ),
        IconRight: () => (
          <svg
            className="h-4 w-4"
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
        ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
