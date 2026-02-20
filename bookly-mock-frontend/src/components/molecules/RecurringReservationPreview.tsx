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
        <CardHeader className="border-b border-[var(--color-border-subtle)] pb-4">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-brand-primary-500/10 rounded-lg text-brand-primary-600">
              <Calendar className="w-6 h-6" />
            </div>
            Vista Previa de Reserva Recurrente
          </CardTitle>
          <CardDescription className="text-base mt-2">{description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 pt-6">
          {/* Resumen de métricas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[var(--color-bg-primary)]/50 p-4 rounded-xl border border-[var(--color-border-subtle)] text-center">
              <div className="text-3xl font-bold text-brand-primary-600">
                {instances.length}
              </div>
              <div className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)] mt-1">
                Total
              </div>
            </div>
            <div className="bg-state-success-500/5 p-4 rounded-xl border border-state-success-500/20 text-center">
              <div className="text-3xl font-bold text-state-success-600">
                {validation.successCount}
              </div>
              <div className="text-xs font-medium uppercase tracking-wider text-state-success-700/70 mt-1">
                Disponibles
              </div>
            </div>
            <div className="bg-state-error-500/5 p-4 rounded-xl border border-state-error-500/20 text-center">
              <div className="text-3xl font-bold text-state-error-600">
                {validation.failureCount}
              </div>
              <div className="text-xs font-medium uppercase tracking-wider text-state-error-700/70 mt-1">
                Conflictos
              </div>
            </div>
          </div>

          {/* Progreso de creación (Solo durante ejecución) */}
          {isCreating && progress && (
            <div className="p-5 bg-brand-primary-500/5 rounded-xl border border-brand-primary-500/20 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-brand-primary-700">
                  Procesando solicitudes...
                </span>
                <span className="text-sm font-mono font-bold text-brand-primary-600">
                  {Math.round(((progress.created + progress.failed) / progress.total) * 100)}%
                </span>
              </div>
              <div className="w-full bg-[var(--color-bg-primary)] rounded-full h-3 mb-3 overflow-hidden border border-[var(--color-border-subtle)]">
                <div
                  className="bg-brand-primary-600 h-full transition-all duration-500 ease-out"
                  style={{
                    width: `${((progress.created + progress.failed) / progress.total) * 100}%`,
                  }}
                />
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] italic">
                {progress.current}
              </p>
            </div>
          )}

          {/* Advertencia de conflictos */}
          {validation.failureCount > 0 && !isCreating && (
            <div className="p-5 bg-state-warning-500/10 rounded-xl border border-state-warning-500/30">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-state-warning-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-state-warning-700" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-state-warning-800 mb-1">
                    Atención: Conflictos detectados
                  </h4>
                  <p className="text-sm text-state-warning-700/80 leading-relaxed">
                    Se encontraron {validation.failureCount} fechas donde el recurso ya está reservado.
                    Puedes elegir omitir estas fechas y proceder con las disponibles.
                  </p>
                  <label className="flex items-center gap-3 mt-4 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={skipConflicts}
                        onChange={(e) => setSkipConflicts(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-state-warning-500/20 rounded-full peer peer-checked:bg-state-warning-600 transition-colors"></div>
                      <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                    </div>
                    <span className="text-sm font-semibold text-state-warning-800 group-hover:text-state-warning-900 transition-colors">
                      Omitir conflictos y crear {validation.successCount} reservas
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Lista de instancias */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                <span>🗓️</span> Cronograma propuesto
              </h4>
              <span className="text-xs font-bold px-2 py-1 bg-[var(--color-bg-muted)] rounded-md text-[var(--color-text-tertiary)] uppercase">
                {instances.length} instancias
              </span>
            </div>
            
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
              {visibleInstances.map((instance) => {
                const hasConflict = validation.conflicts.some(
                  (c) => c.date === instance.startDate.split("T")[0],
                );
                const date = new Date(instance.startDate);

                return (
                  <div
                    key={instance.id}
                    className={cn(
                      "p-4 rounded-xl border transition-all duration-200",
                      hasConflict
                        ? "bg-state-error-500/[0.03] border-state-error-500/20"
                        : "bg-state-success-500/[0.03] border-state-success-500/20"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-2 rounded-lg shrink-0",
                          hasConflict ? "bg-state-error-500/10 text-state-error-600" : "bg-state-success-500/10 text-state-success-600"
                        )}>
                          {hasConflict ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-[var(--color-text-primary)] capitalize">
                            {format(date, "EEEE, d 'de' MMMM", { locale: es })}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-mono bg-[var(--color-bg-primary)] px-1.5 py-0.5 rounded text-[var(--color-text-secondary)]">
                              {format(new Date(instance.startDate), "HH:mm")} - {format(new Date(instance.endDate), "HH:mm")}
                            </span>
                            <span className="text-[var(--color-text-tertiary)] text-xs">•</span>
                            <span className="text-xs text-[var(--color-text-tertiary)]">
                              {format(date, "yyyy")}
                            </span>
                          </div>
                        </div>
                      </div>
                      {hasConflict && (
                        <Badge variant="error" className="font-bold">Conflicto</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {hasMore && !showAllDates && (
              <Button
                variant="outline"
                onClick={() => setShowAllDates(true)}
                className="w-full h-12 border-dashed border-2 hover:bg-brand-primary-500/5 hover:border-brand-primary-500/40 hover:text-brand-primary-600 transition-all"
              >
                Ver todas las {instances.length} fechas
              </Button>
            )}
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[var(--color-border-subtle)]">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isCreating}
              className="flex-1 h-12 font-bold"
            >
              Cancelar
            </Button>
            {validation.failureCount > 0 && !skipConflicts ? (
              <Button
                type="button"
                variant="destructive"
                disabled
                className="flex-[2] h-12 font-bold opacity-70"
              >
                Corrija los conflictos para continuar
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => onConfirm(skipConflicts)}
                disabled={isCreating}
                className="flex-[2] h-12 font-bold shadow-lg shadow-brand-primary-500/20"
              >
                {isCreating
                  ? "Procesando..."
                  : skipConflicts
                    ? `Confirmar ${validation.successCount} Reservas`
                    : `Confirmar ${instances.length} Reservas`}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
