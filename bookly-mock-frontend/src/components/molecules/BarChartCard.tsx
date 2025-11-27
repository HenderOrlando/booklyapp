import { ChartTooltip } from "@/components/atoms/ChartTooltip";
import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartDataPoint } from "./LineChartCard";

/**
 * BarChartCard - Gráfico de barras con Recharts
 *
 * Gráfico de barras responsivo con soporte para barras horizontales y apiladas.
 *
 * @component
 * @example
 * ```tsx
 * <BarChartCard
 *   data={resourceData}
 *   xKey="name"
 *   yKey="count"
 *   title="Recursos Más Usados"
 *   horizontal
 * />
 * ```
 */

export interface BarChartCardProps {
  data: ChartDataPoint[];
  xKey: string;
  yKey: string | string[]; // Puede ser una o múltiples barras
  title?: string;
  color?: string | string[];
  horizontal?: boolean;
  stacked?: boolean;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  formatter?: (value: any) => string;
  className?: string;
}

export const BarChartCard = React.memo<BarChartCardProps>(
  ({
    data,
    xKey,
    yKey,
    title,
    color = "#3b82f6",
    horizontal = false,
    stacked = false,
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
          bg-white dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700 
          rounded-lg p-6
          ${className}
        `}
      >
        {/* Title */}
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {title}
          </h3>
        )}

        {/* Chart */}
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"}>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-gray-200 dark:text-gray-700"
              />
            )}

            {horizontal ? (
              <>
                <XAxis
                  type="number"
                  stroke="currentColor"
                  className="text-gray-600 dark:text-gray-400 text-xs"
                  tickFormatter={formatter}
                />
                <YAxis
                  type="category"
                  dataKey={xKey}
                  stroke="currentColor"
                  className="text-gray-600 dark:text-gray-400 text-xs"
                  width={100}
                />
              </>
            ) : (
              <>
                <XAxis
                  dataKey={xKey}
                  stroke="currentColor"
                  className="text-gray-600 dark:text-gray-400 text-xs"
                />
                <YAxis
                  stroke="currentColor"
                  className="text-gray-600 dark:text-gray-400 text-xs"
                  tickFormatter={formatter}
                />
              </>
            )}

            <Tooltip content={<ChartTooltip formatter={formatter} />} />

            {showLegend && <Legend />}

            {yKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colors[index] || colors[0]}
                stackId={stacked ? "stack" : undefined}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

BarChartCard.displayName = "BarChartCard";
