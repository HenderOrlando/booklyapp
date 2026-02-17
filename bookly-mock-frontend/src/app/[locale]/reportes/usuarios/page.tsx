"use client";

import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar/AppSidebar";
import { ExportPanel } from "@/components/organisms/ExportPanel";
import { UserActivityTable } from "@/components/organisms/UserActivityTable";
import { MainLayout } from "@/components/templates/MainLayout";
import { useReportByUser } from "@/hooks/useReportData";
import { useReportExport } from "@/hooks/useReportExport";
import { mockUserReports } from "@/infrastructure/mock/data";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

export default function ReportesUsuariosPage() {
  const t = useTranslations("reports");
  const router = useRouter();
  const { exportReport } = useReportExport();
  const { data: serverData } = useReportByUser();
  const userData =
    serverData && serverData.length > 0 ? serverData : mockUserReports;

  const handleUserClick = (userId: string) => {
    router.push(`/reportes/usuarios/${userId}`);
  };

  const handleExport = (format: "csv" | "excel" | "pdf", options: any) => {
    exportReport({ format, data: userData, filename: "usuarios" });
  };

  return (
    <MainLayout header={<AppHeader />} sidebar={<AppSidebar />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
              Reportes por Usuario
            </h1>
            <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mt-1">
              Actividad y estadísticas de uso por usuario
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
              title="Exportar Reporte de Usuarios"
              availableFormats={["csv", "excel", "pdf"]}
              showDateRange={false}
              showOptions={false}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
