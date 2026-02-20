import { BarChartCard } from "@/components/molecules/BarChartCard";
import { PieChartCard } from "@/components/molecules/PieChartCard";
import type { ResourceUtilization } from "@/types/entities/report";
import * as React from "react";

export interface ResourceUtilizationChartProps {
  data: ResourceUtilization[];
  loading?: boolean;
  className?: string;
}

export const ResourceUtilizationChart =
  React.memo<ResourceUtilizationChartProps>(
    ({ data, loading: _loading = false, className = "" }) => {
      const chartData = data.map((item) => ({
        name: item.resourceName,
        occupancy: item.occupancyRate,
        approved: item.approvedRequests,
        rejected: item.rejectedRequests,
      }));

      const statusData = data.flatMap((item) => [
        { name: "Aprobadas", value: item.approvedRequests },
        { name: "Rechazadas", value: item.rejectedRequests },
        { name: "Canceladas", value: item.cancelledRequests },
      ]);

      return (
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
          <BarChartCard
            data={chartData}
            xKey="name"
            yKey="occupancy"
            title="Tasa de Ocupación por Recurso"
            color="#3b82f6"
            height={350}
            formatter={(value) => `${value}%`}
          />
          <PieChartCard
            data={statusData}
            nameKey="name"
            valueKey="value"
            title="Distribución de Solicitudes"
            height={350}
            donut
          />
        </div>
      );
    }
  );

ResourceUtilizationChart.displayName = "ResourceUtilizationChart";
