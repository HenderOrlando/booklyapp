/**
 * ReservationTooltip - Tooltip mejorado para eventos de reserva
 *
 * Muestra información detallada de una reserva en hover
 * Usa Radix UI para mejor accesibilidad y UX
 */

"use client";

import { StatusBadge } from "@/components/atoms/StatusBadge";
import { Reservation } from "@/types/entities/reservation";
import * as Tooltip from "@radix-ui/react-tooltip";

interface ReservationTooltipProps {
  reservation: Reservation;
  children: React.ReactNode;
}

export function ReservationTooltip({
  reservation,
  children,
}: ReservationTooltipProps) {
  // Formatear fechas
  const startDate = new Date(reservation.startDate);
  const endDate = new Date(reservation.endDate);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="z-50 overflow-hidden rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            sideOffset={5}
          >
            <div className="flex flex-col gap-2 min-w-[280px] max-w-[320px]">
              {/* Header con título y estado */}
              <div className="flex items-center justify-between border-b border-gray-700 pb-2">
                <h4 className="font-semibold text-white text-sm">
                  {reservation.title || "Reserva"}
                </h4>
                <StatusBadge type="reservation" status={reservation.status} />
              </div>

              {/* Información principal */}
              <div className="space-y-1.5 text-xs">
                {/* Recurso */}
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 min-w-[70px]">Recurso:</span>
                  <span className="text-white font-medium">
                    {reservation.resourceName || "N/A"}
                  </span>
                </div>

                {/* Usuario */}
                {reservation.userId && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 min-w-[70px]">Usuario:</span>
                    <span className="text-white">{reservation.userName}</span>
                  </div>
                )}

                {/* Fecha y hora */}
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 min-w-[70px]">Fecha:</span>
                  <span className="text-white">{formatDate(startDate)}</span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-gray-400 min-w-[70px]">Horario:</span>
                  <span className="text-white">
                    {formatTime(startDate)} - {formatTime(endDate)}
                  </span>
                </div>

                {/* Propósito */}
                {reservation.description && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 min-w-[70px]">
                      Propósito:
                    </span>
                    <span className="text-white line-clamp-2">
                      {reservation.description}
                    </span>
                  </div>
                )}

                {/* Participantes */}
                {reservation.attendees && reservation.attendees > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 min-w-[70px]">
                      Asistentes:
                    </span>
                    <span className="text-white">
                      {reservation.attendees} persona(s)
                    </span>
                  </div>
                )}

                {/* Código de reserva */}
                {reservation.id && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 min-w-[70px]">Código:</span>
                    <span className="text-white font-mono text-xs">
                      {reservation.id}
                    </span>
                  </div>
                )}
              </div>

              {/* Footer con ID */}
              <div className="border-t border-gray-700 pt-2 text-[10px] text-gray-500 font-mono">
                ID: {reservation.id}
              </div>
            </div>
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
