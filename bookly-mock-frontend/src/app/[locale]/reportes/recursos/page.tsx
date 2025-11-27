"use client";

import { ReportFilters } from "@/components/molecules/ReportFilters";
import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar/AppSidebar";
import { ExportPanel } from "@/components/organisms/ExportPanel";
import { ResourceUtilizationChart } from "@/components/organisms/ResourceUtilizationChart";
import { MainLayout } from "@/components/templates/MainLayout";
import { useReportExport } from "@/hooks/useReportExport";
import { useReportFilters } from "@/hooks/useReportFilters";
import { mockResourceUtilization } from "@/infrastructure/mock/data";
import * as React from "react";

export default function ReportesRecursosPage() {
  const { filters, setFilters } = useReportFilters();
  const { exportReport } = useReportExport();
  const [resourceData] = React.useState(mockResourceUtilization);

  const handleExport = (format: "csv" | "excel" | "pdf", options: any) => {
    exportReport({ format, data: resourceData, filename: "recursos" });
  };

  return (
    <MainLayout header={<AppHeader />} sidebar={<AppSidebar />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Reportes por Recurso
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Análisis detallado de utilización y ocupación de recursos
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
              title="Exportar Reporte de Recursos"
              availableFormats={["csv", "excel", "pdf"]}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
