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
import { useTranslations } from "next-intl";
import React from "react";

interface RecurringPatternSelectorProps {
  pattern: RecurrencePattern;
  onChange: (pattern: RecurrencePattern) => void;
}

export function RecurringPatternSelector({
  pattern,
  onChange,
}: RecurringPatternSelectorProps) {
  const t = useTranslations("reservations.recurring_selector");
  const [endType, setEndType] = React.useState<"date" | "occurrences">("date");

  const DAYS_OF_WEEK: Array<{ value: DayOfWeek; label: string }> = [
    { value: "MONDAY", label: t("days_of_week.monday") },
    { value: "TUESDAY", label: t("days_of_week.tuesday") },
    { value: "WEDNESDAY", label: t("days_of_week.wednesday") },
    { value: "THURSDAY", label: t("days_of_week.thursday") },
    { value: "FRIDAY", label: t("days_of_week.friday") },
    { value: "SATURDAY", label: t("days_of_week.saturday") },
    { value: "SUNDAY", label: t("days_of_week.sunday") },
  ];

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
          <Label htmlFor="frequency">{t("repeat_label")}</Label>
          <Select value={pattern.frequency} onValueChange={handleFrequencyChange}>
            <SelectTrigger id="frequency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">{t("daily")}</SelectItem>
              <SelectItem value="WEEKLY">{t("weekly")}</SelectItem>
              <SelectItem value="MONTHLY">{t("monthly")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="interval">
            {t("every_label")}{" "}
            {pattern.frequency === "DAILY" && t("days")}
            {pattern.frequency === "WEEKLY" && t("weeks")}
            {pattern.frequency === "MONTHLY" && t("months")}
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
          <Label>{t("days_of_week_label")}</Label>
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
          <Label htmlFor="dayOfMonth">{t("day_of_month_label")}</Label>
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
        <Label>{t("ends_label")}</Label>
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
            {t("on_date")}
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
            {t("after")}
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
                {t("occurrences_label")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Resumen */}
      <div className="p-4 bg-brand-primary-500/5 rounded-xl border border-brand-primary-500/20">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-primary-600 uppercase tracking-wider mb-2">
          <span>📝</span>
          <span>{t("summary_title")}</span>
        </div>
        <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed italic">
          {pattern.frequency === "DAILY" &&
            t("summary_desc.daily", { interval: pattern.interval })}
          {pattern.frequency === "WEEKLY" &&
            t("summary_desc.weekly", {
              interval: pattern.interval,
              days: pattern.daysOfWeek
                ?.map((d) => DAYS_OF_WEEK.find((day) => day.value === d)?.label)
                .join(", ") || t("days_of_week_label"),
            })}
          {pattern.frequency === "MONTHLY" &&
            t("summary_desc.monthly", {
              interval: pattern.interval,
              day: pattern.dayOfMonth || 1,
            })}
          {pattern.endDate &&
            t("summary_desc.until", {
              date: new Date(pattern.endDate).toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            })}
          {pattern.occurrences &&
            t("summary_desc.for_occurrences", { count: pattern.occurrences })}
        </div>
      </div>
    </div>
  );
}
