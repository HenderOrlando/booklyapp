import { StatCard } from "@/components/atoms/StatCard";
import type { KPIs } from "@/types/entities/report";
import * as React from "react";

/**
 * KPIGrid - Grid de métricas clave (KPIs)
 *
 * Grid responsivo que muestra múltiples KPIs usando StatCards.
 *
 * @component
 * @example
 * ```tsx
 * <KPIGrid
 *   kpis={dashboardKPIs}
 *   loading={isLoading}
 * />
 * ```
 */

export interface KPIGridProps {
  kpis?: Partial<KPIs>;
  loading?: boolean;
  className?: string;
}

export const KPIGrid = React.memo<KPIGridProps>(
  ({ kpis, loading = false, className = "" }) => {
    // Configuración de KPIs con íconos y formatos
    const kpiConfig = [
      {
        key: "totalReservations",
        title: "Total Reservas",
        value: kpis?.totalReservations || 0,
        change: kpis?.comparedToPrevious?.reservations,
        icon: (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        ),
      },
      {
        key: "activeUsers",
        title: "Usuarios Activos",
        value: kpis?.activeUsers || 0,
        change: kpis?.comparedToPrevious?.users,
        icon: (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        ),
      },
      {
        key: "totalResources",
        title: "Recursos Totales",
        value: kpis?.totalResources || 0,
        icon: (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        ),
      },
      {
        key: "averageOccupancy",
        title: "Ocupación Promedio",
        value: kpis?.averageOccupancy
          ? `${kpis.averageOccupancy.toFixed(1)}%`
          : "0%",
        change: kpis?.comparedToPrevious?.occupancy,
        icon: (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        ),
      },
      {
        key: "satisfactionRate",
        title: "Tasa de Satisfacción",
        value: kpis?.satisfactionRate
          ? `${kpis.satisfactionRate.toFixed(1)}%`
          : "0%",
        icon: (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        ),
      },
      {
        key: "cancelRate",
        title: "Tasa de Cancelación",
        value: kpis?.cancelRate ? `${kpis.cancelRate.toFixed(1)}%` : "0%",
        trend: (kpis?.cancelRate && kpis.cancelRate > 10
          ? "down"
          : kpis?.cancelRate && kpis.cancelRate < 5
            ? "up"
            : "neutral") as "up" | "down" | "neutral",
        icon: (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ),
      },
    ];

    // Determinar tendencia basado en cambio
    const getTrend = (
      change: number | undefined
    ): "up" | "down" | "neutral" => {
      if (!change) return "neutral";
      return change > 0 ? "up" : change < 0 ? "down" : "neutral";
    };

    return (
      <div
        className={`
          grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
          ${className}
        `}
      >
        {kpiConfig.map((config) => (
          <StatCard
            key={config.key}
            title={config.title}
            value={config.value}
            change={config.change}
            trend={config.trend || getTrend(config.change)}
            icon={config.icon}
            loading={loading}
          />
        ))}
      </div>
    );
  }
);

KPIGrid.displayName = "KPIGrid";
