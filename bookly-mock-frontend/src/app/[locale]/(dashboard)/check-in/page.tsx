"use client";

import { Badge } from "@/components/atoms/Badge";
import { QRCodeDisplay } from "@/components/atoms/QRCodeDisplay";
import { CheckInOutPanel } from "@/components/molecules/CheckInOutPanel";
import {
  useCheckIn,
  useCheckOut,
  useMyCheckInHistory,
  useUpcomingReservations,
} from "@/hooks/useCheckIn";
import { useToast } from "@/hooks/useToast";
import type { CheckInOut } from "@/types/entities/checkInOut";
import { AlertCircle, Calendar, CheckCircle, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

/**
 * Genera un valor QR significativo para check-in/check-out
 */
function generateQrValue(reservationId: string, action: "CHECK_IN" | "CHECK_OUT"): string {
  return JSON.stringify({
    reservationId,
    action,
    timestamp: new Date().toISOString(),
    version: "1.0",
  });
}

/**
 * Página de Check-in - /check-in
 *
 * Vista para realizar check-in y check-out de reservas.
 * Implementa RF-26 (Check-in/out digital).
 *
 * Fuentes de datos:
 * - useUpcomingReservations: reservas CONFIRMED del availability-service (candidatas para check-in)
 * - useMyCheckInHistory: registros de check-in del stockpile-service (activos para check-out)
 */

export default function CheckInPage() {
  const t = useTranslations("check_in");
  const { showSuccess, showError } = useToast();

  // Fuente 1: Reservas confirmadas del usuario (candidatas para check-in)
  const { data: upcomingReservations = [], isLoading: loadingReservations, error: reservationsError } = useUpcomingReservations();

  // Fuente 2: Historial de check-in (para encontrar check-ins activos sin check-out)
  const { data: checkInHistory = [], isLoading: loadingHistory, error: historyError } = useMyCheckInHistory();

  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const isLoading = loadingReservations || loadingHistory;
  const queryError = reservationsError || historyError;

  // Reservas activas: tienen check-in pero no check-out
  const activeCheckIns = React.useMemo(() => {
    return checkInHistory.filter(
      (item: CheckInOut) => item.checkInTime && !item.checkOutTime,
    );
  }, [checkInHistory]);

  // IDs de reservas que ya tienen check-in (para excluirlas de las candidatas)
  const checkedInReservationIds = React.useMemo(() => {
    return new Set(
      checkInHistory
        .filter((item: CheckInOut) => item.checkInTime)
        .map((item: CheckInOut) => item.reservationId),
    );
  }, [checkInHistory]);

  // Reservas candidatas para check-in: confirmadas y sin check-in previo
  const checkInCandidates = React.useMemo(() => {
    return upcomingReservations.filter(
      (r) => !checkedInReservationIds.has(r.id),
    );
  }, [upcomingReservations, checkedInReservationIds]);

  const handleCheckIn = (reservationId: string) => {
    checkInMutation.mutate(
      {
        reservationId,
        method: "MANUAL",
      },
      {
        onSuccess: () => {
          showSuccess(
            t("success_check_in_title"),
            t("success_check_in_desc"),
          );
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
          showError(
            t("error_check_in_title"),
            error?.response?.data?.message || t("error_check_in_desc"),
          );
        },
      },
    );
  };

  const handleCheckOut = (reservationId: string) => {
    const checkInRecord = checkInHistory.find(
      (item: CheckInOut) =>
        item.reservationId === reservationId && item.checkInTime,
    );

    if (!checkInRecord?.id) {
      showError(t("error") || "Error", t("error_no_check_in_record"));
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
            t("success_check_out_title"),
            t("success_check_out_desc"),
          );
        },
        onError: (error: Error & { response?: { data?: { message?: string } } }) => {
          showError(
            t("error_check_out_title"),
            error?.response?.data?.message ||
              t("error_check_out_desc"),
          );
        },
      },
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-primary-100 dark:bg-brand-primary-900/20 rounded-lg">
              <CheckCircle className="h-6 w-6 text-brand-primary-600 dark:text-brand-primary-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                {t("title")}
              </h1>
              <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mt-1">
                {t("description")}
              </p>
            </div>
          </div>
        </div>

        {/* Información */}
        <div className="bg-brand-primary-50 dark:bg-brand-primary-900/20 rounded-lg p-4 text-sm">
          <h3 className="font-semibold text-brand-primary-900 dark:text-brand-primary-200 mb-2">
            ℹ️ {t("info_title")}
          </h3>
          <ul className="space-y-1 text-brand-primary-800 dark:text-brand-primary-300">
            <li>• {t("info_check_in_window")}</li>
            <li>• {t("info_check_out_required")}</li>
            <li>• {t("info_qr_usage")}</li>
            <li>• {t("info_late_penalty")}</li>
          </ul>
        </div>

        {/* Error de carga */}
        {queryError && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {t("error_loading")}
              </p>
              <p className="text-xs text-red-600 dark:text-red-400 opacity-75 mt-1">
                {queryError.message}
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary-base)]" />
          </div>
        ) : (
          <>
            {/* Reservas activas: check-in realizado, pendiente de check-out */}
            {activeCheckIns.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
                  {t("status_active")} — Check-out
                </h2>
                {activeCheckIns.map((record) => {
                  const startTime =
                    typeof record.reservationStartTime === "string"
                      ? record.reservationStartTime
                      : record.reservationStartTime?.toISOString() || new Date().toISOString();
                  const endTime =
                    typeof record.reservationEndTime === "string"
                      ? record.reservationEndTime
                      : record.reservationEndTime?.toISOString() || new Date().toISOString();
                  const qrValue = record.qrCode || generateQrValue(record.reservationId, "CHECK_OUT");

                  return (
                    <div
                      key={record.id}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border-2 border-green-200 dark:border-green-800 p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="success">{t("status_active")}</Badge>
                            <span className="text-sm text-[var(--color-text-secondary)]">
                              {t("status_checked_in")}
                            </span>
                          </div>
                          <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                            {record.resourceName || t("resource")}
                          </h2>
                          <p className="text-[var(--color-text-secondary)]">
                            {record.resourceType || "N/A"}
                          </p>
                        </div>
                        <QRCodeDisplay value={qrValue} size={120} />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                          <span className="text-[var(--color-text-secondary)]">
                            {new Date(startTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                            {" - "}
                            {new Date(endTime).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                          <span className="text-[var(--color-text-secondary)]">
                            {new Date(startTime).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}
                          </span>
                        </div>
                      </div>

                      <CheckInOutPanel
                        reservationId={record.reservationId}
                        validation={{
                          isValid: true,
                          canCheckIn: false,
                          canCheckOut: true,
                          reason: t("already_checked_in"),
                          requiresApproval: false,
                          requiresVigilance: false,
                          timeWindow: { start: startTime, end: endTime, isWithinWindow: true },
                        }}
                        onCheckIn={() => handleCheckIn(record.reservationId)}
                        onCheckOut={() => handleCheckOut(record.reservationId)}
                        qrCode={qrValue}
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Próximas reservas: candidatas para check-in */}
            <div>
              <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">
                {t("upcoming_reservations")}
              </h2>

              {checkInCandidates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {checkInCandidates.map((reservation) => {
                    const now = new Date();
                    const start = new Date(reservation.startDate);
                    const minutesUntilStart = Math.floor(
                      (start.getTime() - now.getTime()) / (1000 * 60),
                    );
                    const canCheckInNow = minutesUntilStart <= 15 && minutesUntilStart >= -5;
                    const qrValue = generateQrValue(reservation.id, "CHECK_IN");

                    return (
                      <div
                        key={reservation.id}
                        className="bg-[var(--color-bg-primary)] dark:bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border-primary)] p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-[var(--color-text-primary)]">
                              {reservation.resourceName || t("resource")}
                            </h3>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                              {reservation.title || reservation.description || ""}
                            </p>
                          </div>
                          {canCheckInNow ? (
                            <Badge variant="success">{t("available")}</Badge>
                          ) : (
                            <Badge variant="default">
                              {t("starts_in", { minutes: minutesUntilStart })}
                            </Badge>
                          )}
                        </div>

                        {/* QR Code para check-in */}
                        <div className="flex justify-center my-4">
                          <QRCodeDisplay value={qrValue} size={140} />
                        </div>

                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                            <Clock className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                            {new Date(reservation.startDate).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                            {" - "}
                            {new Date(reservation.endDate).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                            <Calendar className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                            {new Date(reservation.startDate).toLocaleDateString("es-ES", { day: "numeric", month: "long" })}
                          </div>
                        </div>

                        <CheckInOutPanel
                          reservationId={reservation.id}
                          validation={{
                            isValid: canCheckInNow,
                            canCheckIn: canCheckInNow,
                            canCheckOut: false,
                            reason: canCheckInNow ? undefined : t("available_in", { minutes: minutesUntilStart }),
                            requiresApproval: false,
                            requiresVigilance: false,
                            timeWindow: {
                              start: reservation.startDate,
                              end: reservation.endDate,
                              isWithinWindow: canCheckInNow,
                            },
                          }}
                          onCheckIn={() => handleCheckIn(reservation.id)}
                          onCheckOut={() => handleCheckOut(reservation.id)}
                          qrCode={qrValue}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-[var(--color-bg-primary)] dark:bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border-primary)]">
                  <AlertCircle className="h-12 w-12 text-[var(--color-text-tertiary)] mx-auto mb-3" />
                  <p className="text-[var(--color-text-secondary)]">
                    {t("no_upcoming")}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
