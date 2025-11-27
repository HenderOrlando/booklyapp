/**
 * QuickStats - Panel de estadísticas rápidas compacto
 *
 * Ideal para mostrar múltiples métricas en poco espacio
 */

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";

interface QuickStat {
  label: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
  };
  icon?: string;
}

interface QuickStatsProps {
  title?: string;
  stats: QuickStat[];
  columns?: 2 | 3 | 4;
}

export function QuickStats({ title, stats, columns = 4 }: QuickStatsProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
  };

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className={`grid ${gridCols[columns]} gap-4`}>
          {stats.map((stat, index) => (
            <div
              key={index}
              className="p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800/70 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-xl font-bold text-white">{stat.value}</p>
                  {stat.change && (
                    <p
                      className={`text-xs font-medium mt-1 ${
                        stat.change.isPositive
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {stat.change.isPositive ? "↑" : "↓"}{" "}
                      {Math.abs(stat.change.value)}%
                    </p>
                  )}
                </div>
                {stat.icon && (
                  <span className="text-2xl opacity-50">{stat.icon}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
