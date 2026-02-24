"use client";

import { ReportFilters } from "@/components/molecules/ReportFilters";
import { DashboardGrid } from "@/components/organisms/DashboardGrid";
import { ListLayout } from "@/components/templates/ListLayout";
import { useReportDashboard } from "@/hooks/useReportData";
import { useReportFilters } from "@/hooks/useReportFilters";
import { mockDashboardData } from "@/infrastructure/mock/data";
import { useTranslations } from "next-intl";

export default function ReportesPage() {
  const t = useTranslations("reports");
  const { filters, setFilters } = useReportFilters();
  const { data: serverDashboard } = useReportDashboard(filters);
  const dashboardData = serverDashboard || mockDashboardData;

  return (
    <ListLayout
      title={t("title")}
      badge={{ text: t("description"), variant: "secondary" }}
    >
      <ReportFilters
        filters={filters}
        onFiltersChange={setFilters}
        categories={[]}
        programs={[]}
        showDateRange
        showSearch={false}
      />

      <DashboardGrid dashboardData={dashboardData} />
    </ListLayout>
  );
}
