/**
 * RecurringPatternSelector - Selector de patrón de recurrencia
 *
 * Permite configurar:
 * - Frecuencia (Diaria, Semanal, Mensual)
 * - Intervalo
 * - Días de la semana (para semanal)
 * - Día del mes (para mensual)
 * - Fin de recurrencia (fecha o número de ocurrencias)
 */

"use client";

import { Input } from "@/components/atoms/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import type { DayOfWeek, RecurrencePattern } from "@/types/entities/recurring";
import React from "react";

interface RecurringPatternSelectorProps {
  pattern: RecurrencePattern;
  onChange: (pattern: RecurrencePattern) => void;
}

const DAYS_OF_WEEK: Array<{ value: DayOfWeek; label: string }> = [
  { value: "MONDAY", label: "Lun" },
  { value: "TUESDAY", label: "Mar" },
  { value: "WEDNESDAY", label: "Mié" },
  { value: "THURSDAY", label: "Jue" },
  { value: "FRIDAY", label: "Vie" },
  { value: "SATURDAY", label: "Sáb" },
  { value: "SUNDAY", label: "Dom" },
];

export function RecurringPatternSelector({
  pattern,
  onChange,
}: RecurringPatternSelectorProps) {
  const [endType, setEndType] = React.useState<"date" | "occurrences">("date");

  const handleFrequencyChange = (value: string) => {
    onChange({
      ...pattern,
      frequency: value as RecurrencePattern["frequency"],
      daysOfWeek: value === "WEEKLY" ? ["MONDAY"] : undefined,
      dayOfMonth: value === "MONTHLY" ? 1 : undefined,
    });
  };

  const handleDayToggle = (day: DayOfWeek) => {
    const current = pattern.daysOfWeek || [];
    const newDays = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];

    onChange({ ...pattern, daysOfWeek: newDays });
  };

  return (
    <div className="space-y-4">
      {/* Frecuencia */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Repetir
        </label>
        <Select value={pattern.frequency} onValueChange={handleFrequencyChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DAILY">Diariamente</SelectItem>
            <SelectItem value="WEEKLY">Semanalmente</SelectItem>
            <SelectItem value="MONTHLY">Mensualmente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Intervalo */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Cada {pattern.frequency === "DAILY" && "día(s)"}
          {pattern.frequency === "WEEKLY" && "semana(s)"}
          {pattern.frequency === "MONTHLY" && "mes(es)"}
        </label>
        <Input
          type="number"
          min="1"
          max="30"
          value={pattern.interval}
          onChange={(e) =>
            onChange({ ...pattern, interval: parseInt(e.target.value) })
          }
        />
      </div>

      {/* Días de la semana (solo para semanal) */}
      {pattern.frequency === "WEEKLY" && (
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Días de la semana
          </label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => handleDayToggle(day.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pattern.daysOfWeek?.includes(day.value)
                    ? "bg-blue-600 text-white"
                    : "bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-elevated)]"
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Día del mes (solo para mensual) */}
      {pattern.frequency === "MONTHLY" && (
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Día del mes
          </label>
          <Input
            type="number"
            min="1"
            max="31"
            value={pattern.dayOfMonth || 1}
            onChange={(e) =>
              onChange({ ...pattern, dayOfMonth: parseInt(e.target.value) })
            }
          />
        </div>
      )}

      {/* Fin de recurrencia */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Termina
        </label>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setEndType("date")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              endType === "date"
                ? "bg-blue-600 text-white"
                : "bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-elevated)]"
            }`}
          >
            En fecha
          </button>
          <button
            type="button"
            onClick={() => setEndType("occurrences")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              endType === "occurrences"
                ? "bg-blue-600 text-white"
                : "bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-elevated)]"
            }`}
          >
            Después de
          </button>
        </div>

        {endType === "date" ? (
          <Input
            type="date"
            value={pattern.endDate || ""}
            onChange={(e) =>
              onChange({
                ...pattern,
                endDate: e.target.value,
                occurrences: undefined,
              })
            }
          />
        ) : (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="1"
              max="365"
              placeholder="10"
              value={pattern.occurrences || ""}
              onChange={(e) =>
                onChange({
                  ...pattern,
                  occurrences: parseInt(e.target.value),
                  endDate: undefined,
                })
              }
            />
            <span className="text-sm text-[var(--color-text-tertiary)]">ocurrencias</span>
          </div>
        )}
      </div>

      {/* Resumen */}
      <div className="p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
        <div className="text-xs font-medium text-blue-300 mb-1">Resumen:</div>
        <div className="text-sm text-[var(--color-text-tertiary)]">
          {pattern.frequency === "DAILY" &&
            `Cada ${pattern.interval} día${pattern.interval > 1 ? "s" : ""}`}
          {pattern.frequency === "WEEKLY" &&
            `Cada ${pattern.interval} semana${pattern.interval > 1 ? "s" : ""} los ${
              pattern.daysOfWeek
                ?.map((d) => DAYS_OF_WEEK.find((day) => day.value === d)?.label)
                .join(", ") || "días seleccionados"
            }`}
          {pattern.frequency === "MONTHLY" &&
            `Cada ${pattern.interval} mes${pattern.interval > 1 ? "es" : ""} el día ${pattern.dayOfMonth || 1}`}
          {pattern.endDate &&
            ` hasta el ${new Date(pattern.endDate).toLocaleDateString("es-ES")}`}
          {pattern.occurrences && ` por ${pattern.occurrences} veces`}
        </div>
      </div>
    </div>
  );
}
