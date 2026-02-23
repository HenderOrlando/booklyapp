"use client";

import { ReportFilters } from "@/components/molecules/ReportFilters";
import { ExportPanel } from "@/components/organisms/ExportPanel";
import { ResourceUtilizationChart } from "@/components/organisms/ResourceUtilizationChart";
import { useReportByResource } from "@/hooks/useReportData";
import { useReportExport } from "@/hooks/useReportExport";
import { useReportFilters } from "@/hooks/useReportFilters";
import { mockResourceUtilization } from "@/infrastructure/mock/data";
import type { ResourceUtilization } from "@/types/entities/report";
import { useTranslations } from "next-intl";

export default function ReportesRecursosPage() {
  const t = useTranslations("reports");
  const { filters, setFilters } = useReportFilters();
  const { exportReport } = useReportExport();
  const { data: serverData } = useReportByResource();
  const resourceData: ResourceUtilization[] =
    (serverData as ResourceUtilization[]) &&
    (serverData as ResourceUtilization[]).length > 0
      ? (serverData as ResourceUtilization[])
      : mockResourceUtilization;

  const handleExport = (format: "csv" | "excel" | "pdf", _options: any) => {
    exportReport({ format, data: resourceData, filename: "recursos" });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
              {t("resources_title")}
            </h1>
            <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mt-1">
              {t("resources_desc")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ReportFilters
              filters={filters}
              onFiltersChange={setFilters}
              categories={[]}
              programs={[]}
              showDateRange
            />

            <ResourceUtilizationChart data={resourceData} />
          </div>

          <div>
            <ExportPanel
              onExport={handleExport}
              title={t("export_resources_title")}
              availableFormats={["csv", "excel", "pdf"]}
            />
          </div>
        </div>
      </div>
    </>
  );
}
