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
    bg: "from-blue-500/10 to-blue-600/10",
    border: "border-blue-500/20",
    icon: "bg-blue-500/20",
    text: "text-blue-400",
  },
  green: {
    bg: "from-green-500/10 to-green-600/10",
    border: "border-green-500/20",
    icon: "bg-green-500/20",
    text: "text-green-400",
  },
  purple: {
    bg: "from-purple-500/10 to-purple-600/10",
    border: "border-purple-500/20",
    icon: "bg-purple-500/20",
    text: "text-purple-400",
  },
  orange: {
    bg: "from-orange-500/10 to-orange-600/10",
    border: "border-orange-500/20",
    icon: "bg-orange-500/20",
    text: "text-orange-400",
  },
  red: {
    bg: "from-red-500/10 to-red-600/10",
    border: "border-red-500/20",
    icon: "bg-red-500/20",
    text: "text-red-400",
  },
  indigo: {
    bg: "from-indigo-500/10 to-indigo-600/10",
    border: "border-indigo-500/20",
    icon: "bg-indigo-500/20",
    text: "text-indigo-400",
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
    <Card className={`bg-gradient-to-br ${colors.bg} ${colors.border}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-400 mb-2">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold text-white">{value}</h3>
              {trend && (
                <span
                  className={`text-sm font-medium ${
                    trend.isPositive ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
            {trend?.label && (
              <p className="text-xs text-gray-500 mt-1">{trend.label}</p>
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
