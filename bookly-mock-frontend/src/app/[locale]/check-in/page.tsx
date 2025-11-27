"use client";

import { Badge } from "@/components/atoms/Badge";
import { QRCodeDisplay } from "@/components/atoms/QRCodeDisplay";
import { CheckInOutPanel } from "@/components/molecules/CheckInOutPanel";
import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar";
import { MainLayout } from "@/components/templates/MainLayout";
import {
  useCheckIn,
  useCheckOut,
  useMyCheckInHistory,
} from "@/hooks/useCheckIn";
import { useToast } from "@/hooks/useToast";
import type { CheckInOut } from "@/types/entities/checkInOut";
import { AlertCircle, Calendar, CheckCircle, Clock } from "lucide-react";
import * as React from "react";

/**
 * Página de Check-in - /check-in
 *
 * Vista para realizar check-in y check-out de reservas.
 * Implementa RF-26 (Check-in/out digital).
 * Integrado con backend mediante useCheckIn hooks.
 */

export default function CheckInPage() {
  const { showSuccess, showError } = useToast();
  const [selectedReservation, setSelectedReservation] = React.useState<
    string | null
  >(null);

  // Hooks de backend
  const { data: checkInHistory, isLoading } = useMyCheckInHistory();
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  // Procesar datos del historial para obtener reservas activas y próximas
  const userReservations = React.useMemo(() => {
    if (!checkInHistory) return [];

    return checkInHistory.map((item: CheckInOut) => {
      const startTime =
        typeof item.reservationStartTime === "string"
          ? item.reservationStartTime
          : item.reservationStartTime?.toISOString() ||
            new Date().toISOString();

      const endTime =
        typeof item.reservationEndTime === "string"
          ? item.reservationEndTime
          : item.reservationEndTime?.toISOString() || new Date().toISOString();

      // qrCode puede venir como campo extraído o desde metadata
      const qrCode = item.qrCode || item.metadata?.qrCode || "";

      return {
        reservationId: item.reservationId,
        resourceName: item.resourceName || "Recurso",
        resourceType: item.resourceType || "N/A",
        startTime,
        endTime,
        status:
          item.checkInTime && !item.checkOutTime
            ? ("CHECKED_IN" as const)
            : ("APPROVED" as const),
        qrCode,
        canCheckIn: !item.checkInTime,
        canCheckOut: !!item.checkInTime && !item.checkOutTime,
      };
    });
  }, [checkInHistory]);

  const handleCheckIn = (reservationId: string) => {
    checkInMutation.mutate(
      {
        reservationId,
        method: "MANUAL",
      },
      {
        onSuccess: () => {
          showSuccess(
            "Check-in exitoso",
            "Has realizado check-in correctamente"
          );
        },
        onError: (error: any) => {
          showError(
            "Error en check-in",
            error?.response?.data?.message || "No se pudo realizar el check-in"
          );
        },
      }
    );
  };

  const handleCheckOut = (reservationId: string) => {
    const checkInRecord = checkInHistory?.find(
      (item: CheckInOut) =>
        item.reservationId === reservationId && item.checkInTime
    );

    if (!checkInRecord?.id) {
      showError("Error", "No se encontró el registro de check-in");
      return;
    }

    checkOutMutation.mutate(
      {
        reservationId: checkInRecord.reservationId,
        checkInId: checkInRecord.id,
        method: "MANUAL",
      },
      {
        onSuccess: () => {
          showSuccess(
            "Check-out exitoso",
            "Has realizado check-out correctamente"
          );
        },
        onError: (error: any) => {
          showError(
            "Error en check-out",
            error?.response?.data?.message || "No se pudo realizar el check-out"
          );
        },
      }
    );
  };

  const activeReservation = userReservations?.find(
    (r: any) => r.status === "CHECKED_IN"
  );
  const upcomingReservations = userReservations?.filter(
    (r: any) => r.status === "APPROVED"
  );

  return (
    <MainLayout header={<AppHeader />} sidebar={<AppSidebar />}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Check-in / Check-out
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gestiona el acceso a tus reservas
              </p>
            </div>
          </div>
        </div>

        {/* Información */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
            ℹ️ Información Importante
          </h3>
          <ul className="space-y-1 text-blue-800 dark:text-blue-300">
            <li>
              • El check-in está disponible 15 minutos antes del horario de
              inicio
            </li>
            <li>• Debes realizar check-out al finalizar tu reserva</li>
            <li>
              • Puedes usar el código QR en vigilancia para validar el acceso
            </li>
            <li>
              • Si llegas tarde (más de 15 minutos), tu reserva puede ser
              cancelada
            </li>
          </ul>
        </div>

        {/* Reserva activa (con check-in) */}
        {activeReservation && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border-2 border-green-200 dark:border-green-800 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="success">Activa</Badge>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Check-in realizado
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {activeReservation.resourceName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {activeReservation.resourceType}
                </p>
              </div>
              <QRCodeDisplay value={activeReservation.qrCode} size={120} />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  {new Date(activeReservation.startTime).toLocaleTimeString(
                    "es-ES",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}{" "}
                  -{" "}
                  {new Date(activeReservation.endTime).toLocaleTimeString(
                    "es-ES",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  {new Date(activeReservation.startTime).toLocaleDateString(
                    "es-ES",
                    {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    }
                  )}
                </span>
              </div>
            </div>

            <CheckInOutPanel
              reservationId={activeReservation.reservationId}
              validation={{
                isValid: true,
                canCheckIn: activeReservation.canCheckIn,
                canCheckOut: activeReservation.canCheckOut,
                reason: activeReservation.canCheckIn
                  ? undefined
                  : "Ya realizaste check-in",
                requiresApproval: false,
                requiresVigilance: false,
                timeWindow: {
                  start: activeReservation.startTime,
                  end: activeReservation.endTime,
                  isWithinWindow: true,
                },
              }}
              onCheckIn={() => handleCheckIn(activeReservation.reservationId)}
              onCheckOut={() => handleCheckOut(activeReservation.reservationId)}
              qrCode={activeReservation.qrCode}
            />
          </div>
        )}

        {/* Próximas reservas */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Próximas Reservas
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary-base)]" />
            </div>
          ) : upcomingReservations && upcomingReservations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingReservations.map((reservation) => {
                const now = new Date();
                const start = new Date(reservation.startTime);
                const minutesUntilStart = Math.floor(
                  (start.getTime() - now.getTime()) / (1000 * 60)
                );
                const canCheckInNow =
                  minutesUntilStart <= 15 && minutesUntilStart >= -5;

                return (
                  <div
                    key={reservation.reservationId}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {reservation.resourceName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {reservation.resourceType}
                        </p>
                      </div>
                      {canCheckInNow ? (
                        <Badge variant="success">Disponible</Badge>
                      ) : (
                        <Badge variant="default">
                          En {minutesUntilStart}min
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Clock className="h-4 w-4 text-gray-500" />
                        {new Date(reservation.startTime).toLocaleTimeString(
                          "es-ES",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}{" "}
                        -{" "}
                        {new Date(reservation.endTime).toLocaleTimeString(
                          "es-ES",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        {new Date(reservation.startTime).toLocaleDateString(
                          "es-ES",
                          {
                            day: "numeric",
                            month: "long",
                          }
                        )}
                      </div>
                    </div>

                    <CheckInOutPanel
                      reservationId={reservation.reservationId}
                      validation={{
                        isValid: canCheckInNow,
                        canCheckIn: canCheckInNow,
                        canCheckOut: false,
                        reason: canCheckInNow
                          ? undefined
                          : `Disponible en ${minutesUntilStart} minutos`,
                        requiresApproval: false,
                        requiresVigilance: false,
                        timeWindow: {
                          start: reservation.startTime,
                          end: reservation.endTime,
                          isWithinWindow: canCheckInNow,
                        },
                      }}
                      onCheckIn={() => handleCheckIn(reservation.reservationId)}
                      onCheckOut={() =>
                        handleCheckOut(reservation.reservationId)
                      }
                      qrCode={reservation.qrCode}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                No tienes reservas próximas
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
