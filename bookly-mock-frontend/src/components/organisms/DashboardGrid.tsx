import { BarChartCard } from "@/components/molecules/BarChartCard";
import { KPIGrid } from "@/components/molecules/KPIGrid";
import { LineChartCard } from "@/components/molecules/LineChartCard";
import type { DashboardData } from "@/types/entities/report";
import * as React from "react";

/**
 * DashboardGrid - Grid principal de dashboard con KPIs y gráficos
 *
 * Componente principal que muestra el dashboard de reportes con KPIs,
 * gráficos de tendencias y actividad reciente.
 *
 * @component
 */

export interface DashboardGridProps {
  dashboardData?: Partial<DashboardData> | Record<string, unknown>;
  loading?: boolean;
  className?: string;
}

export const DashboardGrid = React.memo<DashboardGridProps>(
  ({ dashboardData, loading = false, className = "" }) => {
    // Definimos el tipo esperado basado en el uso
    const data = dashboardData as {
      kpis?: any;
      trend?: Array<{ label?: string; date?: string; name?: string; value?: number; reservations?: number }>;
      topResources?: Array<{ name: string; usageCount?: number; reservations?: number }>;
      recentActivity?: Array<{
        id: string;
        type: string;
        title?: string;
        description?: string;
        timestamp?: string;
        at?: string;
      }>;
    };

    const kpis = data?.kpis;
    const trend = data?.trend || data?.topResources;
    const topResources = data?.topResources;
    const recentActivity = data?.recentActivity;

    return (
      <div className={`space-y-8 ${className}`}>
        {/* KPIs Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight">
              Métricas Clave
            </h2>
          </div>
          <KPIGrid kpis={kpis} loading={loading} />
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reservas por día */}
          <div className="bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-subtle)] shadow-sm overflow-hidden p-1">
            <LineChartCard
              data={
                trend?.map((point) => ({
                  name: point.label || point.date || point.name,
                  value: point.value || point.reservations,
                })) || []
              }
              xKey="name"
              yKey="value"
              title="Tendencia de Reservas (30 días)"
              color="var(--color-action-primary-default, #3b82f6)"
              height={320}
              showGrid
            />
          </div>

          {/* Recursos más usados */}
          <div className="bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border-subtle)] shadow-sm overflow-hidden p-1">
            <BarChartCard
              data={
                topResources?.map((res) => ({
                  name: res.name,
                  value: res.usageCount || res.reservations,
                })) || []
              }
              xKey="name"
              yKey="value"
              title="Recursos Más Usados"
              color="var(--color-state-success-border, #10b981)"
              height={320}
              horizontal
            />
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-6 tracking-tight">
            Actividad Reciente
          </h2>
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] shadow-sm rounded-xl overflow-hidden">
            {!recentActivity?.length && !loading ? (
              <div className="p-8 text-center text-[var(--color-text-secondary)]">
                <p>No hay actividades recientes para mostrar.</p>
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border-subtle)]">
                {(recentActivity || []).slice(0, 8).map((activity) => (
                  <div
                    key={activity.id}
                    className="p-5 hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-bg-elevated)]/40 transition-colors flex items-start justify-between group"
                  >
                    <div className="flex-1 flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--color-bg-muted)] text-lg">
                        {activity.type === "approval" ? "⚠" : activity.type === "reservation" ? "✓" : "ℹ"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-action-primary-default)] transition-colors">
                          {activity.title || activity.type}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1 leading-relaxed">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                    <time className="text-xs font-medium text-[var(--color-text-tertiary)] bg-[var(--color-bg-muted)] px-2.5 py-1 rounded-md ml-4 whitespace-nowrap">
                      {new Date(activity.timestamp || activity.at || new Date()).toLocaleString("es-ES", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }
);

DashboardGrid.displayName = "DashboardGrid";
