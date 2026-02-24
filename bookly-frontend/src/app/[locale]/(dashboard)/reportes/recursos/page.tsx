"use client";

import { ReportPageLayout } from "@/components/templates/ReportPageLayout";
import { ResourceUtilizationChart } from "@/components/organisms/ResourceUtilizationChart";
import { useReportByResource } from "@/hooks/useReportData";
import { useReportExport } from "@/hooks/useReportExport";
import { useReportFilters } from "@/hooks/useReportFilters";
import { mockResourceUtilization } from "@/infrastructure/mock/data";
import type { ResourceUtilization } from "@/types/entities/report";
import { BarChart3, Percent, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ReportesRecursosPage() {
  const t = useTranslations("reports");
  const { filters, setFilters } = useReportFilters();
  const { exportReport } = useReportExport();
  const { data: serverData, isLoading, error } = useReportByResource(filters);
  const resourceData: ResourceUtilization[] =
    Array.isArray(serverData) && serverData.length > 0
      ? (serverData as ResourceUtilization[])
      : mockResourceUtilization;

  const avgOccupancy =
    resourceData.length > 0
      ? (
          resourceData.reduce((sum, r) => sum + r.occupancyRate, 0) /
          resourceData.length
        ).toFixed(1)
      : "0.0";
  const totalRequests = resourceData.reduce(
    (sum, r) => sum + r.totalRequests,
    0,
  );

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    exportReport({ format, data: resourceData, filename: "reporte-recursos" });
  };

  return (
    <ReportPageLayout
      title={t("resources_title")}
      description={t("resources_desc")}
      filters={filters}
      onFiltersChange={setFilters}
      onExport={handleExport}
      exportTitle={t("export_resources_title")}
      loading={isLoading}
      error={error ? String(error) : null}
      isEmpty={resourceData.length === 0}
      kpiColumns={3}
      kpis={[
        {
          label: t("total_resources"),
          value: resourceData.length,
          icon: <BarChart3 className="h-5 w-5 text-[var(--color-action-primary)]" />,
          iconBgClass: "bg-[var(--color-action-primary)]/10",
        },
        {
          label: t("avg_occupancy"),
          value: `${avgOccupancy}%`,
          icon: <Percent className="h-5 w-5 text-[var(--color-action-secondary)]" />,
          iconBgClass: "bg-[var(--color-action-secondary)]/10",
        },
        {
          label: t("total_requests"),
          value: totalRequests,
          icon: <TrendingUp className="h-5 w-5 text-[var(--color-state-success-text)]" />,
          iconBgClass: "bg-[var(--color-state-success-bg)]",
        },
      ]}
    >
      <ResourceUtilizationChart data={resourceData} />
    </ReportPageLayout>
  );
}
