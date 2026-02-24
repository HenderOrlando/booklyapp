import { ChartTooltip } from "@/components/atoms/ChartTooltip";
import * as React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * LineChartCard - Gráfico de líneas con Recharts
 *
 * Gráfico de líneas responsivo con configuración personalizable.
 *
 * @component
 * @example
 * ```tsx
 * <LineChartCard
 *   data={usageData}
 *   xKey="date"
 *   yKey="hours"
 *   title="Uso por Día"
 *   color="#3b82f6"
 * />
 * ```
 */

export interface ChartDataPoint {
  [key: string]: any;
}

export interface LineChartCardProps {
  data: ChartDataPoint[];
  xKey: string;
  yKey: string | string[]; // Puede ser una o múltiples líneas
  title?: string;
  color?: string | string[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  formatter?: (value: any) => string;
  className?: string;
}

export const LineChartCard = React.memo<LineChartCardProps>(
  ({
    data,
    xKey,
    yKey,
    title,
    color = "#3b82f6",
    height = 300,
    showGrid = true,
    showLegend = false,
    formatter,
    className = "",
  }) => {
    // Normalizar yKey a array
    const yKeys = Array.isArray(yKey) ? yKey : [yKey];
    const colors = Array.isArray(color) ? color : [color];

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
          <LineChart data={data}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-[var(--color-text-inverse)] dark:text-[var(--color-text-primary)]"
              />
            )}

            <XAxis
              dataKey={xKey}
              stroke="currentColor"
              className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] text-xs"
            />

            <YAxis
              stroke="currentColor"
              className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] text-xs"
              tickFormatter={formatter}
            />

            <Tooltip content={<ChartTooltip formatter={formatter} />} />

            {showLegend && <Legend />}

            {yKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index] || colors[0]}
                strokeWidth={2}
                dot={{ fill: colors[index] || colors[0], r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

LineChartCard.displayName = "LineChartCard";
