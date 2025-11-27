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
        <Calendar className="h-5 w-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />

        {/* Fecha inicio */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
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
              border border-gray-300 dark:border-gray-600
              rounded-lg
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
              focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-base)] focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          />
        </div>

        {/* Separador */}
        <span className="text-gray-400 dark:text-gray-500 mt-5">→</span>

        {/* Fecha fin */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
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
              border border-gray-300 dark:border-gray-600
              rounded-lg
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-gray-100
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
