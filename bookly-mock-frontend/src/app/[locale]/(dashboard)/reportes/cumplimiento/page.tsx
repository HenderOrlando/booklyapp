"use client";

import { Badge } from "@/components/atoms/Badge/Badge";
import { Button } from "@/components/atoms/Button/Button";
import { Card } from "@/components/atoms/Card/Card";
import { useComplianceReport } from "@/hooks/useReportData";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Download, PieChart, XCircle } from "lucide-react";
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
  const _t = useTranslations("reports");
  const { data: serverData } = useComplianceReport();
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
  const avgCompliance = (
    (totals.checkedIn / totals.reservations) *
    100
  ).toFixed(1);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-content-primary">
              Cumplimiento de Reservas
            </h1>
            <p className="mt-1 text-sm text-content-secondary">
              Tasa de asistencia y check-in de reservas confirmadas
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-brand-primary-100 p-2">
                <PieChart className="h-5 w-5 text-brand-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-content-primary">
                  {avgCompliance}%
                </p>
                <p className="text-xs text-content-secondary">
                  Tasa de cumplimiento
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-state-success-100 p-2">
                <CheckCircle2 className="h-5 w-5 text-state-success-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-content-primary">
                  {totals.checkedIn}
                </p>
                <p className="text-xs text-content-secondary">
                  Check-ins realizados
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-state-error-100 p-2">
                <XCircle className="h-5 w-5 text-state-error-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-content-primary">
                  {totals.noShows}
                </p>
                <p className="text-xs text-content-secondary">
                  No-shows
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-state-warning-100 p-2">
                <Clock className="h-5 w-5 text-state-warning-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-content-primary">
                  {totals.lateArrivals}
                </p>
                <p className="text-xs text-content-secondary">
                  Llegadas tardías
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-app">
                  <th className="px-4 py-3 text-left font-medium text-content-secondary">
                    Período
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-content-secondary">
                    Total reservas
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-content-secondary">
                    Check-ins
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-content-secondary">
                    No-shows
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-content-secondary">
                    Tardías
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-content-secondary">
                    Cumplimiento
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockData.map((row) => (
                  <tr
                    key={row.period}
                    className="border-b last:border-0 hover:bg-app/50"
                  >
                    <td className="px-4 py-3 font-medium text-content-primary">
                      {row.period}
                    </td>
                    <td className="px-4 py-3 text-center">
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
                            ? "text-state-success-600"
                            : row.complianceRate >= 70
                              ? "text-state-warning-600"
                              : "text-state-error-600",
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
      </div>
    </>
  );
}
