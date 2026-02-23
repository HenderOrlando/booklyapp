"use client";

import { VigilancePanel } from "@/components/organisms/VigilancePanel";
import { ApprovalsClient } from "@/infrastructure/api/approvals-client";
import { MonitoringClient } from "@/infrastructure/api/monitoring-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

/**
 * Página de Vigilancia - /vigilancia
 *
 * Panel de control en tiempo real para personal de vigilancia.
 * Muestra reservas activas, con retraso y alertas.
 * Implementa RF-23 (Pantalla de vigilancia).
 */

export default function VigilanciaPage() {
  const t = useTranslations("vigilance");
  const [autoRefresh, setAutoRefresh] = React.useState(true);
  const queryClient = useQueryClient();

  // Query para datos de vigilancia (Dashboard unificado)
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["vigilance-data"],
    queryFn: async () => {
      const [activeRes, overdueRes, statsRes, alertsRes, approvalsRes] = await Promise.all([
        MonitoringClient.getActiveCheckIns(),
        MonitoringClient.getOverdueCheckIns(),
        MonitoringClient.getStatistics(),
        MonitoringClient.getActiveAlerts(),
        ApprovalsClient.getActiveToday({ limit: 100 }), // Cargar aprobaciones de hoy
      ]);

      return {
        active: activeRes.data || [],
        overdue: overdueRes.data || [],
        stats: statsRes.data,
        alerts: alertsRes.data || [],
        todayApprovals: approvalsRes.data?.items || [],
      };
    },
    refetchInterval: autoRefresh ? 30000 : false,
    staleTime: 10000,
  });

  // Mutation para resolver alertas
  const resolveAlertMutation = useMutation({
    mutationFn: ({ alertId, resolution }: { alertId: string; resolution: string }) => 
      MonitoringClient.resolveIncident(alertId, resolution),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vigilance-data"] });
    },
  });

  const handleContact = (reservationId: string) => {
    console.log("Contactar reserva:", reservationId);
    // Simulación de contacto
    window.alert(`${t("contacting_user")}: ${reservationId}`);
  };

  const handleResolveAlert = (alertId: string) => {
    const resolution = window.prompt(t("enter_resolution"));
    if (resolution) {
      resolveAlertMutation.mutate({ alertId, resolution });
    }
  };

  const handleManualRefresh = () => {
    refetch();
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-primary-100 dark:bg-brand-primary-900/20 rounded-lg">
                <Shield className="h-6 w-6 text-brand-primary-600 dark:text-brand-primary-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                  {t("panel_title")}
                </h1>
                <p className="mt-1 text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  {t("panel_description")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle auto-refresh */}
            <label className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-[var(--color-border-primary)] text-[var(--color-primary-base)] focus:ring-[var(--color-primary-base)]"
              />
              {t("auto_refresh")}
            </label>

            {/* Manual refresh */}
            <button
              onClick={handleManualRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--color-primary-base)] rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              {t("refresh")}
            </button>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        {data?.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[var(--color-bg-primary)] dark:bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border-primary)] dark:border-[var(--color-border-primary)] p-4">
              <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                {t("active_now_stat")}
              </p>
              <p className="text-2xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                {data.active.length}
              </p>
            </div>
            <div className="bg-[var(--color-bg-primary)] dark:bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border-primary)] dark:border-[var(--color-border-primary)] p-4">
              <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                {t("check_ins_today_stat")}
              </p>
              <p className="text-2xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                {data.stats.totalCheckIns}
              </p>
            </div>
            <div className="bg-[var(--color-bg-primary)] dark:bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border-primary)] dark:border-[var(--color-border-primary)] p-4">
              <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                {t("delays_stat")}
              </p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {data.stats.lateCheckIns}
              </p>
            </div>
            <div className="bg-[var(--color-bg-primary)] dark:bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border-primary)] dark:border-[var(--color-border-primary)] p-4">
              <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                {t("absences_stat")}
              </p>
              <p className="text-2xl font-bold text-state-error-600 dark:text-state-error-400">
                {data.overdue.length}
              </p>
            </div>
          </div>
        )}

        {/* Panel principal */}
        {data && (
          <VigilancePanel
            activeReservations={data.active}
            overdueReservations={data.overdue}
            todayApprovals={data.todayApprovals}
            alerts={data.alerts}
            onContact={handleContact}
            onResolveAlert={handleResolveAlert}
            loading={isLoading}
          />
        )}

        {/* Última actualización */}
        <div className="text-center text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-text-tertiary)]">
          {t("last_updated")}{" "}
          {new Date().toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>
      </div>
    </>
  );
}
