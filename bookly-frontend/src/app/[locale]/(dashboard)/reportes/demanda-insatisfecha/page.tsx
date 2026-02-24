"use client";

import { Badge } from "@/components/atoms/Badge";
import { Card } from "@/components/atoms/Card";
import { ReportPageLayout } from "@/components/templates/ReportPageLayout";
import { useUnsatisfiedDemandReport } from "@/hooks/useReportData";
import { useReportExport } from "@/hooks/useReportExport";
import { useReportFilters } from "@/hooks/useReportFilters";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  TrendingDown,
} from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Page: Reporte de Demanda Insatisfecha — RF-37
 *
 * Muestra recursos con alta demanda que no pudo ser satisfecha:
 * - Reservas rechazadas por falta de disponibilidad
 * - Listas de espera activas
 * - Horarios con mayor demanda insatisfecha
 */

interface UnsatisfiedDemandItem {
  resourceId: string;
  resourceName: string;
  totalRejected: number;
  totalWaitlisted: number;
  peakHours: string[];
  demandScore: number;
}

const mockData: UnsatisfiedDemandItem[] = [
  {
    resourceId: "res-001",
    resourceName: "Auditorio Principal",
    totalRejected: 45,
    totalWaitlisted: 12,
    peakHours: ["10:00-12:00", "14:00-16:00"],
    demandScore: 92,
  },
  {
    resourceId: "res-002",
    resourceName: "Sala de Conferencias A",
    totalRejected: 32,
    totalWaitlisted: 8,
    peakHours: ["08:00-10:00", "16:00-18:00"],
    demandScore: 78,
  },
  {
    resourceId: "res-003",
    resourceName: "Laboratorio de Cómputo 1",
    totalRejected: 28,
    totalWaitlisted: 15,
    peakHours: ["10:00-12:00"],
    demandScore: 71,
  },
  {
    resourceId: "res-004",
    resourceName: "Sala Multimedia",
    totalRejected: 18,
    totalWaitlisted: 5,
    peakHours: ["14:00-16:00"],
    demandScore: 55,
  },
];

export default function DemandaInsatisfechaPage() {
  const t = useTranslations("reports");
  const { filters, setFilters } = useReportFilters();
  const { exportReport } = useReportExport();
  const { data: serverData, isLoading, error } = useUnsatisfiedDemandReport(filters);
  const data = (
    serverData && serverData.length > 0 ? serverData : mockData
  ) as UnsatisfiedDemandItem[];
  const totalRejected = data.reduce((sum, d) => sum + d.totalRejected, 0);
  const totalWaitlisted = data.reduce((sum, d) => sum + d.totalWaitlisted, 0);

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    exportReport({ format, data, filename: "reporte-demanda-insatisfecha" });
  };

  return (
    <ReportPageLayout
      title={t("unsatisfied_demand_title")}
      description={t("unsatisfied_demand_desc")}
      filters={filters}
      onFiltersChange={setFilters}
      onExport={handleExport}
      exportTitle={t("export")}
      loading={isLoading}
      error={error ? String(error) : null}
      isEmpty={data.length === 0}
      kpiColumns={3}
      kpis={[
        {
          label: t("rejected_reservations"),
          value: totalRejected,
          icon: <TrendingDown className="h-5 w-5 text-[var(--color-state-error-text)]" />,
          iconBgClass: "bg-[var(--color-state-error-bg)]",
        },
        {
          label: t("in_waitlist"),
          value: totalWaitlisted,
          icon: <AlertTriangle className="h-5 w-5 text-[var(--color-state-warning-text)]" />,
          iconBgClass: "bg-[var(--color-state-warning-bg)]",
        },
        {
          label: t("affected_resources"),
          value: data.length,
          icon: <BarChart3 className="h-5 w-5 text-[var(--color-action-primary)]" />,
          iconBgClass: "bg-[var(--color-action-primary)]/10",
        },
      ]}
    >
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-[var(--color-bg-muted)] dark:bg-[var(--color-bg-inverse)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  {t("resource")}
                </th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  {t("rejected")}
                </th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  {t("waiting")}
                </th>
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  {t("peak_hours")}
                </th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  {t("demand_score")}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr
                  key={item.resourceId}
                  className="border-b last:border-0 hover:bg-[var(--color-bg-muted)]/50 dark:hover:bg-[var(--color-bg-inverse)]/50"
                >
                  <td className="px-4 py-3 font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                    {item.resourceName}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="error">{item.totalRejected}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="warning">{item.totalWaitlisted}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {item.peakHours.map((h) => (
                        <span
                          key={h}
                          className="inline-flex items-center gap-1 rounded bg-[var(--color-bg-muted)] dark:bg-[var(--color-bg-inverse)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)]"
                        >
                          <Calendar className="h-3 w-3" />
                          {h}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-2 w-16 rounded-full bg-[var(--color-bg-muted)] dark:bg-[var(--color-bg-inverse)]">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            item.demandScore >= 80
                              ? "bg-[var(--color-state-error-text)]"
                              : item.demandScore >= 60
                                ? "bg-[var(--color-state-warning-text)]"
                                : "bg-[var(--color-action-primary)]",
                          )}
                          style={{ width: `${item.demandScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-[var(--color-text-primary)]">
                        {item.demandScore}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </ReportPageLayout>
  );
}
