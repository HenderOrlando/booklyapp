import * as React from "react";

/**
 * ChartTooltip - Tooltip personalizado para gráficos de Recharts
 *
 * @component
 * @example
 * ```tsx
 * <LineChart>
 *   <Tooltip content={<ChartTooltip formatter={(value) => `${value} hrs`} />} />
 * </LineChart>
 * ```
 */

export interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatter?: (value: any, name?: string) => string;
  labelFormatter?: (label: string) => string;
  className?: string;
}

export const ChartTooltip = React.memo<ChartTooltipProps>(
  ({ active, payload, label, formatter, labelFormatter, className = "" }) => {
    if (!active || !payload || payload.length === 0) {
      return null;
    }

    return (
      <div
        className={`
          bg-white dark:bg-gray-800 
          border border-gray-200 dark:border-gray-700 
          rounded-lg shadow-lg 
          p-3
          ${className}
        `}
      >
        {/* Label */}
        {label && (
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            {labelFormatter ? labelFormatter(label) : label}
          </p>
        )}

        {/* Payload items */}
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div
              key={`tooltip-item-${index}`}
              className="flex items-center gap-2 text-sm"
            >
              {/* Color indicator */}
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />

              {/* Name */}
              <span className="text-gray-600 dark:text-gray-400">
                {entry.name}:
              </span>

              {/* Value */}
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {formatter ? formatter(entry.value, entry.name) : entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

ChartTooltip.displayName = "ChartTooltip";
