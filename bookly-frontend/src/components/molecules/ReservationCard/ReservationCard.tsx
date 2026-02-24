import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { DurationBadge } from "@/components/atoms/DurationBadge";
import { StatusBadge } from "@/components/atoms/StatusBadge";
import type { Reservation } from "@/types/entities/reservation";
import * as React from "react";

/**
 * ReservationCard - Molecule Component
 *
 * Tarjeta para mostrar información de una reserva.
 * Incluye recurso, fechas, estado, duración y acciones.
 *
 * Design System:
 * - Usa Card base component
 * - StatusBadge para estados
 * - DurationBadge para duración
 * - Botones para acciones
 * - Grid de 8px en spacing
 * - Responsive
 *
 * @example
 * ```tsx
 * <ReservationCard
 *   reservation={reserva}
 *   onView={(id) => router.push(`/reservas/${id}`)}
 *   onCancel={(id) => handleCancel(id)}
 *   showActions
 * />
 * ```
 */

export interface ReservationCardProps {
  /** Reserva a mostrar */
  reservation: Reservation;
  /** Callback al hacer click en ver */
  onView?: (id: string) => void;
  /** Callback al hacer click en editar */
  onEdit?: (id: string) => void;
  /** Callback al hacer click en cancelar */
  onCancel?: (id: string) => void;
  /** Mostrar acciones */
  showActions?: boolean;
  /** Vista compacta */
  compact?: boolean;
  /** Clase CSS adicional */
  className?: string;
}

export const ReservationCard = React.memo(function ReservationCard({
  reservation,
  onView,
  onEdit,
  onCancel,
  showActions = true,
  compact = false,
  className = "",
}: ReservationCardProps) {
  // Calcular duración en minutos
  const calculateDuration = (): number => {
    const start = new Date(reservation.startDate);
    const end = new Date(reservation.endDate);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  };

  // Formatear fecha y hora
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  };

  const canEdit =
    reservation.status === "PENDING" || reservation.status === "CONFIRMED";
  const canCancel =
    reservation.status !== "CANCELLED" && reservation.status !== "COMPLETED";

  return (
    <Card
      className={`hover:shadow-md transition-all duration-200 border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] ${onView ? "cursor-pointer hover:border-brand-primary-300" : ""} ${className}`}
      onClick={() => onView?.(reservation.id)}
    >
      <CardHeader className="pb-3 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className={`text-[var(--color-text-primary)] font-semibold truncate ${compact ? "text-base" : "text-lg"}`}>
              {reservation.title}
            </CardTitle>
            <CardDescription className="mt-1 text-sm text-[var(--color-text-secondary)] flex items-center gap-1.5">
              <span className="text-brand-primary-500">📍</span>
              <span className="truncate">{reservation.resourceName || `Recurso #${reservation.resourceId}`}</span>
            </CardDescription>
          </div>
          <StatusBadge type="reservation" status={reservation.status} />
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Fechas */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between text-sm bg-[var(--color-bg-primary)] p-3 rounded-md border border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-text-tertiary)]">🕒</span>
            <div className="flex flex-col">
              <span className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">Inicio</span>
              <span className="font-medium text-[var(--color-text-primary)]">
                {formatDateTime(reservation.startDate)}
              </span>
            </div>
          </div>
          <div className="hidden sm:block text-[var(--color-border-strong)]">
            →
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--color-text-tertiary)] opacity-0 sm:opacity-100 hidden sm:inline">🕒</span>
            <div className="flex flex-col">
              <span className="text-xs text-[var(--color-text-tertiary)] uppercase tracking-wider font-medium">Fin</span>
              <span className="font-medium text-[var(--color-text-primary)]">
                {formatDateTime(reservation.endDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Info adicional */}
        <div className="flex flex-wrap items-center gap-3">
          <DurationBadge minutes={calculateDuration()} />
          {reservation.recurrenceType &&
            reservation.recurrenceType !== "NONE" && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-brand-primary-50 text-brand-primary-700 rounded-full border border-brand-primary-100">
                <span>🔁</span>
                {reservation.recurrenceType}
              </span>
            )}
          {!compact && reservation.userName && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full border border-gray-200">
              <span>👤</span>
              <span className="truncate max-w-[120px]">{reservation.userName}</span>
            </span>
          )}
        </div>

        {/* Descripción */}
        {!compact && reservation.description && (
          <div className="text-sm text-[var(--color-text-secondary)] bg-[var(--color-bg-primary)]/50 p-3 rounded-md border border-[var(--color-border-subtle)]/50">
            <p className="line-clamp-2 leading-relaxed">
              {reservation.description}
            </p>
          </div>
        )}

        {/* Acciones */}
        {showActions && (canEdit || canCancel) && (
          <div
            className="flex gap-3 pt-4 border-t border-[var(--color-border-subtle)] mt-2"
            onClick={(e) => e.stopPropagation()}
          >
            {canEdit && onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(reservation.id)}
                className="flex-1 bg-white hover:bg-gray-50 border-gray-200"
              >
                Editar
              </Button>
            )}
            {canCancel && onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel(reservation.id)}
                className="flex-1 text-state-error-600 hover:text-state-error-700 hover:bg-state-error-50 border-state-error-200"
              >
                Cancelar
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});
