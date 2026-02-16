"use client";

import { Badge } from "@/components/atoms/Badge/Badge";
import { Button } from "@/components/atoms/Button/Button";
import { Card } from "@/components/atoms/Card/Card";
import { cn } from "@/lib/utils";
import { Star, User, Search, Filter, Download } from "lucide-react";
import * as React from "react";

/**
 * Page: Evaluaciones Administrativas — RF-35
 *
 * Permite al staff administrativo evaluar el comportamiento de usuarios:
 * - Cumplimiento de reservas
 * - Cuidado de recursos
 * - Puntualidad
 */

interface UserEvaluation {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  complianceScore: number;
  careScore: number;
  punctualityScore: number;
  overallScore: number;
  totalReservations: number;
  notes?: string;
  evaluatedAt?: string;
}

const mockEvaluations: UserEvaluation[] = [
  { id: "ev-1", userId: "u-1", userName: "Juan Pérez", userEmail: "juan@ufps.edu.co", role: "Docente", complianceScore: 4.5, careScore: 4.0, punctualityScore: 3.8, overallScore: 4.1, totalReservations: 25, evaluatedAt: "2026-02-10" },
  { id: "ev-2", userId: "u-2", userName: "María López", userEmail: "maria@ufps.edu.co", role: "Estudiante", complianceScore: 3.0, careScore: 4.5, punctualityScore: 2.5, overallScore: 3.3, totalReservations: 12, evaluatedAt: "2026-02-08" },
  { id: "ev-3", userId: "u-3", userName: "Carlos Ramírez", userEmail: "carlos@ufps.edu.co", role: "Docente", complianceScore: 5.0, careScore: 5.0, punctualityScore: 4.8, overallScore: 4.9, totalReservations: 40, evaluatedAt: "2026-02-12" },
  { id: "ev-4", userId: "u-4", userName: "Ana Torres", userEmail: "ana@ufps.edu.co", role: "Administrativo", complianceScore: 4.0, careScore: 3.5, punctualityScore: 4.2, overallScore: 3.9, totalReservations: 18 },
];

function ScoreStars({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            "h-3.5 w-3.5",
            s <= Math.round(score) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          )}
        />
      ))}
      <span className="ml-1 text-xs font-medium text-[var(--color-text-secondary)]">
        {score.toFixed(1)}
      </span>
    </div>
  );
}

export default function EvaluacionesPage() {
  const [search, setSearch] = React.useState("");

  const filtered = mockEvaluations.filter(
    (e) =>
      e.userName.toLowerCase().includes(search.toLowerCase()) ||
      e.userEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Evaluaciones de Usuarios
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Evaluación administrativa del comportamiento de usuarios
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-[var(--color-bg-muted)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">Usuario</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">Rol</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">Cumplimiento</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">Cuidado</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">Puntualidad</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">General</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">Reservas</th>
                <th className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ev) => (
                <tr key={ev.id} className="border-b last:border-0 hover:bg-[var(--color-bg-muted)]/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary-100 text-brand-primary-600">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--color-text-primary)]">{ev.userName}</p>
                        <p className="text-xs text-[var(--color-text-tertiary)]">{ev.userEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge>{ev.role}</Badge>
                  </td>
                  <td className="px-4 py-3"><ScoreStars score={ev.complianceScore} /></td>
                  <td className="px-4 py-3"><ScoreStars score={ev.careScore} /></td>
                  <td className="px-4 py-3"><ScoreStars score={ev.punctualityScore} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-xs font-bold",
                          ev.overallScore >= 4 ? "bg-state-success-100 text-state-success-700" :
                          ev.overallScore >= 3 ? "bg-state-warning-100 text-state-warning-700" :
                          "bg-state-error-100 text-state-error-700"
                        )}
                      >
                        {ev.overallScore.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-[var(--color-text-secondary)]">
                    {ev.totalReservations}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Button variant="outline" size="sm">
                      Evaluar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
