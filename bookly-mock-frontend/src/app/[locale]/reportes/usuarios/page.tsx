"use client";

import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar/AppSidebar";
import { ExportPanel } from "@/components/organisms/ExportPanel";
import { UserActivityTable } from "@/components/organisms/UserActivityTable";
import { MainLayout } from "@/components/templates/MainLayout";
import { useReportExport } from "@/hooks/useReportExport";
import { mockUserReports } from "@/infrastructure/mock/data";
import { useRouter } from "next/navigation";
import * as React from "react";

export default function ReportesUsuariosPage() {
  const router = useRouter();
  const { exportReport } = useReportExport();
  const [userData] = React.useState(mockUserReports);

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Reportes por Usuario
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
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
