import { ChartTooltip } from "@/components/atoms/ChartTooltip";
import * as React from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { ChartDataPoint } from "./LineChartCard";

/**
 * PieChartCard - Gráfico circular con Recharts
 *
 * Gráfico circular (pie/donut) con colores personalizables.
 *
 * @component
 * @example
 * ```tsx
 * <PieChartCard
 *   data={categoryData}
 *   nameKey="category"
 *   valueKey="count"
 *   title="Distribución por Categoría"
 *   donut
 * />
 * ```
 */

export interface PieChartCardProps {
  data: ChartDataPoint[];
  nameKey: string;
  valueKey: string;
  title?: string;
  colors?: string[];
  donut?: boolean;
  height?: number;
  showLegend?: boolean;
  showLabels?: boolean;
  formatter?: (value: any) => string;
  className?: string;
}

// Colores por defecto
const DEFAULT_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
];

export const PieChartCard = React.memo<PieChartCardProps>(
  ({
    data,
    nameKey,
    valueKey,
    title,
    colors = DEFAULT_COLORS,
    donut = false,
    height = 300,
    showLegend = true,
    showLabels = true,
    formatter,
    className = "",
  }) => {
    // Renderizar etiqueta personalizada
    const renderLabel = (entry: any) => {
      if (!showLabels) return null;
      const percent = ((entry.value / entry.payload.total) * 100).toFixed(0);
      return `${percent}%`;
    };

    return (
      <div
        className={`
          bg-white dark:bg-[var(--color-bg-inverse)] 
          border border-[var(--color-border-subtle)] dark:border-[var(--color-border-strong)] 
          rounded-lg p-6
          ${className}
        `}
      >
        {/* Title */}
        {title && (
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)] mb-4">
            {title}
          </h3>
        )}

        {/* Chart */}
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              nameKey={nameKey}
              dataKey={valueKey}
              cx="50%"
              cy="50%"
              innerRadius={donut ? "60%" : 0}
              outerRadius="80%"
              label={showLabels ? renderLabel : false}
              labelLine={showLabels}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>

            <Tooltip content={<ChartTooltip formatter={formatter} />} />

            {showLegend && (
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-[var(--color-text-primary)] dark:text-[var(--color-text-tertiary)]">
                    {value}
                  </span>
                )}
              />
            )}
          </PieChart>
        </ResponsiveContainer>

        {/* Total (solo para donut) */}
        {donut && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-3xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)]">
              {data.reduce((sum, item) => sum + item[valueKey], 0)}
            </p>
            <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">Total</p>
          </div>
        )}
      </div>
    );
  }
);

PieChartCard.displayName = "PieChartCard";
