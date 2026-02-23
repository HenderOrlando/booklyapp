"use client";

import { ExportPanel } from "@/components/organisms/ExportPanel";
import { UserActivityTable } from "@/components/organisms/UserActivityTable";
import { useReportByUser } from "@/hooks/useReportData";
import { useReportExport } from "@/hooks/useReportExport";
import { useRouter } from "@/i18n/navigation";
import { mockUserReports } from "@/infrastructure/mock/data";
import type { UserReport } from "@/types/entities/report";
import { useTranslations } from "next-intl";

export default function ReportesUsuariosPage() {
  const t = useTranslations("reports");
  const router = useRouter();
  const { exportReport } = useReportExport();
  const { data: serverData } = useReportByUser();
  const userData: UserReport[] =
    Array.isArray(serverData) && serverData.length > 0
      ? (serverData as UserReport[])
      : (mockUserReports as UserReport[]);

  const handleUserClick = (userId: string) => {
    router.push(`/reportes/usuarios/${userId}`);
  };

  const handleExport = (format: "csv" | "excel" | "pdf", _options: any) => {
    exportReport({ format, data: userData, filename: "usuarios" });
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
              {t("users_title")}
            </h1>
            <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mt-1">
              {t("users_desc")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <UserActivityTable data={userData} onUserClick={handleUserClick} />
          </div>

          <div>
            <ExportPanel
              onExport={handleExport}
              title={t("export_users_title")}
              availableFormats={["csv", "excel", "pdf"]}
              showDateRange={false}
              showOptions={false}
            />
          </div>
        </div>
      </div>
    </>
  );
}
