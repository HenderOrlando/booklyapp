"use client";

import { Badge } from "@/components/atoms/Badge";
import { Card } from "@/components/atoms/Card";
import { ReportPageLayout } from "@/components/templates/ReportPageLayout";
import { useComplianceReport } from "@/hooks/useReportData";
import { useReportExport } from "@/hooks/useReportExport";
import { useReportFilters } from "@/hooks/useReportFilters";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, PieChart, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * Page: Reporte de Cumplimiento de Reservas — RF-39
 *
 * Muestra métricas de cumplimiento:
 * - Tasa de check-in vs reservas confirmadas
 * - No-shows
 * - Llegadas tardías
 * - Tendencia de cumplimiento
 */

interface ComplianceData {
  period: string;
  totalReservations: number;
  checkedIn: number;
  noShows: number;
  lateArrivals: number;
  complianceRate: number;
}

const mockData: ComplianceData[] = [
  {
    period: "Semana 1 - Feb 2026",
    totalReservations: 120,
    checkedIn: 98,
    noShows: 15,
    lateArrivals: 7,
    complianceRate: 81.7,
  },
  {
    period: "Semana 2 - Feb 2026",
    totalReservations: 135,
    checkedIn: 112,
    noShows: 12,
    lateArrivals: 11,
    complianceRate: 83.0,
  },
  {
    period: "Semana 3 - Feb 2026",
    totalReservations: 110,
    checkedIn: 95,
    noShows: 8,
    lateArrivals: 7,
    complianceRate: 86.4,
  },
  {
    period: "Semana 4 - Feb 2026",
    totalReservations: 142,
    checkedIn: 125,
    noShows: 10,
    lateArrivals: 7,
    complianceRate: 88.0,
  },
];

export default function CumplimientoPage() {
  const t = useTranslations("reports");
  const { filters, setFilters } = useReportFilters();
  const { exportReport } = useReportExport();
  const { data: serverData, isLoading, error } = useComplianceReport(filters);
  const complianceData = (
    serverData && serverData.length > 0 ? serverData : mockData
  ) as ComplianceData[];
  const totals = complianceData.reduce(
    (acc, d) => ({
      reservations: acc.reservations + d.totalReservations,
      checkedIn: acc.checkedIn + d.checkedIn,
      noShows: acc.noShows + d.noShows,
      lateArrivals: acc.lateArrivals + d.lateArrivals,
    }),
    { reservations: 0, checkedIn: 0, noShows: 0, lateArrivals: 0 },
  );
  const avgCompliance =
    totals.reservations > 0
      ? ((totals.checkedIn / totals.reservations) * 100).toFixed(1)
      : "0.0";

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    exportReport({ format, data: complianceData, filename: "reporte-cumplimiento" });
  };

  return (
    <ReportPageLayout
      title={t("compliance_title")}
      description={t("compliance_desc")}
      filters={filters}
      onFiltersChange={setFilters}
      onExport={handleExport}
      exportTitle={t("export")}
      loading={isLoading}
      error={error ? String(error) : null}
      isEmpty={complianceData.length === 0}
      kpiColumns={4}
      kpis={[
        {
          label: t("compliance_rate"),
          value: `${avgCompliance}%`,
          icon: <PieChart className="h-5 w-5 text-[var(--color-action-primary)]" />,
          iconBgClass: "bg-[var(--color-action-primary)]/10",
        },
        {
          label: t("checkins_done"),
          value: totals.checkedIn,
          icon: <CheckCircle2 className="h-5 w-5 text-[var(--color-state-success-text)]" />,
          iconBgClass: "bg-[var(--color-state-success-bg)]",
        },
        {
          label: t("no_shows"),
          value: totals.noShows,
          icon: <XCircle className="h-5 w-5 text-[var(--color-state-error-text)]" />,
          iconBgClass: "bg-[var(--color-state-error-bg)]",
        },
        {
          label: t("late_arrivals"),
          value: totals.lateArrivals,
          icon: <Clock className="h-5 w-5 text-[var(--color-state-warning-text)]" />,
          iconBgClass: "bg-[var(--color-state-warning-bg)]",
        },
      ]}
    >
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-[var(--color-bg-muted)] dark:bg-[var(--color-bg-inverse)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  {t("period")}
                </th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  {t("total_reservations")}
                </th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  {t("checkins")}
                </th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  {t("no_shows")}
                </th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  {t("late")}
                </th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                  {t("compliance")}
                </th>
              </tr>
            </thead>
            <tbody>
              {complianceData.map((row) => (
                <tr
                  key={row.period}
                  className="border-b last:border-0 hover:bg-[var(--color-bg-muted)]/50 dark:hover:bg-[var(--color-bg-inverse)]/50"
                >
                  <td className="px-4 py-3 font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                    {row.period}
                  </td>
                  <td className="px-4 py-3 text-center text-[var(--color-text-secondary)]">
                    {row.totalReservations}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="success">{row.checkedIn}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="error">{row.noShows}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="warning">{row.lateArrivals}</Badge>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        "font-semibold",
                        row.complianceRate >= 85
                          ? "text-[var(--color-state-success-text)]"
                          : row.complianceRate >= 70
                            ? "text-[var(--color-state-warning-text)]"
                            : "text-[var(--color-state-error-text)]",
                      )}
                    >
                      {row.complianceRate}%
                    </span>
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
