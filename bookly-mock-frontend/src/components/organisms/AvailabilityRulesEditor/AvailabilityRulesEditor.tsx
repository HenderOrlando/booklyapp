"use client";

import { Input } from "@/components/atoms/Input/Input";
import { cn } from "@/lib/utils";
import { Clock, CalendarDays, RefreshCw, Shield, Timer } from "lucide-react";
import * as React from "react";

import type { AvailabilityRules } from "@/types/entities/resource";

/**
 * AvailabilityRulesEditor — RF-05 + RF-17: Editor de reglas de disponibilidad
 *
 * Permite configurar las reglas de disponibilidad de un recurso:
 * - Requiere aprobación
 * - Días máximos de anticipación
 * - Duración mín/máx de reservas
 * - Buffer entre reservas (RF-17)
 * - Permitir recurrencia
 */

interface AvailabilityRulesEditorProps {
  value: AvailabilityRules;
  onChange: (rules: AvailabilityRules) => void;
  className?: string;
}

export function AvailabilityRulesEditor({
  value,
  onChange,
  className,
}: AvailabilityRulesEditorProps) {
  const update = (field: keyof AvailabilityRules, val: any) => {
    onChange({ ...value, [field]: val });
  };

  return (
    <div className={cn("space-y-4 rounded-lg border p-4", className)}>
      <h4 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
        <Shield className="h-4 w-4" />
        Reglas de Disponibilidad
      </h4>

      {/* Requires Approval */}
      <label className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-[var(--color-text-tertiary)]" />
          <span className="text-sm text-[var(--color-text-primary)]">
            Requiere aprobación
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={value.requiresApproval}
          onClick={() => update("requiresApproval", !value.requiresApproval)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
            value.requiresApproval ? "bg-brand-primary-500" : "bg-gray-200"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform",
              value.requiresApproval ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </label>

      {/* Max Advance Booking Days */}
      <div className="flex items-center gap-3">
        <CalendarDays className="h-4 w-4 shrink-0 text-[var(--color-text-tertiary)]" />
        <label className="flex-1 text-sm text-[var(--color-text-primary)]">
          Días máx. de anticipación
        </label>
        <Input
          type="number"
          min={1}
          max={365}
          value={value.maxAdvanceBookingDays}
          onChange={(e) => update("maxAdvanceBookingDays", parseInt(e.target.value) || 0)}
          className="w-24 text-center"
        />
      </div>

      {/* Min Booking Duration */}
      <div className="flex items-center gap-3">
        <Clock className="h-4 w-4 shrink-0 text-[var(--color-text-tertiary)]" />
        <label className="flex-1 text-sm text-[var(--color-text-primary)]">
          Duración mínima (min)
        </label>
        <Input
          type="number"
          min={15}
          max={480}
          step={15}
          value={value.minBookingDurationMinutes}
          onChange={(e) => update("minBookingDurationMinutes", parseInt(e.target.value) || 0)}
          className="w-24 text-center"
        />
      </div>

      {/* Max Booking Duration */}
      <div className="flex items-center gap-3">
        <Clock className="h-4 w-4 shrink-0 text-[var(--color-text-tertiary)]" />
        <label className="flex-1 text-sm text-[var(--color-text-primary)]">
          Duración máxima (min)
        </label>
        <Input
          type="number"
          min={15}
          max={480}
          step={15}
          value={value.maxBookingDurationMinutes}
          onChange={(e) => update("maxBookingDurationMinutes", parseInt(e.target.value) || 0)}
          className="w-24 text-center"
        />
      </div>

      {/* Buffer Time Between Reservations (RF-17) */}
      <div className="flex items-center gap-3">
        <Timer className="h-4 w-4 shrink-0 text-[var(--color-text-tertiary)]" />
        <label className="flex-1 text-sm text-[var(--color-text-primary)]">
          Buffer entre reservas (min)
        </label>
        <Input
          type="number"
          min={0}
          max={120}
          step={5}
          value={value.bufferTimeBetweenReservationsMinutes}
          onChange={(e) => update("bufferTimeBetweenReservationsMinutes", parseInt(e.target.value) || 0)}
          className="w-24 text-center"
        />
      </div>

      {/* Allow Recurring */}
      <label className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-[var(--color-text-tertiary)]" />
          <span className="text-sm text-[var(--color-text-primary)]">
            Permitir reservas recurrentes
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={value.allowRecurring}
          onClick={() => update("allowRecurring", !value.allowRecurring)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
            value.allowRecurring ? "bg-brand-primary-500" : "bg-gray-200"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform",
              value.allowRecurring ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
      </label>
    </div>
  );
}
