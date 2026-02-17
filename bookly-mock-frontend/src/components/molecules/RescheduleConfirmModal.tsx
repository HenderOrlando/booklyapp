/**
 * RescheduleConfirmModal - Modal de confirmación para reasignación con conflictos
 */

"use client";

import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import type { CalendarEvent } from "@/types/calendar";
import type { Reservation } from "@/types/entities/reservation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface RescheduleConfirmModalProps {
  isOpen: boolean;
  event: CalendarEvent | null;
  newDate: Date | null;
  conflicts: Reservation[];
  onConfirm: (force: boolean) => void;
  onCancel: () => void;
}

export function RescheduleConfirmModal({
  isOpen,
  event,
  newDate,
  conflicts,
  onConfirm,
  onCancel,
}: RescheduleConfirmModalProps) {
  if (!isOpen || !event || !newDate) return null;

  const newStartTime = format(event.start, "HH:mm");
  const newEndTime = format(event.end, "HH:mm");
  const formattedNewDate = format(newDate, "d 'de' MMMM, yyyy", { locale: es });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">
            ⚠️ Conflicto Detectado
          </CardTitle>
          <CardDescription>
            Se encontraron {conflicts.length} reserva
            {conflicts.length > 1 ? "s" : ""} que se solapan con la nueva fecha
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Resumen del evento a reasignar */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-[var(--color-text-primary)] dark:text-white mb-2">
              Evento a reasignar:
            </h4>
            <div className="text-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)]">
              <p className="font-medium">{event.title}</p>
              <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                {event.resourceName}
              </p>
              <p className="mt-1">
                <span className="font-medium">Nueva fecha:</span>{" "}
                {formattedNewDate}
              </p>
              <p>
                <span className="font-medium">Horario:</span> {newStartTime} -{" "}
                {newEndTime}
              </p>
            </div>
          </div>

          {/* Lista de conflictos */}
          <div>
            <h4 className="font-semibold text-[var(--color-text-primary)] dark:text-white mb-2">
              Reservas en conflicto:
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {conflicts.map((conflict) => (
                <div
                  key={conflict.id}
                  className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                >
                  <p className="font-medium text-[var(--color-text-primary)] dark:text-white">
                    {conflict.title}
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                    {conflict.userName || "Usuario"}
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                    {format(new Date(conflict.startDate), "HH:mm")} -{" "}
                    {format(new Date(conflict.endDate), "HH:mm")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Advertencia */}
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>⚠️ Advertencia:</strong> Si fuerzas la reasignación,
              podrías crear conflictos de horario. Se recomienda elegir otra
              fecha o coordinar con los usuarios afectados.
            </p>
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-4 border-t border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)]">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => onConfirm(true)}
              className="flex-1"
            >
              Forzar Reasignación
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
