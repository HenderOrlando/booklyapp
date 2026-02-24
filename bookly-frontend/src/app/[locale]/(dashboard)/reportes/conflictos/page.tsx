"use client";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { ReportPageLayout } from "@/components/templates/ReportPageLayout";
import { useConflictReport } from "@/hooks/useReportData";
import { useReportExport } from "@/hooks/useReportExport";
import { useReportFilters } from "@/hooks/useReportFilters";
import { cn } from "@/lib/utils";
import { AlertTriangle, Calendar, Clock, Shield, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

/**
 * Page: Reporte de Conflictos de Disponibilidad — RF-38
 *
 * Muestra conflictos detectados en reservas:
 * - Solapamientos detectados y resueltos
 * - Conflictos por mantenimiento
 * - Conflictos por eventos institucionales
 * - Tendencias de conflictos por franja horaria
 */

interface ConflictEntry {
  id: string;
  resourceName: string;
  conflictType: "overlap" | "maintenance" | "institutional" | "double_booking";
  date: string;
  slot: string;
  reservation1: { userName: string; purpose: string };
  reservation2?: { userName: string; purpose: string };
  resolution: "auto_resolved" | "manual_resolved" | "pending" | "cancelled";
  severity: "high" | "medium" | "low";
  detectedAt: string;
}

const mockConflicts: ConflictEntry[] = [
  {
    id: "cf-001",
    resourceName: "Auditorio Principal",
    conflictType: "overlap",
    date: "2026-02-18",
    slot: "10:00–12:00",
    reservation1: { userName: "Juan Pérez", purpose: "Clase magistral" },
    reservation2: { userName: "María López", purpose: "Conferencia invitada" },
    resolution: "manual_resolved",
    severity: "high",
    detectedAt: "2026-02-15T09:00:00Z",
  },
  {
    id: "cf-002",
    resourceName: "Lab Cómputo 1",
    conflictType: "maintenance",
    date: "2026-02-17",
    slot: "08:00–10:00",
    reservation1: { userName: "Carlos Ramírez", purpose: "Práctica de redes" },
    resolution: "auto_resolved",
    severity: "medium",
    detectedAt: "2026-02-14T14:00:00Z",
  },
  {
    id: "cf-003",
    resourceName: "Sala Conferencias A",
    conflictType: "double_booking",
    date: "2026-02-19",
    slot: "14:00–16:00",
    reservation1: { userName: "Ana Torres", purpose: "Reunión de proyecto" },
    reservation2: { userName: "Pedro Gómez", purpose: "Tutoría grupal" },
    resolution: "pending",
    severity: "high",
    detectedAt: "2026-02-16T11:00:00Z",
  },
  {
    id: "cf-004",
    resourceName: "Auditorio B",
    conflictType: "institutional",
    date: "2026-02-20",
    slot: "09:00–17:00",
    reservation1: { userName: "Decanatura", purpose: "Evento institucional" },
    resolution: "cancelled",
    severity: "low",
    detectedAt: "2026-02-10T08:00:00Z",
  },
];

const conflictTypeLabels: Record<string, string> = {
  overlap: "Solapamiento",
  maintenance: "Mantenimiento",
  institutional: "Evento institucional",
  double_booking: "Doble reserva",
};

const resolutionLabels: Record<string, string> = {
  auto_resolved: "Resuelto auto.",
  manual_resolved: "Resuelto manual",
  pending: "Pendiente",
  cancelled: "Cancelado",
};

const resolutionVariant: Record<
  string,
  "success" | "warning" | "error" | "default"
> = {
  auto_resolved: "success",
  manual_resolved: "success",
  pending: "error",
  cancelled: "warning",
};

const severityColors: Record<string, string> = {
  high: "bg-[var(--color-state-error-text)]",
  medium: "bg-[var(--color-state-warning-text)]",
  low: "bg-[var(--color-action-primary)]",
};

export default function ConflictosPage() {
  const t = useTranslations("reports");
  const { filters, setFilters } = useReportFilters();
  const { exportReport } = useReportExport();
  const { data: serverData, isLoading, error } = useConflictReport(filters);
  const [searchTerm, setSearchTerm] = React.useState("");

  const conflicts = React.useMemo(() => {
    const raw =
      serverData && serverData.length > 0 ? serverData : mockConflicts;
    return raw as ConflictEntry[];
  }, [serverData]);

  const filtered = conflicts.filter(
    (c) =>
      !searchTerm ||
      (c.resourceName ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.reservation1?.userName ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const pendingCount = conflicts.filter(
    (c) => c.resolution === "pending",
  ).length;
  const resolvedCount = conflicts.filter(
    (c) =>
      c.resolution === "auto_resolved" || c.resolution === "manual_resolved",
  ).length;
  const highSeverity = conflicts.filter((c) => c.severity === "high").length;

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    exportReport({ format, data: conflicts, filename: "reporte-conflictos" });
  };

  return (
    <ReportPageLayout
      title={t("conflicts_title")}
      description={t("conflicts_desc")}
      filters={filters}
      onFiltersChange={setFilters}
      onExport={handleExport}
      exportTitle={t("export")}
      loading={isLoading}
      error={error ? String(error) : null}
      isEmpty={conflicts.length === 0}
      kpiColumns={4}
      kpis={[
        {
          label: t("total_conflicts"),
          value: conflicts.length,
          icon: <AlertTriangle className="h-5 w-5 text-[var(--color-action-primary)]" />,
          iconBgClass: "bg-[var(--color-action-primary)]/10",
        },
        {
          label: t("pending"),
          value: pendingCount,
          icon: <XCircle className="h-5 w-5 text-[var(--color-state-error-text)]" />,
          iconBgClass: "bg-[var(--color-state-error-bg)]",
          valueClass: "text-[var(--color-state-error-text)]",
        },
        {
          label: t("resolved"),
          value: resolvedCount,
          icon: <Shield className="h-5 w-5 text-[var(--color-state-success-text)]" />,
          iconBgClass: "bg-[var(--color-state-success-bg)]",
          valueClass: "text-[var(--color-state-success-text)]",
        },
        {
          label: t("high_severity"),
          value: highSeverity,
          icon: <AlertTriangle className="h-5 w-5 text-[var(--color-state-warning-text)]" />,
          iconBgClass: "bg-[var(--color-state-warning-bg)]",
          valueClass: "text-[var(--color-state-warning-text)]",
        },
      ]}
    >
      {/* Search */}
      <Input
        placeholder={t("search_resource_user")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md"
      />

      {/* Conflicts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[var(--color-text-primary)]">
            <AlertTriangle className="h-5 w-5 text-[var(--color-state-warning-text)]" />
            {t("detected_conflicts")} ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-[var(--color-text-tertiary)]">
              {t("no_conflicts_found")}
            </p>
          ) : (
            <div className="space-y-3">
              {filtered.map((conflict) => (
                <div
                  key={conflict.id}
                  className="rounded-lg border border-[var(--color-border-subtle)] p-4 transition-colors hover:bg-[var(--color-bg-muted)]/50 dark:hover:bg-[var(--color-bg-inverse)]/50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                          severityColors[conflict.severity],
                        )}
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-[var(--color-text-primary)]">
                            {conflict.resourceName}
                          </span>
                          <Badge variant="default">
                            {conflictTypeLabels[conflict.conflictType]}
                          </Badge>
                          <Badge
                            variant={resolutionVariant[conflict.resolution]}
                          >
                            {resolutionLabels[conflict.resolution]}
                          </Badge>
                        </div>

                        <div className="mt-1.5 flex items-center gap-4 text-xs text-[var(--color-text-tertiary)]">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {conflict.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {conflict.slot}
                          </span>
                        </div>

                        <div className="mt-2 space-y-1 text-sm text-[var(--color-text-secondary)]">
                          <p>
                            <span className="font-medium">
                              {conflict.reservation1.userName}:
                            </span>{" "}
                            {conflict.reservation1.purpose}
                          </p>
                          {conflict.reservation2 && (
                            <p>
                              <span className="font-medium">
                                {conflict.reservation2.userName}:
                              </span>{" "}
                              {conflict.reservation2.purpose}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {conflict.resolution === "pending" && (
                      <Button size="sm" variant="outline">
                        {t("resolve")}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </ReportPageLayout>
  );
}
