"use client";

import { ReportPageLayout } from "@/components/templates/ReportPageLayout";
import { UserActivityTable } from "@/components/organisms/UserActivityTable";
import { useReportByUser } from "@/hooks/useReportData";
import { useReportExport } from "@/hooks/useReportExport";
import { useReportFilters } from "@/hooks/useReportFilters";
import { useRouter } from "@/i18n/navigation";
import { mockUserReports } from "@/infrastructure/mock/data";
import type { UserReport } from "@/types/entities/report";
import { Users, XCircle, Clock, BarChart3 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ReportesUsuariosPage() {
  const t = useTranslations("reports");
  const router = useRouter();
  const { filters, setFilters } = useReportFilters();
  const { exportReport } = useReportExport();
  const { data: serverData, isLoading, error } = useReportByUser(filters);
  const userData: UserReport[] =
    Array.isArray(serverData) && serverData.length > 0
      ? serverData
      : (mockUserReports as UserReport[]);

  const totalReservations = userData.reduce(
    (sum, u) => sum + u.totalReservations,
    0,
  );
  const totalCancelled = userData.reduce(
    (sum, u) => sum + u.cancelledReservations,
    0,
  );
  const totalHours = userData.reduce((sum, u) => sum + u.totalHours, 0);

  const handleUserClick = (userId: string) => {
    router.push(`/reportes/usuarios/${userId}`);
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    exportReport({ format, data: userData, filename: "reporte-usuarios" });
  };

  return (
    <ReportPageLayout
      title={t("users_title")}
      description={t("users_desc")}
      filters={filters}
      onFiltersChange={setFilters}
      onExport={handleExport}
      exportTitle={t("export_users_title")}
      exportShowDateRange={false}
      exportShowOptions={false}
      loading={isLoading}
      error={error ? String(error) : null}
      isEmpty={userData.length === 0}
      kpiColumns={4}
      kpis={[
        {
          label: t("total_users"),
          value: userData.length,
          icon: <Users className="h-5 w-5 text-[var(--color-action-primary)]" />,
          iconBgClass: "bg-[var(--color-action-primary)]/10",
        },
        {
          label: t("total_reservations"),
          value: totalReservations,
          icon: <BarChart3 className="h-5 w-5 text-[var(--color-action-secondary)]" />,
          iconBgClass: "bg-[var(--color-action-secondary)]/10",
        },
        {
          label: t("total_hours"),
          value: totalHours,
          icon: <Clock className="h-5 w-5 text-[var(--color-state-warning-text)]" />,
          iconBgClass: "bg-[var(--color-state-warning-bg)]",
        },
        {
          label: t("cancelled_reservations"),
          value: totalCancelled,
          icon: <XCircle className="h-5 w-5 text-[var(--color-state-error-text)]" />,
          iconBgClass: "bg-[var(--color-state-error-bg)]",
        },
      ]}
    >
      <UserActivityTable data={userData} onUserClick={handleUserClick} />
    </ReportPageLayout>
  );
}
