"use client";

import { ReportFilters } from "@/components/molecules/ReportFilters";
import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar/AppSidebar";
import { DashboardGrid } from "@/components/organisms/DashboardGrid";
import { MainLayout } from "@/components/templates/MainLayout";
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
    <MainLayout header={<AppHeader />} sidebar={<AppSidebar />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
              {t("title")}
            </h1>
            <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mt-1">
              {t("description")}
            </p>
          </div>
        </div>

        <ReportFilters
          filters={filters}
          onFiltersChange={setFilters}
          categories={[]}
          programs={[]}
          showDateRange
          showSearch={false}
        />

        <DashboardGrid dashboardData={dashboardData} />
      </div>
    </MainLayout>
  );
}
