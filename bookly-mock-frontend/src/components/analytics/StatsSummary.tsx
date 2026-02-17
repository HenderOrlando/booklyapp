/**
 * StatsSummary - Resumen de estadísticas con comparaciones
 *
 * Muestra comparaciones entre períodos con visualización de cambios
 */

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";

interface StatItem {
  label: string;
  value: number;
  previousValue?: number;
  format?: "number" | "percentage" | "currency" | "duration";
}

interface StatsSummaryProps {
  title: string;
  stats: StatItem[];
  period?: string;
  previousPeriod?: string;
}

export function StatsSummary({
  title,
  stats,
  period = "Este mes",
  previousPeriod = "Mes anterior",
}: StatsSummaryProps) {
  function formatValue(
    value: number,
    format: StatItem["format"] = "number",
  ): string {
    switch (format) {
      case "percentage":
        return `${value.toFixed(1)}%`;
      case "currency":
        return `$${value.toLocaleString()}`;
      case "duration":
        return `${value}h`;
      default:
        return value.toLocaleString();
    }
  }

  function calculateChange(
    current: number,
    previous: number,
  ): {
    value: number;
    isPositive: boolean;
  } {
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      isPositive: change >= 0,
    };
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{period}</span>
          {previousPeriod && (
            <span className="text-muted-foreground/60">
              vs {previousPeriod}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.map((stat, index) => {
            const hasComparison = stat.previousValue !== undefined;
            const change = hasComparison
              ? calculateChange(stat.value, stat.previousValue!)
              : null;

            return (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-2xl font-bold text-foreground">
                      {formatValue(stat.value, stat.format)}
                    </p>
                    {change && (
                      <span
                        className={`text-sm font-medium ${
                          change.isPositive ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {change.isPositive ? "↑" : "↓"}{" "}
                        {change.value.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
                {hasComparison && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Anterior</p>
                    <p className="text-sm text-muted-foreground">
                      {formatValue(stat.previousValue!, stat.format)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
