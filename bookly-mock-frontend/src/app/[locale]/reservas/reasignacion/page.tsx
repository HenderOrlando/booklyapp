"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/atoms/Alert";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { AppHeader } from "@/components/organisms/AppHeader";
import { MainLayout } from "@/components/templates/MainLayout";
import { httpClient } from "@/infrastructure/http";
import { cn } from "@/lib/utils";
import {
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
  Users,
  XCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

/**
 * Page: Reasignación de Reservas — RF-15
 *
 * Flujo end-to-end de reasignación cuando un recurso no está disponible:
 * 1. Muestra alternativas sugeridas por algoritmo de similitud
 * 2. Usuario acepta/rechaza cada alternativa
 * 3. Historial de reasignaciones
 *
 * Backend endpoints:
 * - POST /reassignments/request (availability-service)
 * - POST /reassignments/respond (availability-service)
 * - GET /reassignments/my-history (availability-service)
 */

interface ReassignmentSuggestion {
  id: string;
  originalResourceName: string;
  originalDate: string;
  suggestedResourceId: string;
  suggestedResourceName: string;
  suggestedLocation: string;
  suggestedCapacity: number;
  similarityScore: number;
  reason: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

const mockSuggestions: ReassignmentSuggestion[] = [
  {
    id: "ra-001",
    originalResourceName: "Auditorio Principal",
    originalDate: "2026-02-20T10:00:00Z",
    suggestedResourceId: "res-alt-1",
    suggestedResourceName: "Auditorio B",
    suggestedLocation: "Edificio B, Piso 2",
    suggestedCapacity: 200,
    similarityScore: 0.92,
    reason: "Capacidad similar, mismo edificio, equipamiento compatible",
    status: "pending",
    createdAt: "2026-02-16T08:00:00Z",
  },
  {
    id: "ra-002",
    originalResourceName: "Auditorio Principal",
    originalDate: "2026-02-20T10:00:00Z",
    suggestedResourceId: "res-alt-2",
    suggestedResourceName: "Sala de Conferencias A",
    suggestedLocation: "Edificio A, Piso 1",
    suggestedCapacity: 100,
    similarityScore: 0.78,
    reason: "Menor capacidad pero con proyector y audio",
    status: "pending",
    createdAt: "2026-02-16T08:00:00Z",
  },
];

interface ReassignmentHistoryEntry {
  id: string;
  originalResource: string;
  newResource: string;
  date: string;
  decision: "accepted" | "rejected";
  decidedAt: string;
}

const mockReassignmentHistory: ReassignmentHistoryEntry[] = [
  {
    id: "rh-001",
    originalResource: "Lab Cómputo 1",
    newResource: "Lab Cómputo 3",
    date: "2026-02-10T14:00:00Z",
    decision: "accepted",
    decidedAt: "2026-02-08T09:00:00Z",
  },
  {
    id: "rh-002",
    originalResource: "Sala Multimedia",
    newResource: "Sala de Juntas B",
    date: "2026-02-05T08:00:00Z",
    decision: "rejected",
    decidedAt: "2026-02-03T11:00:00Z",
  },
];

export default function ReasignacionPage() {
  const _t = useTranslations("reservations");
  const [suggestions, setSuggestions] =
    React.useState<ReassignmentSuggestion[]>(mockSuggestions);
  const [history, setHistory] = React.useState<ReassignmentHistoryEntry[]>(
    mockReassignmentHistory,
  );
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await httpClient.get("reassignments/my-history");
        if (res?.success && Array.isArray(res.data)) {
          setHistory(
            res.data.map((r: any) => ({
              id: r.id || r._id,
              originalResource: r.originalResourceName || "—",
              newResource: r.newResourceName || "—",
              date: r.requestedDate || r.createdAt,
              decision: r.response || "accepted",
              decidedAt: r.respondedAt || r.updatedAt,
            })),
          );
        }
      } catch {
        // keep mock data
      }
    };
    fetchData();
  }, []);

  const handleRespond = async (
    suggestionId: string,
    response: "accepted" | "rejected",
  ) => {
    setLoading(true);
    try {
      // TODO: await httpClient.post("reassignments/respond", { reassignmentId: suggestionId, response });
      await new Promise((r) => setTimeout(r, 800));
      setSuggestions((prev) =>
        prev.map((s) =>
          s.id === suggestionId ? { ...s, status: response } : s,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const pendingSuggestions = suggestions.filter((s) => s.status === "pending");

  const _header = <AppHeader title="Reasignación de Reservas" />;
  return (
    <MainLayout>
      <div className="space-y-6 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
            Reasignación de Reservas
          </h2>
          <p className="text-[var(--color-text-secondary)] mt-2">
            Alternativas sugeridas cuando un recurso no está disponible
          </p>
        </div>

        {/* Pending Suggestions */}
        {pendingSuggestions.length > 0 && (
          <div>
            <h3 className="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">
              Sugerencias pendientes ({pendingSuggestions.length})
            </h3>
            <div className="space-y-4">
              {pendingSuggestions.map((suggestion) => (
                <Card key={suggestion.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Original → Suggested */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div>
                            <p className="text-xs text-[var(--color-text-tertiary)]">
                              Recurso original
                            </p>
                            <p className="font-medium text-[var(--color-text-primary)] line-through opacity-60">
                              {suggestion.originalResourceName}
                            </p>
                          </div>
                          <ArrowRightLeft className="h-4 w-4 text-brand-primary-500 shrink-0" />
                          <div>
                            <p className="text-xs text-[var(--color-text-tertiary)]">
                              Alternativa sugerida
                            </p>
                            <p className="font-semibold text-brand-primary-500">
                              {suggestion.suggestedResourceName}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-[var(--color-text-secondary)]">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {suggestion.suggestedLocation}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            Cap. {suggestion.suggestedCapacity}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(
                              suggestion.originalDate,
                            ).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
                          {suggestion.reason}
                        </p>
                      </div>

                      {/* Score + Actions */}
                      <div className="flex flex-col items-center gap-3 shrink-0">
                        <div className="text-center">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-state-warning-500 fill-state-warning-500" />
                            <span className="text-lg font-bold text-[var(--color-text-primary)]">
                              {Math.round(suggestion.similarityScore * 100)}%
                            </span>
                          </div>
                          <p className="text-[10px] text-[var(--color-text-tertiary)]">
                            Similitud
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={loading}
                            onClick={() =>
                              handleRespond(suggestion.id, "accepted")
                            }
                            className="gap-1"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Aceptar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={loading}
                            onClick={() =>
                              handleRespond(suggestion.id, "rejected")
                            }
                            className="gap-1"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Rechazar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {pendingSuggestions.length === 0 && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Sin sugerencias pendientes</AlertTitle>
            <AlertDescription>
              No tienes reasignaciones pendientes de revisión.
            </AlertDescription>
          </Alert>
        )}

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle>Historial de Reasignaciones</CardTitle>
            <CardDescription>
              Decisiones previas sobre alternativas sugeridas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="py-4 text-center text-sm text-[var(--color-text-tertiary)]">
                No hay historial de reasignaciones.
              </p>
            ) : (
              <div className="space-y-2">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "h-2 w-2 rounded-full",
                          entry.decision === "accepted"
                            ? "bg-state-success-500"
                            : "bg-state-error-500",
                        )}
                      />
                      <div>
                        <p className="text-sm font-medium text-[var(--color-text-primary)]">
                          {entry.originalResource} → {entry.newResource}
                        </p>
                        <p className="text-xs text-[var(--color-text-tertiary)]">
                          {new Date(entry.date).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        entry.decision === "accepted" ? "success" : "error"
                      }
                    >
                      {entry.decision === "accepted" ? "Aceptada" : "Rechazada"}
                    </Badge>
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
