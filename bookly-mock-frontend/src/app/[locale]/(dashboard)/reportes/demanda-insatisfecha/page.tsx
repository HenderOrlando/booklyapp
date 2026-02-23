"use client";

import { Badge } from "@/components/atoms/Badge/Badge";
import { Button } from "@/components/atoms/Button/Button";
import { Card } from "@/components/atoms/Card/Card";
import { useUnsatisfiedDemandReport } from "@/hooks/useReportData";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Download,
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
  const { data: serverData } = useUnsatisfiedDemandReport();
  const data = (
    serverData && serverData.length > 0 ? serverData : mockData
  ) as UnsatisfiedDemandItem[];
  const totalRejected = data.reduce((sum, d) => sum + d.totalRejected, 0);
  const totalWaitlisted = data.reduce((sum, d) => sum + d.totalWaitlisted, 0);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-content-primary">
              {t("unsatisfied_demand_title")}
            </h1>
            <p className="mt-1 text-sm text-content-secondary">
              {t("unsatisfied_demand_desc")}
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            {t("export")}
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-state-error-100 p-2">
                <TrendingDown className="h-5 w-5 text-state-error-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-content-primary">
                  {totalRejected}
                </p>
                <p className="text-xs text-content-secondary">
                  {t("rejected_reservations")}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-state-warning-100 p-2">
                <AlertTriangle className="h-5 w-5 text-state-warning-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-content-primary">
                  {totalWaitlisted}
                </p>
                <p className="text-xs text-content-secondary">
                  {t("in_waitlist")}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-brand-primary-100 p-2">
                <BarChart3 className="h-5 w-5 text-brand-primary-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-content-primary">
                  {mockData.length}
                </p>
                <p className="text-xs text-content-secondary">
                  {t("affected_resources")}
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
                    {t("resource")}
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-content-secondary">
                    {t("rejected")}
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-content-secondary">
                    {t("waiting")}
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-content-secondary">
                    {t("peak_hours")}
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-content-secondary">
                    {t("demand_score")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockData.map((item) => (
                  <tr
                    key={item.resourceId}
                    className="border-b last:border-0 hover:bg-app/50"
                  >
                    <td className="px-4 py-3 font-medium text-content-primary">
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
                            className="inline-flex items-center gap-1 rounded bg-app px-2 py-0.5 text-xs"
                          >
                            <Calendar className="h-3 w-3" />
                            {h}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-2 w-16 rounded-full bg-app">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              item.demandScore >= 80
                                ? "bg-state-error-500"
                                : item.demandScore >= 60
                                  ? "bg-state-warning-500"
                                  : "bg-brand-primary-500",
                            )}
                            style={{ width: `${item.demandScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">
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
      </div>
    </>
  );
}
