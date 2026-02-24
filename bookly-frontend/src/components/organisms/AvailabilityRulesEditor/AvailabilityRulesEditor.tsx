"use client";

import { Checkbox } from "@/components/atoms/Checkbox";
import { Input } from "@/components/atoms/Input";
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
  const update = <K extends keyof AvailabilityRules>(
    field: K,
    val: AvailabilityRules[K]
  ) => {
    onChange({ ...value, [field]: val });
  };

  return (
    <div className={cn("space-y-4 rounded-lg border p-4", className)}>
      <h4 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
        <Shield className="h-4 w-4" />
        Reglas de Disponibilidad
      </h4>

      {/* Requires Approval */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-[var(--color-text-tertiary)]" />
          <label
            htmlFor="requiresApproval"
            className="text-sm text-[var(--color-text-primary)] cursor-pointer"
          >
            Requiere aprobación
          </label>
        </div>
        <Checkbox
          id="requiresApproval"
          checked={value.requiresApproval}
          onCheckedChange={(checked) => update("requiresApproval", !!checked)}
        />
      </div>

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-[var(--color-text-tertiary)]" />
          <label
            htmlFor="allowRecurring"
            className="text-sm text-[var(--color-text-primary)] cursor-pointer"
          >
            Permitir reservas recurrentes
          </label>
        </div>
        <Checkbox
          id="allowRecurring"
          checked={value.allowRecurring}
          onCheckedChange={(checked) => update("allowRecurring", !!checked)}
        />
      </div>
    </div>
  );
}
