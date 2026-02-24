import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import * as React from "react";

/**
 * StatCard - Organism Component
 *
 * Tarjeta para mostrar estadísticas/KPIs en el dashboard.
 * Incluye valor principal, descripción, icono y tendencia opcional.
 *
 * Design System:
 * - Usa Card base component
 * - Grid de 8px en spacing
 * - Tokens semánticos para colores
 * - Icono y tendencia opcionales
 * - Responsive
 *
 * @example
 * ```tsx
 * <StatCard
 *   title="Reservas Activas"
 *   value="45"
 *   description="Total este mes"
 *   trend={{ value: 12, isPositive: true }}
 *   icon={<CalendarIcon />}
 * />
 * ```
 */

export interface StatCardTrend {
  /** Valor de la tendencia (porcentaje) */
  value: number;
  /** Si la tendencia es positiva (verde) o negativa (roja) */
  isPositive: boolean;
}

export interface StatCardProps {
  /** Título de la estadística */
  title: string;
  /** Valor principal a mostrar */
  value: string | number;
  /** Descripción adicional */
  description?: string;
  /** Icono a mostrar */
  icon?: React.ReactNode;
  /** Tendencia (cambio porcentual) */
  trend?: StatCardTrend;
  /** Clase CSS adicional */
  className?: string;
  /** Callback al hacer click */
  onClick?: () => void;
}

export const StatCard = React.memo(function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className = "",
  onClick,
}: StatCardProps) {
  return (
    <Card
      className={`hover:shadow-lg transition-shadow ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[var(--color-text-secondary)]">
          {title}
        </CardTitle>
        {icon && (
          <div className="text-[var(--color-text-secondary)] opacity-70">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between gap-4">
          {/* Valor principal */}
          <div className="text-3xl font-bold text-[var(--color-text-primary)]">
            {value}
          </div>

          {/* Tendencia */}
          {trend && (
            <div
              className={`flex items-center text-sm font-medium ${
                trend.isPositive
                  ? "text-[var(--color-state-success-700)] dark:text-[var(--color-state-success-300)]"
                  : "text-[var(--color-state-error-700)] dark:text-[var(--color-state-error-300)]"
              }`}
            >
              {trend.isPositive ? (
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              )}
              {trend.value}%
            </div>
          )}
        </div>

        {/* Descripción */}
        {description && (
          <CardDescription className="mt-2">{description}</CardDescription>
        )}
      </CardContent>
    </Card>
  );
});
