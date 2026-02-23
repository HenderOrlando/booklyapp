/**
 * ReservationStatsCards - Tarjetas de estadísticas de reservas
 *
 * Muestra métricas clave del sistema de reservas.
 * Alineado con el patrón de cards de categorías/recursos/programas.
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
                {t("total")}
              </p>
              <h3 className="text-3xl font-black text-brand-primary-800 dark:text-brand-primary-200 leading-none">
                {displayStats.total}
              </h3>
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
                {t("confirmed")}
              </p>
              <h3 className="text-3xl font-black text-state-success-900 dark:text-state-success-200 leading-none">
                {displayStats.confirmed}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pendientes */}
      <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-state-warning-500/5 to-state-warning-700/5 border-state-warning-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-state-warning-700/80 dark:text-state-warning-200/80 mb-1">
                {t("pending")}
              </p>
              <h3 className="text-3xl font-black text-state-warning-900 dark:text-state-warning-200 leading-none">
                {displayStats.pending}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canceladas */}
      <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-state-error-500/5 to-state-error-700/5 border-state-error-500/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-state-error-700/80 dark:text-state-error-200/80 mb-1">
                {t("cancelled")}
              </p>
              <h3 className="text-3xl font-black text-state-error-900 dark:text-state-error-200 leading-none">
                {displayStats.cancelled}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
