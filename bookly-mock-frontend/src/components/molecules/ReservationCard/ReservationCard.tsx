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
      className={`hover:shadow-lg transition-shadow ${onView ? "cursor-pointer" : ""} ${className}`}
      onClick={() => onView?.(reservation.id)}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className={compact ? "text-base" : ""}>
              {reservation.title}
            </CardTitle>
            <CardDescription className="mt-1">
              {reservation.resourceName || `Recurso #${reservation.resourceId}`}
            </CardDescription>
          </div>
          <StatusBadge type="reservation" status={reservation.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Fechas y duración */}
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div>
            <span className="text-[var(--color-text-secondary)]">Inicio:</span>
            <p className="font-medium text-[var(--color-text-primary)]">
              {formatDateTime(reservation.startDate)}
            </p>
          </div>
          <div>
            <span className="text-[var(--color-text-secondary)]">Fin:</span>
            <p className="font-medium text-[var(--color-text-primary)]">
              {formatDateTime(reservation.endDate)}
            </p>
          </div>
        </div>

        {/* Duración */}
        <div className="flex items-center gap-2">
          <DurationBadge minutes={calculateDuration()} />
          {reservation.recurrenceType &&
            reservation.recurrenceType !== "NONE" && (
              <span className="text-xs text-[var(--color-text-secondary)]">
                🔁 {reservation.recurrenceType}
              </span>
            )}
        </div>

        {/* Usuario */}
        {!compact && reservation.userName && (
          <div className="text-sm">
            <span className="text-[var(--color-text-secondary)]">
              Solicitante:
            </span>
            <p className="font-medium text-[var(--color-text-primary)]">
              {reservation.userName}
            </p>
          </div>
        )}

        {/* Descripción */}
        {!compact && reservation.description && (
          <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
            {reservation.description}
          </p>
        )}

        {/* Acciones */}
        {showActions && (
          <div
            className="flex gap-2 pt-2 border-t border-[var(--color-border-subtle)]"
            onClick={(e) => e.stopPropagation()}
          >
            {canEdit && onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(reservation.id)}
                className="flex-1"
              >
                Editar
              </Button>
            )}
            {canCancel && onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel(reservation.id)}
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
