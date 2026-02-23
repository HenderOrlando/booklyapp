"use client";

import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import { LoadingSpinner } from "@/components/atoms/LoadingSpinner";
import { WaitlistManager } from "@/components/organisms/WaitlistManager";
import {
  useAcceptWaitlistOffer,
  useNotifyWaitlist,
  useRemoveFromWaitlist,
} from "@/hooks/mutations";
import { useWaitlistEntries } from "@/hooks/useWaitlist";
import { useDataMode } from "@/hooks/useDataMode";
import type { WaitlistEntry, WaitlistStats } from "@/types/entities/waitlist";
import { useTranslations } from "next-intl";
import * as React from "react";

/**
 * Página de Lista de Espera - Bookly
 *
 * Gestión de lista de espera:
 * - Vista por recurso
 * - Filtros y estadísticas
 * - Acciones de notificación y asignación
 */

// Mock data (fallback cuando dataMode es MOCK)
const MOCK_WAITLIST_ENTRIES: WaitlistEntry[] = [
  {
    id: "wait_1",
    userId: "user_1",
    userName: "Carlos García",
    userEmail: "carlos.garcia@ufps.edu.co",
    resourceId: "res_1",
    resourceName: "Aula 101",
    desiredDate: "2025-11-25",
    startTime: "14:00",
    endTime: "16:00",
    priority: "HIGH",
    status: "WAITING",
    position: 1,
    reason: "Clase de Cálculo Diferencial - Grupo 01",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wait_2",
    userId: "user_2",
    userName: "Ana Martínez",
    userEmail: "ana.martinez@ufps.edu.co",
    resourceId: "res_1",
    resourceName: "Aula 101",
    desiredDate: "2025-11-25",
    startTime: "14:00",
    endTime: "16:00",
    priority: "NORMAL",
    status: "WAITING",
    position: 2,
    reason: "Tutoría de programación",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "wait_3",
    userId: "user_3",
    userName: "Luis Rodríguez",
    userEmail: "luis.rodriguez@ufps.edu.co",
    resourceId: "res_2",
    resourceName: "Laboratorio 3",
    desiredDate: "2025-11-26",
    startTime: "09:00",
    endTime: "11:00",
    priority: "URGENT",
    status: "NOTIFIED",
    position: 1,
    reason: "Práctica de laboratorio - Electrónica",
    notificationSent: true,
    notificationSentAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_WAITLIST_STATS: WaitlistStats = {
  totalWaiting: 8,
  totalNotified: 3,
  totalAssigned: 12,
  totalExpired: 2,
  averageWaitTime: 2.5,
  byPriority: {
    low: 2,
    normal: 4,
    high: 2,
    urgent: 0,
  },
};

export default function ListaEsperaPage() {
  const t = useTranslations("waitlist");
  const { isMock, isServe } = useDataMode();
  const [selectedResourceId, setSelectedResourceId] =
    React.useState<string>("all");

  // React Query para cargar datos de waitlist desde backend (modo SERVER)
  const {
    data: serverData,
    isLoading,
    error: serverError,
    refetch,
  } = useWaitlistEntries({
    ...(selectedResourceId !== "all" ? { resourceId: selectedResourceId } : {}),
  });

  // Seleccionar fuente de datos según el modo
  const entries: WaitlistEntry[] = React.useMemo(() => {
    if (isMock) return MOCK_WAITLIST_ENTRIES;
    return serverData?.entries || [];
  }, [isMock, serverData?.entries]);

  const stats: WaitlistStats = React.useMemo(() => {
    if (isMock) return MOCK_WAITLIST_STATS;
    return serverData?.stats || {
      totalWaiting: 0,
      totalNotified: 0,
      totalAssigned: 0,
      totalExpired: 0,
      averageWaitTime: 0,
      byPriority: { low: 0, normal: 0, high: 0, urgent: 0 },
    };
  }, [isMock, serverData?.stats]);

  // Mutations
  const notifyEntry = useNotifyWaitlist();
  const assignEntry = useAcceptWaitlistOffer();
  const removeEntry = useRemoveFromWaitlist();

  // Extraer recursos únicos para el dropdown de filtro
  const uniqueResources = React.useMemo(() => {
    const map = new Map<string, string>();
    entries.forEach((e) => map.set(e.resourceId, e.resourceName));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [entries]);

  // Filtrar por recurso (en modo mock se filtra client-side, en server ya viene filtrado)
  const filteredEntries = React.useMemo(() => {
    if (isServe) return entries; // Ya filtrado por query param
    return selectedResourceId === "all"
      ? entries
      : entries.filter((e) => e.resourceId === selectedResourceId);
  }, [isServe, entries, selectedResourceId]);

  const handleNotify = (entryId: string) => {
    // Obtener entrada para extraer datos del recurso
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;

    notifyEntry.mutate(
      {
        resourceId: entry.resourceId,
        availableFrom: `${entry.desiredDate}T${entry.startTime}`,
        availableUntil: `${entry.desiredDate}T${entry.endTime}`,
        notifyTop: 1,
      },
      {
        onSuccess: () => {
          // Success handled by React Query cache invalidation
        },
        onError: (error: any) => {
          console.error("Error al notificar:", error);
        },
      },
    );
  };

  const handleAssign = (entryId: string) => {
    assignEntry.mutate(entryId, {
      onSuccess: () => {
        // Success handled by React Query cache invalidation
      },
      onError: (error: any) => {
        console.error("Error al asignar:", error);
      },
    });
  };

  const handleCancel = (entryId: string) => {
    removeEntry.mutate(entryId, {
      onSuccess: () => {
        // Success handled by React Query cache invalidation
      },
      onError: (error: any) => {
        console.error("Error al cancelar:", error);
      },
    });
  };

  return (
    <>
      <div className="space-y-6">
        {/* Descripción */}
        <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-purple-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-purple-300 mb-1">
                {t("management_title")}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {t("management_description")}
              </p>
            </div>
          </div>
        </div>

        {/* Estado de carga (solo en modo SERVER) */}
        {isServe && isLoading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <span className="ml-3 text-[var(--color-text-secondary)]">
              Cargando lista de espera...
            </span>
          </div>
        )}

        {/* Error de carga (solo en modo SERVER) */}
        {isServe && serverError && (
          <Card>
            <CardContent className="py-8 text-center">
              <div className="text-[var(--color-state-error-text)] mb-2">
                Error al cargar lista de espera
              </div>
              <p className="text-sm text-[var(--color-text-tertiary)] mb-4">
                {serverError instanceof Error ? serverError.message : String(serverError)}
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Filtro por recurso */}
        <Card>
          <CardHeader>
            <CardTitle>{t("filter_by_resource")}</CardTitle>
            <CardDescription>
              {t("filter_by_resource_desc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[250px]">
                <label className="block text-sm font-medium text-[var(--color-text-tertiary)] mb-2">
                  {t("resource")}
                </label>
                <Select
                  value={selectedResourceId}
                  onValueChange={setSelectedResourceId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_resource")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("all_resources")}</SelectItem>
                    {uniqueResources.map((res) => (
                      <SelectItem key={res.id} value={res.id}>
                        {res.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedResourceId("all")}
              >
                {t("clear_filters")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* WaitlistManager Organism */}
        <WaitlistManager
          entries={filteredEntries}
          stats={stats}
          onNotify={handleNotify}
          onAssign={handleAssign}
          onCancel={handleCancel}
        />

        {/* Información adicional */}
        <Card>
          <CardHeader>
            <CardTitle>{t("how_it_works")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
              <div className="flex items-start gap-2">
                <span className="text-brand-primary-400 font-bold">1.</span>
                <p>
                  <strong>{t("step_1_title")}</strong> {t("step_1_desc")}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-brand-primary-400 font-bold">2.</span>
                <p>
                  <strong>{t("step_2_title")}</strong> {t("step_2_desc")}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-brand-primary-400 font-bold">3.</span>
                <p>
                  <strong>{t("step_3_title")}</strong> {t("step_3_desc")}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-brand-primary-400 font-bold">4.</span>
                <p>
                  <strong>{t("step_4_title")}</strong> {t("step_4_desc")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
