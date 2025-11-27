import { StatCard } from "@/components/atoms/StatCard";
import { LineChartCard } from "@/components/molecules/LineChartCard";
import { Calendar } from "lucide-react";
import * as React from "react";

export interface PeriodData {
  label: string;
  data: Array<{ name: string; value: number }>;
  stats: {
    total: number;
    average: number;
    peak: number;
  };
}

export interface PeriodComparisonProps {
  period1: PeriodData;
  period2: PeriodData;
  metric: string;
  className?: string;
}

export const PeriodComparison = React.memo<PeriodComparisonProps>(
  ({ period1, period2, metric, className = "" }) => {
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return 0;
      return ((current - previous) / previous) * 100;
    };

    const totalChange = calculateChange(
      period1.stats.total,
      period2.stats.total
    );
    const averageChange = calculateChange(
      period1.stats.average,
      period2.stats.average
    );
    const peakChange = calculateChange(period1.stats.peak, period2.stats.peak);

    // Combinar datos para gráfico comparativo
    const combinedData = period1.data.map((item, index) => ({
      name: item.name,
      [period1.label]: item.value,
      [period2.label]: period2.data[index]?.value || 0,
    }));

    return (
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex items-center gap-3">
          <Calendar className="h-6 w-6 text-[var(--color-primary-base)]" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Comparación de Períodos
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {period1.label} vs {period2.label}
            </p>
          </div>
        </div>

        {/* Stats Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title={`Total ${metric}`}
            value={period1.stats.total}
            change={totalChange}
            trend={
              totalChange > 0 ? "up" : totalChange < 0 ? "down" : "neutral"
            }
            subtitle={`Anterior: ${period2.stats.total}`}
          />
          <StatCard
            title={`Promedio ${metric}`}
            value={period1.stats.average.toFixed(1)}
            change={averageChange}
            trend={
              averageChange > 0 ? "up" : averageChange < 0 ? "down" : "neutral"
            }
            subtitle={`Anterior: ${period2.stats.average.toFixed(1)}`}
          />
          <StatCard
            title={`Pico ${metric}`}
            value={period1.stats.peak}
            change={peakChange}
            trend={peakChange > 0 ? "up" : peakChange < 0 ? "down" : "neutral"}
            subtitle={`Anterior: ${period2.stats.peak}`}
          />
        </div>

        {/* Chart Comparison */}
        <LineChartCard
          data={combinedData}
          xKey="name"
          yKey={[period1.label, period2.label]}
          title={`Tendencia Comparativa: ${metric}`}
          color={["#3b82f6", "#10b981"]}
          height={350}
          showGrid
          showLegend
        />

        {/* Analysis Summary */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            Resumen del Análisis
          </h3>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
            <li>
              • El total {totalChange >= 0 ? "aumentó" : "disminuyó"} un{" "}
              <strong>{Math.abs(totalChange).toFixed(1)}%</strong>
            </li>
            <li>
              • El promedio {averageChange >= 0 ? "mejoró" : "empeoró"} un{" "}
              <strong>{Math.abs(averageChange).toFixed(1)}%</strong>
            </li>
            <li>
              • El pico {peakChange >= 0 ? "subió" : "bajó"} un{" "}
              <strong>{Math.abs(peakChange).toFixed(1)}%</strong>
            </li>
          </ul>
        </div>
      </div>
    );
  }
);

PeriodComparison.displayName = "PeriodComparison";
