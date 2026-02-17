import { ChartTooltip } from "@/components/atoms/ChartTooltip";
import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartDataPoint } from "./LineChartCard";

export interface AreaChartCardProps {
  data: ChartDataPoint[];
  xKey: string;
  yKey: string | string[];
  title?: string;
  color?: string | string[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
  formatter?: (value: any) => string;
  className?: string;
}

export const AreaChartCard = React.memo<AreaChartCardProps>(
  ({
    data,
    xKey,
    yKey,
    title,
    color = "#3b82f6",
    height = 300,
    showGrid = true,
    showLegend = false,
    stacked = false,
    formatter,
    className = "",
  }) => {
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
        {title && (
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-inverse)] mb-4">
            {title}
          </h3>
        )}

        <ResponsiveContainer width="100%" height={height}>
          <AreaChart data={data}>
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
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index] || colors[0]}
                fill={colors[index] || colors[0]}
                fillOpacity={0.3}
                stackId={stacked ? "stack" : undefined}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

AreaChartCard.displayName = "AreaChartCard";
