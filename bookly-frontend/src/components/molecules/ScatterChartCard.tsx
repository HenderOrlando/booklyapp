import { ChartTooltip } from "@/components/atoms/ChartTooltip";
import * as React from "react";
import {
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import type { ChartDataPoint } from "./LineChartCard";

export interface ScatterChartCardProps {
  data: ChartDataPoint[];
  xKey: string;
  yKey: string;
  zKey?: string;
  title?: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
  formatter?: (value: any) => string;
  className?: string;
}

export const ScatterChartCard = React.memo<ScatterChartCardProps>(
  ({
    data,
    xKey,
    yKey,
    zKey,
    title,
    color = "#3b82f6",
    height = 300,
    showGrid = true,
    formatter,
    className = "",
  }) => {
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
          <ScatterChart>
            {showGrid && (
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="text-[var(--color-text-inverse)] dark:text-[var(--color-text-primary)]"
              />
            )}

            <XAxis
              type="number"
              dataKey={xKey}
              name={xKey}
              stroke="currentColor"
              className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] text-xs"
            />

            <YAxis
              type="number"
              dataKey={yKey}
              name={yKey}
              stroke="currentColor"
              className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] text-xs"
              tickFormatter={formatter}
            />

            {zKey && <ZAxis type="number" dataKey={zKey} range={[50, 400]} />}

            <Tooltip
              content={<ChartTooltip formatter={formatter} />}
              cursor={{ strokeDasharray: "3 3" }}
            />

            <Legend />

            <Scatter name={title || "Datos"} data={data} fill={color} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

ScatterChartCard.displayName = "ScatterChartCard";
