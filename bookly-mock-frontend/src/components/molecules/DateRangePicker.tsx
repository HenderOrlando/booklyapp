import { DateInput } from "@/components/atoms/DateInput";
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
    const handleStartChange = (value: string) => {
      const newStart = value ? new Date(value) : null;
      onRangeChange(newStart, endDate || null);
    };

    const handleEndChange = (value: string) => {
      const newEnd = value ? new Date(value) : null;
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
        <Calendar className="h-5 w-5 text-[var(--color-text-tertiary)] flex-shrink-0" />

        {/* Fecha inicio */}
        <DateInput
          label="Desde"
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
          className="flex-1"
        />

        {/* Separador */}
        <span className="text-[var(--color-text-tertiary)] mt-8">→</span>

        {/* Fecha fin */}
        <DateInput
          label="Hasta"
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
          className="flex-1"
        />
      </div>
    );
  }
);

DateRangePicker.displayName = "DateRangePicker";
