/**
 * ReservationStatsCards - Tarjetas de estadísticas de reservas
 *
 * Muestra métricas clave del sistema de reservas.
 * Calcula estadísticas client-side a partir del array de reservas cargado,
 * siguiendo el mismo patrón de ResourceStatsCards.
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

  const stats = React.useMemo(() => {
    const total = reservations.length;
    const pending = reservations.filter((r) => r.status === "PENDING").length;
    const confirmed = reservations.filter((r) => r.status === "CONFIRMED" || r.status === "APPROVED").length;
    const cancelled = reservations.filter((r) => r.status === "CANCELLED").length;
    const completed = reservations.filter((r) => r.status === "COMPLETED").length;
    const active = reservations.filter(
      (r) => r.status === "ACTIVE" || r.status === "CHECKED_IN",
    ).length;

    return { total, pending, confirmed, cancelled, completed, active };
  }, [reservations]);

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
                {stats.total}
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
                {stats.confirmed}
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
                {stats.pending}
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
                {stats.cancelled}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
