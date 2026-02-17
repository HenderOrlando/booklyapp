import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import * as React from "react";

/**
 * StatCard - Tarjeta de estadística con KPI
 *
 * Muestra un valor clave con tendencia, cambio porcentual e ícono opcional.
 *
 * @component
 * @example
 * ```tsx
 * <StatCard
 *   title="Total Reservas"
 *   value="1,234"
 *   change={12.5}
 *   trend="up"
 *   icon={<Calendar className="h-6 w-6" />}
 * />
 * ```
 */

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: "up" | "down" | "neutral";
  icon?: React.ReactNode;
  loading?: boolean;
  subtitle?: string;
  className?: string;
}

export const StatCard = React.memo<StatCardProps>(
  ({
    title,
    value,
    change,
    trend = "neutral",
    icon,
    loading = false,
    subtitle,
    className = "",
  }) => {
    // Determinar color según tendencia
    const trendColors = {
      up: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20",
      down: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
      neutral: "text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] bg-[var(--color-bg-secondary)] dark:bg-[var(--color-bg-inverse)]",
    };

    // Icono de tendencia
    const TrendIcon =
      trend === "up" ? ArrowUp : trend === "down" ? ArrowDown : Minus;

    if (loading) {
      return (
        <div
          className={`
            bg-white dark:bg-[var(--color-bg-inverse)] 
            border border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)] 
            rounded-lg p-6 
            animate-pulse
            ${className}
          `}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-4 bg-[var(--color-bg-muted)] dark:bg-[var(--color-bg-elevated)] rounded w-24 mb-3" />
              <div className="h-8 bg-[var(--color-bg-muted)] dark:bg-[var(--color-bg-elevated)] rounded w-32" />
            </div>
            <div className="w-12 h-12 bg-[var(--color-bg-muted)] dark:bg-[var(--color-bg-elevated)] rounded-lg" />
          </div>
        </div>
      );
    }

    return (
      <div
        className={`
          bg-white dark:bg-[var(--color-bg-inverse)] 
          border border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)] 
          rounded-lg p-6 
          transition-all duration-200
          hover:shadow-md
          ${className}
        `}
      >
        <div className="flex items-start justify-between">
          {/* Content */}
          <div className="flex-1">
            {/* Title */}
            <p className="text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-1">
              {title}
            </p>

            {/* Value */}
            <p className="text-3xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)] mb-2">
              {value}
            </p>

            {/* Subtitle or Change */}
            {subtitle ? (
              <p className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)]">
                {subtitle}
              </p>
            ) : (
              change !== undefined && (
                <div className="flex items-center gap-1">
                  <span
                    className={`
                      inline-flex items-center gap-1 
                      px-2 py-1 
                      rounded-full 
                      text-xs font-medium
                      ${trendColors[trend]}
                    `}
                  >
                    <TrendIcon className="h-3 w-3" />
                    {Math.abs(change)}%
                  </span>
                  <span className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-text-secondary)]">
                    vs período anterior
                  </span>
                </div>
              )
            )}
          </div>

          {/* Icon */}
          {icon && (
            <div
              className="
                w-12 h-12 
                rounded-lg 
                bg-[var(--color-primary-base)]/10 
                flex items-center justify-center
                text-[var(--color-primary-base)]
              "
            >
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }
);

StatCard.displayName = "StatCard";
