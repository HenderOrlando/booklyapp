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
      <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-brand-primary-500/5 to-brand-primary-600/5 border-brand-primary-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-primary-600/80 mb-1">
                {t("total") || "Total Reservas"}
              </p>
              <h3 className="text-3xl font-black text-brand-primary-800 dark:text-brand-primary-200 leading-none mt-2">
                {displayStats.total}
              </h3>
              <p className="text-[11px] font-medium text-brand-primary-600/70 mt-2 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-brand-primary-400" />
                {displayStats.active} {t("active") || "activas"}
              </p>
            </div>
            <div className="w-12 h-12 bg-brand-primary-500/10 text-brand-primary-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservas de hoy */}
      <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-purple-500/5 to-purple-600/5 border-purple-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700/80 dark:text-purple-200/80 mb-1">
                {t("today") || "Hoy"}
              </p>
              <h3 className="text-3xl font-black text-purple-900 dark:text-purple-200 leading-none mt-2">
                {displayStats.today}
              </h3>
              <p className="text-[11px] font-medium text-purple-700/70 dark:text-purple-200/70 mt-2 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-purple-500" />
                {displayStats.upcoming} {t("upcoming") || "próximas"}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 text-purple-700 dark:text-purple-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl">⏰</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmadas */}
      <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-state-success-500/5 to-state-success-700/5 border-state-success-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-state-success-700/80 dark:text-state-success-200/80 mb-1">
                {t("confirmed") || "Confirmadas"}
              </p>
              <h3 className="text-3xl font-black text-state-success-900 dark:text-state-success-200 leading-none mt-2">
                {displayStats.confirmed}
              </h3>
              <p className="text-[11px] font-medium text-state-success-700/70 dark:text-state-success-200/70 mt-2 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-state-success-500" />
                {displayStats.pending} {t("pending") || "pendientes"}
              </p>
            </div>
            <div className="w-12 h-12 bg-state-success-500/10 text-state-success-700 dark:text-state-success-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completadas */}
      <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-indigo-500/5 to-indigo-600/5 border-indigo-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700/80 dark:text-indigo-200/80 mb-1">
                {t("completed") || "Completadas"}
              </p>
              <h3 className="text-3xl font-black text-indigo-900 dark:text-indigo-200 leading-none mt-2">
                {displayStats.completed}
              </h3>
              <p className="text-[11px] font-medium text-indigo-700/70 dark:text-indigo-200/70 mt-2 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-indigo-500" />
                {displayStats.cancelled} {t("cancelled") || "canceladas"}
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-700 dark:text-indigo-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <span className="text-2xl">🎯</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
