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
import { AppHeader } from "@/components/organisms/AppHeader";
import { AppSidebar } from "@/components/organisms/AppSidebar";
import { WaitlistManager } from "@/components/organisms/WaitlistManager";
import { MainLayout } from "@/components/templates/MainLayout";
import {
  useAcceptWaitlistOffer,
  useNotifyWaitlist,
  useRemoveFromWaitlist,
  waitlistKeys,
} from "@/hooks/mutations";
import type { WaitlistEntry, WaitlistStats } from "@/types/entities/waitlist";
import { useQuery } from "@tanstack/react-query";
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

// Mock data temporales (luego vendrán del backend)
const getMockWaitlistData = () => ({
  entries: [
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
  ] as WaitlistEntry[],
  stats: {
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
  } as WaitlistStats,
});

export default function ListaEsperaPage() {
  const t = useTranslations("waitlist");
  const [selectedResourceId, setSelectedResourceId] =
    React.useState<string>("all");

  // React Query para cargar datos de waitlist
  const { data: waitlistData } = useQuery({
    queryKey: waitlistKeys.lists(),
    queryFn: async () => getMockWaitlistData(),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  const mockEntries = waitlistData?.entries || [];
  const mockStats = waitlistData?.stats || {
    totalWaiting: 0,
    totalNotified: 0,
    totalAssigned: 0,
    totalExpired: 0,
    averageWaitTime: 0,
    byPriority: { low: 0, normal: 0, high: 0, urgent: 0 },
  };

  // Mutations
  const notifyEntry = useNotifyWaitlist();
  const assignEntry = useAcceptWaitlistOffer();
  const removeEntry = useRemoveFromWaitlist();

  // Filtrar por recurso
  const filteredEntries =
    selectedResourceId === "all"
      ? mockEntries
      : mockEntries.filter((e) => e.resourceId === selectedResourceId);

  const handleNotify = (entryId: string) => {
    // Obtener entrada para extraer datos del recurso
    const entry = mockEntries.find((e) => e.id === entryId);
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
          alert(`Notificación enviada a usuario de entrada ${entryId}`);
        },
        onError: (error: any) => {
          console.error("Error al notificar:", error);
          alert("Error al enviar notificación");
        },
      },
    );
  };

  const handleAssign = (entryId: string) => {
    assignEntry.mutate(entryId, {
      onSuccess: () => {
        alert(`Recurso asignado para entrada ${entryId}`);
      },
      onError: (error: any) => {
        console.error("Error al asignar:", error);
        alert("Error al asignar recurso");
      },
    });
  };

  const handleCancel = (entryId: string) => {
    if (confirm("¿Estás seguro de cancelar esta entrada de lista de espera?")) {
      removeEntry.mutate(entryId, {
        onSuccess: () => {
          alert(`Entrada ${entryId} cancelada`);
        },
        onError: (error: any) => {
          console.error("Error al cancelar:", error);
          alert("Error al cancelar entrada");
        },
      });
    }
  };

  const header = <AppHeader title="Lista de Espera" />;
  const sidebar = <AppSidebar />;

  return (
    <MainLayout>
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
                Gestión de Lista de Espera
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Administra las solicitudes en lista de espera. Los usuarios son
                ordenados por prioridad y tiempo de solicitud. Cuando un recurso
                se libera, puedes notificar y asignar automáticamente al primero
                en la cola.
              </p>
            </div>
          </div>
        </div>

        {/* Filtro por recurso */}
        <Card>
          <CardHeader>
            <CardTitle>Filtrar por Recurso</CardTitle>
            <CardDescription>
              Selecciona un recurso específico para ver su lista de espera
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[250px]">
                <label className="block text-sm font-medium text-[var(--color-text-tertiary)] mb-2">
                  Recurso
                </label>
                <Select
                  value={selectedResourceId}
                  onValueChange={setSelectedResourceId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un recurso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los recursos</SelectItem>
                    <SelectItem value="res_1">Aula 101</SelectItem>
                    <SelectItem value="res_2">Laboratorio 3</SelectItem>
                    <SelectItem value="res_3">Auditorio Principal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedResourceId("all")}
              >
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* WaitlistManager Organism */}
        <WaitlistManager
          entries={filteredEntries}
          stats={mockStats}
          onNotify={handleNotify}
          onAssign={handleAssign}
          onCancel={handleCancel}
        />

        {/* Información adicional */}
        <Card>
          <CardHeader>
            <CardTitle>¿Cómo funciona la lista de espera?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
              <div className="flex items-start gap-2">
                <span className="text-brand-primary-400 font-bold">1.</span>
                <p>
                  <strong>Usuario solicita recurso ocupado:</strong> Se agrega
                  automáticamente a la lista de espera con su posición en la
                  cola.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-brand-primary-400 font-bold">2.</span>
                <p>
                  <strong>Ordenamiento por prioridad:</strong> URGENT {">"} HIGH{" "}
                  {">"} NORMAL {">"} LOW, con el tiempo de solicitud como
                  segundo criterio.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-brand-primary-400 font-bold">3.</span>
                <p>
                  <strong>Recurso se libera:</strong> El sistema notifica
                  automáticamente al primero en la cola (#1).
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-brand-primary-400 font-bold">4.</span>
                <p>
                  <strong>Usuario acepta/rechaza:</strong> Si acepta, se crea la
                  reserva. Si rechaza o no responde en 24h, se notifica al
                  siguiente (#2).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
