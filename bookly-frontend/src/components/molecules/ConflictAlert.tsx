import { AlertCircle, Calendar, Clock, User } from "lucide-react";
import * as React from "react";
import { useConflictValidator } from "@/hooks/useConflictValidator";
import { format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * ConflictAlert - Molecule Component
 * 
 * Muestra una advertencia si la solicitud de aprobación actual
 * entra en conflicto con otras reservas aprobadas o activas.
 */
export interface ConflictAlertProps {
  resourceId: string;
  startDate: string;
  endDate: string;
  excludeReservationId?: string;
  className?: string;
}

export const ConflictAlert: React.FC<ConflictAlertProps> = ({
  resourceId,
  startDate,
  endDate,
  excludeReservationId,
  className = "",
}) => {
  const { hasConflict, conflictingReservations, message } = useConflictValidator({
    resourceId,
    startDate,
    endDate,
    excludeReservationId,
  });

  if (!hasConflict || !conflictingReservations || conflictingReservations.length === 0) {
    return null;
  }

  return (
    <div
      className={`p-4 rounded-lg bg-[var(--color-state-error-bg)] border border-[var(--color-state-error-text)]/20 ${className} animate-in fade-in slide-in-from-top-2`}
      role="alert"
    >
      <div className="flex gap-3">
        <AlertCircle className="h-5 w-5 text-[var(--color-state-error-text)] flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <p className="font-bold text-[var(--color-state-error-text)] text-sm">
            Conflicto de Disponibilidad Detectado
          </p>
          <p className="text-sm text-[var(--color-state-error-text)] opacity-90">
            {message}
          </p>
          
          <div className="mt-3 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-state-error-text)] opacity-70">
              Reservas en Conflicto:
            </p>
            {conflictingReservations.map((res) => (
              <div 
                key={res.id} 
                className="p-2 rounded bg-white/10 border border-white/5 space-y-1"
              >
                <p className="text-sm font-medium text-[var(--color-state-error-text)]">
                  {res.title}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-state-error-text)] opacity-80">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{res.userName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(res.startDate), "d 'de' MMM", { locale: es })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {format(new Date(res.startDate), "HH:mm")} - {format(new Date(res.endDate), "HH:mm")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

ConflictAlert.displayName = "ConflictAlert";
