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
} from "@/hooks/useDashboard";
import { useTranslations } from "next-intl";
import * as React from "react";

type RecentReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "REJECTED"
  | "UNKNOWN";

const DEFAULT_RESERVATION_STATUS: RecentReservationStatus = "CONFIRMED";

const RESERVATION_STATUS_LABEL_KEY: Record<RecentReservationStatus, string> = {
  PENDING: "status_pending",
  CONFIRMED: "status_confirmed",
  IN_PROGRESS: "status_in_progress",
  COMPLETED: "status_completed",
  CANCELLED: "status_cancelled",
  REJECTED: "status_rejected",
  UNKNOWN: "confirmed",
};

const RESERVATION_STATUS_CLASS: Record<RecentReservationStatus, string> = {
  PENDING:
    "bg-state-warning-100 text-state-warning-700 dark:bg-state-warning-900 dark:text-state-warning-200",
  CONFIRMED:
    "bg-state-success-100 text-state-success-700 dark:bg-state-success-900 dark:text-state-success-200",
  IN_PROGRESS:
    "bg-brand-primary-100 text-brand-primary-700 dark:bg-brand-primary-900 dark:text-brand-primary-200",
  COMPLETED:
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
  CANCELLED:
    "bg-state-error-100 text-state-error-700 dark:bg-state-error-900 dark:text-state-error-200",
  REJECTED:
    "bg-state-error-100 text-state-error-700 dark:bg-state-error-900 dark:text-state-error-200",
  UNKNOWN:
    "bg-state-success-100 text-state-success-700 dark:bg-state-success-900 dark:text-state-success-200",
};

function normalizeReservationStatus(value?: string): RecentReservationStatus {
  const normalized = String(value || DEFAULT_RESERVATION_STATUS).toUpperCase();

  if (
    normalized === "PENDING" ||
    normalized === "CONFIRMED" ||
    normalized === "IN_PROGRESS" ||
    normalized === "COMPLETED" ||
    normalized === "CANCELLED" ||
    normalized === "REJECTED"
  ) {
    return normalized;
  }

  return "UNKNOWN";
}

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
  const { data: metrics, isLoading: loadingMetrics } = useDashboardMetrics();
  const { data: upcomingReservations = [] } = useUpcomingReservations();

  const isLoading = loadingMetrics;

  const trendData = React.useMemo(() => metrics?.trend || [], [metrics?.trend]);

  const recentActivities = React.useMemo(
    () =>
      (metrics?.recentActivity || []).map((activity) => ({
        id: activity.id,
        title: activity.title,
        description: activity.description,
        timestamp: activity.timestamp,
        type:
          activity.type === "approval"
            ? ("warning" as const)
            : activity.type === "reservation"
              ? ("success" as const)
              : ("info" as const),
        icon: activity.icon,
      })),
    [metrics?.recentActivity],
  );

  const quickStatsData = React.useMemo(
    () => [
      {
        label: "Hoy",
        value: metrics?.todayReservations || 0,
        change: {
          value: Math.abs(metrics?.delta.totalReservationsPct || 0),
          isPositive: (metrics?.delta.totalReservationsPct || 0) >= 0,
        },
        icon: "📅",
      },
      {
        label: "Esta Semana",
        value: metrics?.weekReservations || 0,
        change: {
          value: Math.abs(metrics?.delta.activeReservationsPct || 0),
          isPositive: (metrics?.delta.activeReservationsPct || 0) >= 0,
        },
        icon: "📊",
      },
      {
        label: "Este Mes",
        value: metrics?.monthReservations || 0,
        change: {
          value: Math.abs(metrics?.delta.utilizationRatePct || 0),
          isPositive: (metrics?.delta.utilizationRatePct || 0) >= 0,
        },
        icon: "📈",
      },
      {
        label: "Satisfacción",
        value: `${Math.round(metrics?.satisfactionRate || 0)}%`,
        change: {
          value: Math.abs(metrics?.delta.satisfactionRatePct || 0),
          isPositive: (metrics?.delta.satisfactionRatePct || 0) >= 0,
        },
        icon: "⭐",
      },
    ],
    [
      metrics?.todayReservations,
      metrics?.weekReservations,
      metrics?.monthReservations,
      metrics?.satisfactionRate,
      metrics?.delta.totalReservationsPct,
      metrics?.delta.activeReservationsPct,
      metrics?.delta.utilizationRatePct,
      metrics?.delta.satisfactionRatePct,
    ],
  );

  const recentReservations = React.useMemo(() => {
    if ((metrics?.recentReservations || []).length > 0) {
      return (metrics?.recentReservations || []).map((reservation) => ({
        id: reservation.id,
        resourceName: reservation.resourceName,
        startAt: reservation.startAt,
        endAt: reservation.endAt,
        status: reservation.status,
      }));
    }

    return upcomingReservations.map((reservation) => ({
      id: reservation.id,
      resourceName: reservation.resourceName || t("resource"),
      startAt: reservation.startDate,
      endAt: reservation.endDate,
      status: String(reservation.status || "CONFIRMED"),
    }));
  }, [metrics?.recentReservations, upcomingReservations, t]);

  // Usar componentes compartidos de Header y Sidebar
  const header = <AppHeader title={t("title")} />;
  const sidebar = <AppSidebar />;

  return (
    <MainLayout header={header} sidebar={sidebar}>
      <DashboardLayout
        kpis={
          <>
            <KPICard
              title={t("active_reservations")}
              value={String(metrics?.activeReservations || 0)}
              description={t("total_this_month")}
              trend={{
                value: Math.abs(metrics?.delta.activeReservationsPct || 0),
                isPositive: (metrics?.delta.activeReservationsPct || 0) >= 0,
              }}
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
              value={String(metrics?.pendingApprovals || 0)}
              description={t("require_attention")}
              trend={{
                value: Math.abs(metrics?.delta.pendingApprovalsPct || 0),
                isPositive: (metrics?.delta.pendingApprovalsPct || 0) <= 0,
              }}
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
              trend={{
                value: Math.abs(metrics?.delta.utilizationRatePct || 0),
                isPositive: (metrics?.delta.utilizationRatePct || 0) >= 0,
              }}
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
              value={metrics?.activeReservations || 0}
              subtitle={`Del total de ${metrics?.totalReservations || 0} este mes`}
              trend={{
                value: Math.abs(metrics?.delta.activeReservationsPct || 0),
                isPositive: (metrics?.delta.activeReservationsPct || 0) >= 0,
                label: "vs semana anterior",
              }}
              icon={<span className="text-2xl">📅</span>}
              color="blue"
              loading={loadingMetrics}
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
              value={metrics?.pendingApprovals || 0}
              subtitle="Requieren atención"
              trend={{
                value: Math.abs(metrics?.delta.pendingApprovalsPct || 0),
                isPositive: (metrics?.delta.pendingApprovalsPct || 0) <= 0,
                label: "vs semana anterior",
              }}
              icon={<span className="text-2xl">⏰</span>}
              color="orange"
              loading={loadingMetrics}
            />
            <MetricCard
              title="Tasa de Uso"
              value={`${Math.round(metrics?.utilizationRate || 0)}%`}
              subtitle="Promedio mensual"
              trend={{
                value: Math.abs(metrics?.delta.utilizationRatePct || 0),
                isPositive: (metrics?.delta.utilizationRatePct || 0) >= 0,
              }}
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
                  <p className="text-[var(--color-text-tertiary)]">
                    {tCommon("loading")}
                  </p>
                ) : recentReservations.length === 0 ? (
                  <p className="text-[var(--color-text-tertiary)]">
                    {t("no_recent_reservations")}
                  </p>
                ) : (
                  recentReservations.slice(0, 3).map((reserva) => (
                    <div
                      key={reserva.id}
                      className="flex items-center justify-between py-2 border-b last:border-0 border-[var(--color-border-subtle)]"
                    >
                      <div>
                        <p className="font-medium text-[var(--color-text-primary)]">
                          {reserva.resourceName || t("resource")}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                          {new Date(reserva.startAt).toLocaleDateString()} •{" "}
                          {`${new Date(reserva.startAt).toLocaleTimeString()} - ${new Date(reserva.endAt).toLocaleTimeString()}`}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-md ${RESERVATION_STATUS_CLASS[normalizeReservationStatus(reserva.status)]}`}
                      >
                        {t(
                          RESERVATION_STATUS_LABEL_KEY[
                            normalizeReservationStatus(reserva.status)
                          ],
                        )}
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
                  <p className="text-[var(--color-text-tertiary)]">
                    {tCommon("loading")}
                  </p>
                ) : (metrics?.mostUsedResources || []).length === 0 ? (
                  <p className="text-[var(--color-text-tertiary)]">
                    {t("no_data")}
                  </p>
                ) : (
                  (metrics?.mostUsedResources || [])
                    .slice(0, 5)
                    .map((recurso) => (
                      <div key={recurso.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-[var(--color-text-primary)]">
                            {recurso.name}
                          </span>
                          <span className="text-sm text-[var(--color-text-secondary)]">
                            {recurso.usageCount} {t("reservations_count")}
                          </span>
                        </div>
                        <div className="w-full bg-[var(--color-bg-muted)] rounded-full h-2 dark:bg-[var(--color-bg-tertiary)]">
                          <div
                            className="bg-brand-primary-500 h-2 rounded-full"
                            style={{
                              width: `${recurso.share > 0 ? recurso.share : Math.min(100, (recurso.usageCount / 30) * 100)}%`,
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
