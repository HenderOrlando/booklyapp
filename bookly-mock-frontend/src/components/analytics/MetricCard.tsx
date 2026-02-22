/**
 * MetricCard - Tarjeta de métrica avanzada con tendencias
 *
 * Componente reutilizable para mostrar KPIs con estilos modernos
 */

import { Card, CardContent } from "@/components/atoms/Card";
import * as React from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  color?: "blue" | "green" | "purple" | "orange" | "red" | "indigo";
  loading?: boolean;
}

const colorClasses = {
  blue: {
    bg: "bg-[var(--color-state-info-bg)]",
    border: "border-[var(--color-state-info-border)]",
    icon: "bg-[var(--color-state-info-bg)]",
    text: "text-[var(--color-state-info-text)]",
  },
  green: {
    bg: "bg-[var(--color-state-success-bg)]",
    border: "border-[var(--color-state-success-border)]",
    icon: "bg-[var(--color-state-success-bg)]",
    text: "text-[var(--color-state-success-text)]",
  },
  purple: {
    bg: "bg-[var(--color-state-info-bg)]",
    border: "border-[var(--color-state-info-border)]",
    icon: "bg-[var(--color-state-info-bg)]",
    text: "text-[var(--color-state-info-text)]",
  },
  orange: {
    bg: "bg-[var(--color-state-warning-bg)]",
    border: "border-[var(--color-state-warning-border)]",
    icon: "bg-[var(--color-state-warning-bg)]",
    text: "text-[var(--color-state-warning-text)]",
  },
  red: {
    bg: "bg-[var(--color-state-error-bg)]",
    border: "border-[var(--color-state-error-border)]",
    icon: "bg-[var(--color-state-error-bg)]",
    text: "text-[var(--color-state-error-text)]",
  },
  indigo: {
    bg: "bg-[var(--color-state-info-bg)]",
    border: "border-[var(--color-state-info-border)]",
    icon: "bg-[var(--color-state-info-bg)]",
    text: "text-[var(--color-state-info-text)]",
  },
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "blue",
  loading = false,
}: MetricCardProps) {
  const colors = colorClasses[color];

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-20 bg-[var(--color-bg-elevated)] rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border ${colors.bg} ${colors.border}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-foreground">{value}</h3>
              {trend && (
                <span
                  className={`text-sm font-medium ${
                    trend.isPositive
                      ? "text-[var(--color-state-success-text)]"
                      : "text-[var(--color-state-error-text)]"
                  }`}
                >
                  {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
            {trend?.label && (
              <p className="text-xs text-muted-foreground mt-1">
                {trend.label}
              </p>
            )}
          </div>
          {icon && (
            <div
              className={`w-12 h-12 ${colors.icon} rounded-full flex items-center justify-center ${colors.text}`}
            >
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
