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
import { Label } from "@/components/atoms/Label";
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
    <div className="space-y-6">
      {/* Frecuencia e Intervalo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="frequency">Repetir</Label>
          <Select value={pattern.frequency} onValueChange={handleFrequencyChange}>
            <SelectTrigger id="frequency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Diariamente</SelectItem>
              <SelectItem value="WEEKLY">Semanalmente</SelectItem>
              <SelectItem value="MONTHLY">Mensualmente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="interval">
            Cada {pattern.frequency === "DAILY" && "día(s)"}
            {pattern.frequency === "WEEKLY" && "semana(s)"}
            {pattern.frequency === "MONTHLY" && "mes(es)"}
          </Label>
          <Input
            id="interval"
            type="number"
            min="1"
            max="30"
            value={pattern.interval}
            onChange={(e) =>
              onChange({ ...pattern, interval: parseInt(e.target.value) })
            }
          />
        </div>
      </div>

      {/* Días de la semana (solo para semanal) */}
      {pattern.frequency === "WEEKLY" && (
        <div className="flex flex-col gap-3">
          <Label>Días de la semana</Label>
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const isActive = pattern.daysOfWeek?.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => handleDayToggle(day.value)}
                  className={`min-w-[44px] h-10 rounded-lg text-sm font-semibold transition-all duration-200 border ${
                    isActive
                      ? "bg-brand-primary-600 text-white border-brand-primary-600 shadow-sm"
                      : "bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-brand-primary-300 hover:text-brand-primary-600"
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Día del mes (solo para mensual) */}
      {pattern.frequency === "MONTHLY" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="dayOfMonth">Día del mes</Label>
          <Input
            id="dayOfMonth"
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
      <div className="flex flex-col gap-3 pt-2 border-t border-[var(--color-border-subtle)]/50">
        <Label>Termina</Label>
        <div className="flex p-1 bg-[var(--color-bg-muted)] rounded-lg w-full sm:w-fit">
          <button
            type="button"
            onClick={() => setEndType("date")}
            className={`flex-1 sm:flex-none py-1.5 px-6 rounded-md text-sm font-medium transition-all ${
              endType === "date"
                ? "bg-[var(--color-bg-surface)] text-brand-primary-600 shadow-sm"
                : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
            }`}
          >
            En fecha
          </button>
          <button
            type="button"
            onClick={() => setEndType("occurrences")}
            className={`flex-1 sm:flex-none py-1.5 px-6 rounded-md text-sm font-medium transition-all ${
              endType === "occurrences"
                ? "bg-[var(--color-bg-surface)] text-brand-primary-600 shadow-sm"
                : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
            }`}
          >
            Después de
          </button>
        </div>

        <div className="mt-1">
          {endType === "date" ? (
            <div className="max-w-xs">
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
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-24">
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
              </div>
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                repeticiones
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Resumen */}
      <div className="p-4 bg-brand-primary-500/5 rounded-xl border border-brand-primary-500/20">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-primary-600 uppercase tracking-wider mb-2">
          <span>📝</span>
          <span>Resumen de recurrencia</span>
        </div>
        <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed italic">
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
            ` hasta el ${new Date(pattern.endDate).toLocaleDateString("es-ES", {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}`}
          {pattern.occurrences && ` por ${pattern.occurrences} veces`}
        </div>
      </div>
    </div>
  );
}
