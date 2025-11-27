"use client";

import { ReportFilters } from "@/components/molecules/ReportFilters";
import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar/AppSidebar";
import { DashboardGrid } from "@/components/organisms/DashboardGrid";
import { MainLayout } from "@/components/templates/MainLayout";
import { useReportFilters } from "@/hooks/useReportFilters";
import { mockDashboardData } from "@/infrastructure/mock/data";
import { useTranslations } from "next-intl";
import * as React from "react";

export default function ReportesPage() {
  const t = useTranslations("reports");
  const { filters, setFilters } = useReportFilters();
  const [dashboardData] = React.useState(mockDashboardData);

  return (
    <MainLayout header={<AppHeader />} sidebar={<AppSidebar />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {t("title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
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
