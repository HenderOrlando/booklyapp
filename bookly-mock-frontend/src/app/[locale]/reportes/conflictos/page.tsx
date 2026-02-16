"use client";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar";
import { MainLayout } from "@/components/templates/MainLayout";
import { httpClient } from "@/infrastructure/http";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Download,
  Clock,
  Calendar,
  Users,
  Zap,
} from "lucide-react";
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

const resolutionVariant: Record<string, "success" | "warning" | "error" | "default"> = {
  auto_resolved: "success",
  manual_resolved: "success",
  pending: "error",
  cancelled: "warning",
};

const severityColors: Record<string, string> = {
  high: "bg-state-error-500",
  medium: "bg-state-warning-500",
  low: "bg-brand-primary-500",
};

export default function ConflictosPage() {
  const [conflicts, setConflicts] = React.useState<ConflictEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    const fetchConflicts = async () => {
      try {
        // TODO: const res = await httpClient.get("conflict-reports");
        // if (res?.success) setConflicts(res.data);
        setConflicts(mockConflicts);
      } catch {
        setConflicts(mockConflicts);
      } finally {
        setLoading(false);
      }
    };
    fetchConflicts();
  }, []);

  const filtered = conflicts.filter(
    (c) =>
      !searchTerm ||
      c.resourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.reservation1.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = conflicts.filter((c) => c.resolution === "pending").length;
  const resolvedCount = conflicts.filter(
    (c) => c.resolution === "auto_resolved" || c.resolution === "manual_resolved"
  ).length;
  const highSeverity = conflicts.filter((c) => c.severity === "high").length;

  const header = <AppHeader title="Conflictos de Disponibilidad" />;
  const sidebar = <AppSidebar />;

  return (
    <MainLayout header={header} sidebar={sidebar}>
      <div className="space-y-6 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
              Conflictos de Disponibilidad
            </h2>
            <p className="text-[var(--color-text-secondary)] mt-2">
              Solapamientos y conflictos detectados en reservas
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-[var(--color-text-primary)]">
                {conflicts.length}
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Total conflictos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-state-error-500">
                {pendingCount}
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Pendientes
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-state-success-500">
                {resolvedCount}
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Resueltos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-state-warning-500">
                {highSeverity}
              </div>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Alta severidad
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Input
          placeholder="Buscar por recurso o usuario..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />

        {/* Conflicts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-state-warning-500" />
              Conflictos detectados ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary-500" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-8 text-center text-[var(--color-text-tertiary)]">
                No se encontraron conflictos.
              </p>
            ) : (
              <div className="space-y-3">
                {filtered.map((conflict) => (
                  <div
                    key={conflict.id}
                    className="rounded-lg border p-4 transition-colors hover:bg-[var(--color-bg-muted)]/50"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                            severityColors[conflict.severity]
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
                            <Badge variant={resolutionVariant[conflict.resolution]}>
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
                              <span className="font-medium">{conflict.reservation1.userName}:</span>{" "}
                              {conflict.reservation1.purpose}
                            </p>
                            {conflict.reservation2 && (
                              <p>
                                <span className="font-medium">{conflict.reservation2.userName}:</span>{" "}
                                {conflict.reservation2.purpose}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {conflict.resolution === "pending" && (
                        <Button size="sm" variant="outline">
                          Resolver
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
