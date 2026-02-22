"use client";

import { Badge } from "@/components/atoms/Badge/Badge";
import { Button } from "@/components/atoms/Button/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card/Card";
import { AppHeader } from "@/components/organisms/AppHeader";
import { MainLayout } from "@/components/templates/MainLayout";
import { useReassignment } from "@/hooks/useReassignment";
import { useToast } from "@/hooks/useToast";
import type { 
  ReassignmentHistoryResponseDto, 
} from "@/types/entities/reassignment";
import { Skeleton } from "@/components/atoms/Skeleton/Skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/atoms/Tooltip/Tooltip";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  Star,
  XCircle,
} from "lucide-react";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { useTranslations } from "next-intl";
import * as React from "react";

export default function ReasignacionPage() {

  const t = useTranslations("reservations");
  const { showSuccess, showError } = useToast();
  const { useHistory, respondToReassignment } = useReassignment();
  const { data: history = [], isLoading: loadingHistory } = useHistory();

  const handleRespond = async (
    reassignmentId: string,
    accepted: boolean,
    newResourceId?: string
  ) => {
    try {
      await respondToReassignment.mutateAsync({
        reassignmentId,
        accepted,
        newResourceId,
        notifyUser: true,
      });
      showSuccess(
        accepted ? "Reasignación aceptada" : "Reasignación rechazada",
        "La decisión ha sido registrada exitosamente."
      );
    } catch (error) {
      showError(
        "Error",
        "No se pudo registrar la respuesta. Intenta de nuevo."
      );
    }
  };

  const pendingSuggestions: ReassignmentHistoryResponseDto[] = history.filter(
    (h) => !h.accepted && !h.respondedAt
  );

  if (loadingHistory) {
    return (
      <MainLayout>
        <AppHeader title={t("reasignacion.titulo")} />
        <div className="space-y-6 pb-6">
          <Skeleton className="h-10 w-64" />
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <Skeleton className="h-20 flex-1" />
                    <Skeleton className="h-20 w-32" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <AppHeader title={t("reasignacion.titulo")} />
      <div className="space-y-6 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">
            {t("reasignacion.titulo")}
          </h2>
          <p className="text-[var(--color-text-secondary)] mt-2">
            {t("reasignacion.descripcion")}
          </p>
        </div>

        {/* Sugerencias Pendientes */}
        {pendingSuggestions.length > 0 && (
          <div>
            <h3 className="mb-3 text-lg font-semibold text-[var(--color-text-primary)]">
              {t("reasignacion.pendientes", { count: pendingSuggestions.length })}
            </h3>
            <div className="space-y-4">
              {pendingSuggestions.map((suggestion) => (
                <Card key={suggestion.id} className="border-l-4 border-l-brand-primary-500">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      {/* Comparativa Visual */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex-1 min-w-[200px] p-3 rounded-lg bg-[var(--color-bg-subtle)] border border-[var(--color-border-subtle)]">
                            <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] font-bold">
                              Original
                            </p>
                            <p className="font-medium text-[var(--color-text-primary)] line-through opacity-60">
                              {suggestion.originalResource.name}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-primary-50 text-brand-primary-600">
                            <ArrowRightLeft className="h-4 w-4" />
                          </div>

                          <div className="flex-1 min-w-[200px] p-3 rounded-lg bg-brand-primary-50 border border-brand-primary-200">
                            <p className="text-[10px] uppercase tracking-wider text-brand-primary-700 font-bold">
                              Propuesto
                            </p>
                            <p className="font-semibold text-brand-primary-900">
                              {suggestion.newResource.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-[var(--color-text-secondary)]">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 cursor-help">
                                  <Star className={cn(
                                    "h-4 w-4",
                                    suggestion.similarityScore > 80 ? "text-state-success-500" : "text-state-warning-500"
                                  )} />
                                  <span className="font-bold">{suggestion.similarityScore}% Similitud</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="space-y-1 p-1">
                                  <p className="text-xs font-bold">Desglose de Similitud:</p>
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                                    <span>Capacidad:</span> <span className="text-right">{suggestion.scoreBreakdown.capacity}%</span>
                                    <span>Equipamiento:</span> <span className="text-right">{suggestion.scoreBreakdown.features}%</span>
                                    <span>Ubicación:</span> <span className="text-right">{suggestion.scoreBreakdown.location}%</span>
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <span className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-[var(--color-text-tertiary)]" />
                            {new Date(suggestion.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="p-2 rounded bg-state-info-50 text-[var(--color-state-info-text)] text-xs flex items-start gap-2">
                          <AlertCircle className="h-3.5 w-3.5 mt-0.5" />
                          <span><strong>Razón:</strong> {suggestion.reason}</span>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex flex-col gap-2 shrink-0">
                        <Button
                          disabled={respondToReassignment.isPending}
                          onClick={() => handleRespond(suggestion.id, true, suggestion.newResource.id)}
                          className="w-full md:w-32 bg-brand-primary-600 hover:bg-brand-primary-700"
                        >
                          {respondToReassignment.isPending ? (
                            <LoadingSpinner size="sm" className="mr-2" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                          )}
                          Aceptar
                        </Button>
                        <Button
                          variant="outline"
                          disabled={respondToReassignment.isPending}
                          onClick={() => handleRespond(suggestion.id, false)}
                          className="w-full md:w-32 border-state-error-200 text-state-error-600 hover:bg-state-error-50"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {pendingSuggestions.length === 0 && (
          <Card className="border-dashed py-12">
            <CardContent className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-[var(--color-bg-subtle)] flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-state-success-500" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                {t("reasignacion.sin_pendientes_titulo")}
              </h3>
              <p className="text-[var(--color-text-secondary)] max-w-sm mt-2">
                {t("reasignacion.sin_pendientes_desc")}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Historial */}
        <Card>
          <CardHeader>
            <CardTitle>{t("reasignacion.historial_titulo")}</CardTitle>
            <CardDescription>{t("reasignacion.historial_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="py-8 text-center text-sm text-[var(--color-text-tertiary)] italic">
                {t("reasignacion.sin_historial")}
              </p>
            ) : (
              <div className="divide-y divide-[var(--color-border-subtle)]">
                {history.filter(h => h.respondedAt).map((entry) => (
                  <div key={entry.id} className="py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "mt-1.5 h-2 w-2 rounded-full shrink-0",
                          entry.accepted ? "bg-state-success-500" : "bg-state-error-500"
                        )} />
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-[var(--color-text-primary)]">
                              {entry.originalResource.name}
                            </span>
                            <ArrowRightLeft className="h-3 w-3 text-[var(--color-text-tertiary)]" />
                            <span className="text-sm font-semibold text-brand-primary-600">
                              {entry.newResource.name}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
                            {new Date(entry.createdAt).toLocaleDateString()} • {entry.reason}
                          </p>
                        </div>
                      </div>
                      <Badge variant={entry.accepted ? "success" : "error"}>
                        {entry.accepted ? "Aceptada" : "Rechazada"}
                      </Badge>
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
