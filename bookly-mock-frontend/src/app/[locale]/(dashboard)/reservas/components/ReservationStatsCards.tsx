/**
 * ReservationStatsCards - Tarjetas de estadísticas de reservas
 *
 * Muestra métricas clave del sistema de reservas
 */

import { Card, CardContent } from "@/components/atoms/Card";
import { useTranslations } from "next-intl";
import * as React from "react";

export interface ReservationStats {
  total: number;
  pending: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  active: number;
  upcoming: number;
  today: number;
}

interface ReservationStatsCardsProps {
  stats: ReservationStats | undefined;
}

export function ReservationStatsCards({
  stats,
}: ReservationStatsCardsProps) {
  const t = useTranslations("reservations.stats");

  // Si no hay stats, mostrar ceros
  const displayStats = stats || {
    total: 0,
    pending: 0,
    confirmed: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    active: 0,
    upcoming: 0,
    today: 0,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total reservas */}
      <Card className="bg-[var(--color-bg-surface)] border-l-4 border-l-brand-primary-500 shadow-sm border-[var(--color-border-subtle)]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-tertiary)]">
                {t("total") || "Total Reservas"}
              </p>
              <h3 className="text-3xl font-bold text-foreground mt-2">
                {displayStats.total}
              </h3>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                {displayStats.active} {t("active") || "activas"}
              </p>
            </div>
            <div className="w-12 h-12 bg-brand-primary-50 text-brand-primary-600 rounded-full flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservas de hoy */}
      <Card className="bg-[var(--color-bg-surface)] border-l-4 border-l-purple-500 shadow-sm border-[var(--color-border-subtle)]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-tertiary)]">
                {t("today") || "Hoy"}
              </p>
              <h3 className="text-3xl font-bold text-foreground mt-2">
                {displayStats.today}
              </h3>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                {displayStats.upcoming} {t("upcoming") || "próximas"}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
              <span className="text-2xl">⏰</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmadas */}
      <Card className="bg-[var(--color-bg-surface)] border-l-4 border-l-state-success-500 shadow-sm border-[var(--color-border-subtle)]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-tertiary)]">
                {t("confirmed") || "Confirmadas"}
              </p>
              <h3 className="text-3xl font-bold text-foreground mt-2">
                {displayStats.confirmed}
              </h3>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                {displayStats.pending} {t("pending") || "pendientes"}
              </p>
            </div>
            <div className="w-12 h-12 bg-state-success-50 text-state-success-600 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completadas */}
      <Card className="bg-[var(--color-bg-surface)] border-l-4 border-l-indigo-500 shadow-sm border-[var(--color-border-subtle)]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-tertiary)]">
                {t("completed") || "Completadas"}
              </p>
              <h3 className="text-3xl font-bold text-foreground mt-2">
                {displayStats.completed}
              </h3>
              <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                {displayStats.cancelled} {t("cancelled") || "canceladas"}
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
