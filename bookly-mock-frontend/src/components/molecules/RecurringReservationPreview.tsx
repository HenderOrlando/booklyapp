/**
 * RecurringReservationPreview - Preview de instancias de reserva recurrente
 *
 * Muestra:
 * - Descripción del patrón en lenguaje natural
 * - Lista de fechas que se crearán
 * - Conflictos detectados
 * - Resumen de creación
 */

"use client";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import type { Reservation } from "@/types/entities/reservation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AlertCircle, Calendar, CheckCircle, XCircle } from "lucide-react";
import React from "react";

interface RecurringReservationPreviewProps {
  instances: Reservation[];
  description: string;
  validation: {
    canCreate: boolean;
    conflicts: Array<{ date: string; conflictingReservation: Reservation }>;
    successCount: number;
    failureCount: number;
  };
  onConfirm: (skipConflicts: boolean) => void;
  onCancel: () => void;
  isCreating?: boolean;
  progress?: {
    total: number;
    created: number;
    failed: number;
    current: string;
  };
}

export function RecurringReservationPreview({
  instances,
  description,
  validation,
  onConfirm,
  onCancel,
  isCreating = false,
  progress,
}: RecurringReservationPreviewProps) {
  const [showAllDates, setShowAllDates] = React.useState(false);
  const [skipConflicts, setSkipConflicts] = React.useState(false);

  const visibleInstances = showAllDates ? instances : instances.slice(0, 5);
  const hasMore = instances.length > 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Vista Previa de Reserva Recurrente
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Resumen */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {instances.length}
                </div>
                <div className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  Total Instancias
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {validation.successCount}
                </div>
                <div className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  Sin Conflicto
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {validation.failureCount}
                </div>
                <div className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  Con Conflicto
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progreso de creación */}
          {isCreating && progress && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Creando reservas...
                </span>
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  {progress.created + progress.failed} / {progress.total}
                </span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${((progress.created + progress.failed) / progress.total) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                {progress.current}
              </p>
            </div>
          )}

          {/* Advertencia de conflictos */}
          {validation.failureCount > 0 && !isCreating && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                    {validation.failureCount} Conflicto
                    {validation.failureCount > 1 ? "s" : ""} Detectado
                    {validation.failureCount > 1 ? "s" : ""}
                  </h4>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Algunas fechas tienen reservas existentes que se solapan.
                    Puedes optar por saltar esas fechas y crear solo las que no
                    tienen conflicto.
                  </p>
                  <label className="flex items-center gap-2 mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skipConflicts}
                      onChange={(e) => setSkipConflicts(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-yellow-800 dark:text-yellow-200">
                      Saltar fechas con conflicto y crear solo{" "}
                      {validation.successCount} reservas sin conflicto
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Lista de instancias */}
          <div>
            <h4 className="font-semibold text-[var(--color-text-primary)] dark:text-foreground mb-3">
              Instancias a Crear ({instances.length})
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {visibleInstances.map((instance, index) => {
                const hasConflict = validation.conflicts.some(
                  (c) => c.date === instance.startDate.split("T")[0],
                );
                const date = new Date(instance.startDate);

                return (
                  <div
                    key={instance.id}
                    className={`p-3 rounded-lg border ${
                      hasConflict
                        ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                        : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {hasConflict ? (
                          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        )}
                        <div>
                          <p className="font-medium text-[var(--color-text-primary)] dark:text-foreground">
                            {format(date, "EEEE, d 'de' MMMM 'de' yyyy", {
                              locale: es,
                            })}
                          </p>
                          <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                            {format(new Date(instance.startDate), "HH:mm")} -{" "}
                            {format(new Date(instance.endDate), "HH:mm")}
                          </p>
                        </div>
                      </div>
                      {hasConflict && <Badge variant="error">Conflicto</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>

            {hasMore && !showAllDates && (
              <Button
                variant="outline"
                onClick={() => setShowAllDates(true)}
                className="w-full mt-2"
              >
                Ver todas las {instances.length} fechas
              </Button>
            )}
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-4 border-t border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)]">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isCreating}
              className="flex-1"
            >
              Cancelar
            </Button>
            {validation.failureCount > 0 && !skipConflicts ? (
              <Button
                type="button"
                variant="destructive"
                disabled
                className="flex-1"
              >
                No se puede crear (hay conflictos)
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => onConfirm(skipConflicts)}
                disabled={isCreating}
                className="flex-1"
              >
                {isCreating
                  ? "Creando..."
                  : skipConflicts
                    ? `Crear ${validation.successCount} Reservas`
                    : `Crear ${instances.length} Reservas`}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
