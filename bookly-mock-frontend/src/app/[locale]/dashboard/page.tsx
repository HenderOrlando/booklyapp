"use client";

import {
  ActivityTimeline,
  MetricCard,
  MetricsGrid,
  QuickStats,
  TrendChart,
} from "@/components/analytics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar";
import {
  DashboardLayout,
  KPICard,
} from "@/components/templates/DashboardLayout";
import { MainLayout } from "@/components/templates/MainLayout";
import {
  useDashboardMetrics,
  useUpcomingReservations,
  useUserStats,
} from "@/hooks/useDashboard";
import { useTranslations } from "next-intl";
import * as React from "react";

/**
 * Página de Dashboard - Bookly
 *
 * Usa MainLayout + DashboardLayout del sistema de diseño
 * Incluye: KPIs, gráficos, resúmenes
 */

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common");

  // React Query para datos del dashboard
  const { data: userStats, isLoading: loadingStats } = useUserStats();
  const { data: metrics, isLoading: loadingMetrics } = useDashboardMetrics();
  const { data: upcomingReservations = [] } = useUpcomingReservations();

  const isLoading = loadingStats || loadingMetrics;

  // Usar componentes compartidos de Header y Sidebar
  const header = <AppHeader title={t("title")} />;
  const sidebar = <AppSidebar />;

  // Mock data para gráficos y actividades
  const trendData = React.useMemo(() => {
    const days = 30;
    return Array.from({ length: days }, (_, i) => ({
      label: `${i + 1}`,
      value: Math.floor(Math.random() * 40) + 10 + i * 0.5,
    }));
  }, []);

  const recentActivities = React.useMemo(
    () => [
      {
        id: "1",
        title: "Nueva reserva confirmada",
        description: "Sala de juntas - Mañana 10:00 AM",
        timestamp: new Date(Date.now() - 5 * 60000),
        type: "success" as const,
        icon: "✓",
      },
      {
        id: "2",
        title: "Recurso liberado",
        description: "Proyector A disponible nuevamente",
        timestamp: new Date(Date.now() - 25 * 60000),
        type: "info" as const,
        icon: "ℹ",
      },
      {
        id: "3",
        title: "Aprobación pendiente",
        description: "Auditor io Principal - Requiere revisión",
        timestamp: new Date(Date.now() - 120 * 60000),
        type: "warning" as const,
        icon: "⚠",
      },
    ],
    []
  );

  const quickStatsData = React.useMemo(
    () => [
      {
        label: "Hoy",
        value: "12",
        change: { value: 20, isPositive: true },
        icon: "📅",
      },
      {
        label: "Esta Semana",
        value: "48",
        change: { value: 15, isPositive: true },
        icon: "📊",
      },
      {
        label: "Este Mes",
        value: "156",
        change: { value: 8, isPositive: true },
        icon: "📈",
      },
      {
        label: "Satisfacción",
        value: "94%",
        change: { value: 3, isPositive: true },
        icon: "⭐",
      },
    ],
    []
  );

  return (
    <MainLayout header={header} sidebar={sidebar}>
      <DashboardLayout
        kpis={
          <>
            <KPICard
              title={t("active_reservations")}
              value={String(userStats?.activeReservations || 0)}
              description={t("total_this_month")}
              trend={{ value: 12, isPositive: true }}
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              }
            />

            <KPICard
              title={t("available_resources")}
              value={String(metrics?.availableResources || 0)}
              description={t("of_total", {
                total: metrics?.totalResources || 0,
              })}
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              }
            />

            <KPICard
              title={t("pending_approvals")}
              value={String(userStats?.pendingApprovals || 0)}
              description={t("require_attention")}
              trend={{ value: 8, isPositive: false }}
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />

            <KPICard
              title={t("utilization_rate")}
              value={`${Math.round(metrics?.utilizationRate || 0)}%`}
              description={t("monthly_avg")}
              trend={{ value: 5, isPositive: true }}
              icon={
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              }
            />
          </>
        }
      >
        {/* Analytics Avanzados */}
        <div className="space-y-6">
          {/* Métricas en Grid */}
          <MetricsGrid columns={4} gap="md">
            <MetricCard
              title="Reservas Activas"
              value={userStats?.activeReservations || 0}
              subtitle="Del total de 156 este mes"
              trend={{
                value: 8,
                isPositive: false,
                label: "vs semana anterior",
              }}
              icon={<span className="text-2xl">📅</span>}
              color="blue"
              loading={loadingStats}
            />
            <MetricCard
              title="Recursos Disponibles"
              value={metrics?.availableResources || 0}
              subtitle={`De ${metrics?.totalResources || 0} totales`}
              icon={<span className="text-2xl">🏢</span>}
              color="green"
              loading={loadingMetrics}
            />
            <MetricCard
              title="Aprobaciones Pendientes"
              value={userStats?.pendingApprovals || 0}
              subtitle="Requieren atención"
              trend={{
                value: 8,
                isPositive: false,
                label: "vs semana anterior",
              }}
              icon={<span className="text-2xl">⏰</span>}
              color="orange"
              loading={loadingStats}
            />
            <MetricCard
              title="Tasa de Uso"
              value={`${Math.round(metrics?.utilizationRate || 0)}%`}
              subtitle="Promedio mensual"
              trend={{ value: 5, isPositive: true }}
              icon={<span className="text-2xl">📊</span>}
              color="purple"
              loading={loadingMetrics}
            />
          </MetricsGrid>

          {/* Estadísticas Rápidas */}
          <QuickStats
            title="Resumen de Reservas"
            stats={quickStatsData}
            columns={4}
          />

          {/* Grid de Gráficos y Actividad */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Gráfico de Tendencia */}
            <div className="lg:col-span-2">
              <TrendChart
                title="Tendencia de Reservas (Últimos 30 días)"
                data={trendData}
                color="#3b82f6"
                height={250}
                showGrid
              />
            </div>

            {/* Actividad Reciente */}
            <div>
              <ActivityTimeline
                title="Actividad Reciente"
                activities={recentActivities}
                maxItems={5}
              />
            </div>
          </div>
        </div>

        {/* Contenido del dashboard (original) */}
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          {/* Reservas Recientes */}
          <Card>
            <CardHeader>
              <CardTitle>{t("recent_reservations")}</CardTitle>
              <CardDescription>{t("recent_reservations_desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <p className="text-[var(--color-text-tertiary)]">{tCommon("loading")}</p>
                ) : upcomingReservations.length === 0 ? (
                  <p className="text-[var(--color-text-tertiary)]">{t("no_recent_reservations")}</p>
                ) : (
                  upcomingReservations
                    .slice(0, 3)
                    .map((reserva: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between py-2 border-b last:border-0 border-[var(--color-border-subtle)]"
                      >
                        <div>
                          <p className="font-medium text-[var(--color-text-primary)]">
                            {reserva.resourceName ||
                              reserva.recurso ||
                              t("resource")}
                          </p>
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            {reserva.fecha ||
                              new Date(
                                reserva.startTime
                              ).toLocaleDateString()}{" "}
                            •{" "}
                            {reserva.hora ||
                              `${new Date(reserva.startTime).toLocaleTimeString()} - ${new Date(reserva.endTime).toLocaleTimeString()}`}
                          </p>
                        </div>
                        <span className="px-2 py-1 text-xs rounded-md bg-state-success-100 text-state-success-700 dark:bg-state-success-900 dark:text-state-success-200">
                          {t("confirmed")}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recursos Más Usados */}
          <Card>
            <CardHeader>
              <CardTitle>{t("most_used_resources")}</CardTitle>
              <CardDescription>{t("most_used_desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <p className="text-[var(--color-text-tertiary)]">{tCommon("loading")}</p>
                ) : (metrics?.mostUsedResources || []).length === 0 ? (
                  <p className="text-[var(--color-text-tertiary)]">{t("no_data")}</p>
                ) : (
                  (metrics?.mostUsedResources || [])
                    .slice(0, 5)
                    .map((recurso: any, i: number) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-[var(--color-text-primary)]">
                            {recurso.name || recurso.nombre}
                          </span>
                          <span className="text-sm text-[var(--color-text-secondary)]">
                            {recurso.usageCount || recurso.reservas}{" "}
                            {t("reservations_count")}
                          </span>
                        </div>
                        <div className="w-full bg-[var(--color-bg-muted)] rounded-full h-2 dark:bg-[var(--color-bg-tertiary)]">
                          <div
                            className="bg-brand-primary-500 h-2 rounded-full"
                            style={{
                              width: `${recurso.porcentaje || Math.min(100, (recurso.usageCount / 30) * 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </MainLayout>
  );
}
