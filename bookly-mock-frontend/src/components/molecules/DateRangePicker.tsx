import { format } from "date-fns";
import { Calendar } from "lucide-react";
import * as React from "react";

/**
 * DateRangePicker - Selector de rango de fechas
 *
 * Selector de rango de fechas con inputs separados para inicio y fin.
 *
 * @component
 * @example
 * ```tsx
 * <DateRangePicker
 *   startDate={startDate}
 *   endDate={endDate}
 *   onRangeChange={(start, end) => setDateRange(start, end)}
 * />
 * ```
 */

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DateRangePickerProps {
  startDate?: Date | null;
  endDate?: Date | null;
  onRangeChange: (start: Date | null, end: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
}

export const DateRangePicker = React.memo<DateRangePickerProps>(
  ({
    startDate,
    endDate,
    onRangeChange,
    minDate,
    maxDate,
    disabled = false,
    className = "",
  }) => {
    const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newStart = e.target.value ? new Date(e.target.value) : null;
      onRangeChange(newStart, endDate || null);
    };

    const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newEnd = e.target.value ? new Date(e.target.value) : null;
      onRangeChange(startDate || null, newEnd);
    };

    // Formatear fechas para input type="date"
    const formatDateForInput = (date: Date | null | undefined): string => {
      if (!date) return "";
      return format(date, "yyyy-MM-dd");
    };

    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Ícono */}
        <Calendar className="h-5 w-5 text-[var(--color-text-tertiary)] dark:text-[var(--color-text-secondary)] flex-shrink-0" />

        {/* Fecha inicio */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
            Desde
          </label>
          <input
            type="date"
            value={formatDateForInput(startDate)}
            onChange={handleStartChange}
            min={minDate ? formatDateForInput(minDate) : undefined}
            max={
              endDate
                ? formatDateForInput(endDate)
                : maxDate
                  ? formatDateForInput(maxDate)
                  : undefined
            }
            disabled={disabled}
            className="
              px-3 py-2
              text-sm
              border border-[var(--color-border-strong)] dark:border-[var(--color-border-strong)]
              rounded-lg
              bg-white dark:bg-[var(--color-bg-inverse)]
              text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]
              focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-base)] focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          />
        </div>

        {/* Separador */}
        <span className="text-[var(--color-text-tertiary)] dark:text-[var(--color-text-secondary)] mt-5">→</span>

        {/* Fecha fin */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
            Hasta
          </label>
          <input
            type="date"
            value={formatDateForInput(endDate)}
            onChange={handleEndChange}
            min={
              startDate
                ? formatDateForInput(startDate)
                : minDate
                  ? formatDateForInput(minDate)
                  : undefined
            }
            max={maxDate ? formatDateForInput(maxDate) : undefined}
            disabled={disabled}
            className="
              px-3 py-2
              text-sm
              border border-[var(--color-border-strong)] dark:border-[var(--color-border-strong)]
              rounded-lg
              bg-white dark:bg-[var(--color-bg-inverse)]
              text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]
              focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-base)] focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          />
        </div>
      </div>
    );
  }
);

DateRangePicker.displayName = "DateRangePicker";
