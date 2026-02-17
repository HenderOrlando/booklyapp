/**
 * ReservationStatsCards - Tarjetas de estadísticas de reservas
 *
 * Muestra métricas clave del sistema de reservas
 */

import { Card, CardContent } from "@/components/atoms/Card";
import type { Reservation } from "@/types/entities/reservation";
import { useTranslations } from "next-intl";
import * as React from "react";

interface ReservationStatsCardsProps {
  reservations: Reservation[];
}

export function ReservationStatsCards({
  reservations,
}: ReservationStatsCardsProps) {
  const t = useTranslations("reservations.stats");

  // Calcular estadísticas
  const stats = React.useMemo(() => {
    const total = reservations.length;

    // Por estado
    const pending = reservations.filter((r) => r.status === "PENDING").length;
    const confirmed = reservations.filter(
      (r) => r.status === "CONFIRMED"
    ).length;
    const inProgress = reservations.filter(
      (r) => r.status === "IN_PROGRESS"
    ).length;
    const completed = reservations.filter(
      (r) => r.status === "COMPLETED"
    ).length;
    const cancelled = reservations.filter(
      (r) => r.status === "CANCELLED"
    ).length;

    // Reservas activas (pendientes, confirmadas, en progreso)
    const active = pending + confirmed + inProgress;

    // Próximas reservas (hoy y futuro)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = reservations.filter((r) => {
      const startDate = new Date(r.startDate);
      return (
        startDate >= today &&
        (r.status === "PENDING" || r.status === "CONFIRMED")
      );
    }).length;

    // Reservas de hoy
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const todayReservations = reservations.filter((r) => {
      const startDate = new Date(r.startDate);
      return startDate >= today && startDate <= todayEnd;
    }).length;

    return {
      total,
      pending,
      confirmed,
      inProgress,
      completed,
      cancelled,
      active,
      upcoming,
      today: todayReservations,
    };
  }, [reservations]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total reservas */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-tertiary)]">
                {t("total") || "Total Reservas"}
              </p>
              <h3 className="text-3xl font-bold text-white mt-2">
                {stats.total}
              </h3>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                {stats.active} {t("active") || "activas"}
              </p>
            </div>
            <div className="w-12 h-12 bg-brand-primary-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservas de hoy */}
      <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-tertiary)]">
                {t("today") || "Hoy"}
              </p>
              <h3 className="text-3xl font-bold text-white mt-2">
                {stats.today}
              </h3>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                {stats.upcoming} {t("upcoming") || "próximas"}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">⏰</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmadas */}
      <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-tertiary)]">
                {t("confirmed") || "Confirmadas"}
              </p>
              <h3 className="text-3xl font-bold text-white mt-2">
                {stats.confirmed}
              </h3>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                {stats.pending} {t("pending") || "pendientes"}
              </p>
            </div>
            <div className="w-12 h-12 bg-state-success-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completadas */}
      <Card className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/10 border-indigo-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-tertiary)]">
                {t("completed") || "Completadas"}
              </p>
              <h3 className="text-3xl font-bold text-white mt-2">
                {stats.completed}
              </h3>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                {stats.cancelled} {t("cancelled") || "canceladas"}
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
