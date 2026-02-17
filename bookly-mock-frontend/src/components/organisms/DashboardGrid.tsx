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
 * @example
 * ```tsx
 * <DashboardGrid
 *   dashboardData={data}
 *   loading={isLoading}
 * />
 * ```
 */

export interface DashboardGridProps {
  dashboardData?: Partial<DashboardData>;
  loading?: boolean;
  className?: string;
}

export const DashboardGrid = React.memo<DashboardGridProps>(
  ({ dashboardData, loading = false, className = "" }) => {
    return (
      <div className={`space-y-6 ${className}`}>
        {/* KPIs Section */}
        <section>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)] mb-4">
            Métricas Clave
          </h2>
          <KPIGrid kpis={dashboardData?.kpis} loading={loading} />
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reservas por día */}
          <LineChartCard
            data={
              dashboardData?.topResources?.map((res) => ({
                name: res.name,
                value: res.reservations,
              })) || []
            }
            xKey="name"
            yKey="value"
            title="Tendencia de Reservas"
            color="#3b82f6"
            height={300}
            showGrid
          />

          {/* Recursos más usados */}
          <BarChartCard
            data={
              dashboardData?.topResources?.map((res) => ({
                name: res.name,
                value: res.reservations,
              })) || []
            }
            xKey="name"
            yKey="value"
            title="Recursos Más Usados"
            color="#10b981"
            height={300}
            horizontal
          />
        </section>

        {/* Recent Activity */}
        {dashboardData?.recentActivity &&
          dashboardData.recentActivity.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)] mb-4">
                Actividad Reciente
              </h2>
              <div className="bg-white dark:bg-[var(--color-bg-inverse)] border border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)] rounded-lg overflow-hidden">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {dashboardData.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-4 hover:bg-[var(--color-bg-secondary)] dark:hover:bg-[var(--color-bg-elevated)]/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]">
                            {activity.type}
                          </p>
                          <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mt-1">
                            {activity.description}
                          </p>
                        </div>
                        <time className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)] ml-4">
                          {new Date(activity.timestamp).toLocaleString(
                            "es-ES",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </time>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
      </div>
    );
  }
);

DashboardGrid.displayName = "DashboardGrid";
