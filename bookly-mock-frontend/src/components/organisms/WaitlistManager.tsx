/**
 * WaitlistManager - Gestor de Lista de Espera
 *
 * Muestra y gestiona entradas en lista de espera:
 * - Lista con posición en cola
 * - Filtros por estado y prioridad
 * - Acciones: notificar, asignar, cancelar
 * - Estadísticas de waitlist
 */

"use client";

import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Card, CardContent } from "@/components/atoms/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import type { WaitlistEntry, WaitlistStats } from "@/types/entities/waitlist";
import { Bell, CheckCircle, Clock, XCircle, Hourglass } from "lucide-react";
import React from "react";

interface WaitlistManagerProps {
  entries: WaitlistEntry[];
  stats?: WaitlistStats;
  onNotify?: (entryId: string) => void;
  onAssign?: (entryId: string) => void;
  onCancel?: (entryId: string) => void;
}

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  LOW: {
    label: "Baja",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700",
  },
  NORMAL: {
    label: "Normal",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
  },
  HIGH: {
    label: "Alta",
    className: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800",
  },
  URGENT: {
    label: "Urgente",
    className: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800",
  },
};

const STATUS_CONFIG: Record<string, { label: string; className: string; accent: string }> = {
  WAITING: {
    label: "En Espera",
    className: "bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
    accent: "border-l-amber-500",
  },
  NOTIFIED: {
    label: "Notificado",
    className: "bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800",
    accent: "border-l-blue-500",
  },
  ASSIGNED: {
    label: "Asignado",
    className: "bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800",
    accent: "border-l-green-500",
  },
  EXPIRED: {
    label: "Expirado",
    className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700",
    accent: "border-l-gray-400",
  },
  CANCELLED: {
    label: "Cancelado",
    className: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800",
    accent: "border-l-red-500",
  },
};

export function WaitlistManager({
  entries,
  stats,
  onNotify,
  onAssign,
  onCancel,
}: WaitlistManagerProps) {
  const [filterStatus, setFilterStatus] = React.useState<string>("all");
  const [filterPriority, setFilterPriority] = React.useState<string>("all");

  const filteredEntries = entries.filter((entry) => {
    if (filterStatus !== "all" && entry.status !== filterStatus) return false;
    if (filterPriority !== "all" && entry.priority !== filterPriority)
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-amber-500">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)] mb-0.5">
                    En Espera
                  </p>
                  <h3 className="text-2xl font-bold text-[var(--color-text-primary)] leading-none">
                    {stats.totalWaiting}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-green-500">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)] mb-0.5">
                    Asignados
                  </p>
                  <h3 className="text-2xl font-bold text-[var(--color-text-primary)] leading-none">
                    {stats.totalAssigned}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)] mb-0.5">
                    Notificados
                  </p>
                  <h3 className="text-2xl font-bold text-[var(--color-text-primary)] leading-none">
                    {stats.totalNotified}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-gray-400">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <Hourglass className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)] mb-0.5">
                    Expirados
                  </p>
                  <h3 className="text-2xl font-bold text-[var(--color-text-primary)] leading-none">
                    {stats.totalExpired}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-[var(--color-text-tertiary)] mb-2">
                Estado
              </label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="WAITING">En Espera</SelectItem>
                  <SelectItem value="NOTIFIED">Notificados</SelectItem>
                  <SelectItem value="ASSIGNED">Asignados</SelectItem>
                  <SelectItem value="EXPIRED">Expirados</SelectItem>
                  <SelectItem value="CANCELLED">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-[var(--color-text-tertiary)] mb-2">
                Prioridad
              </label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="LOW">Baja</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Entradas */}
      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-[var(--color-text-tertiary)]">
                No hay entradas en lista de espera
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => {
            const statusCfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.WAITING;
            const priorityCfg = PRIORITY_CONFIG[entry.priority] || PRIORITY_CONFIG.NORMAL;

            return (
              <Card
                key={entry.id}
                className={`hover:shadow-md transition-all duration-200 border-l-4 ${statusCfg.accent}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Posición y Usuario */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--color-action-primary)] text-white text-sm font-bold flex-shrink-0">
                          #{entry.position}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-[var(--color-text-primary)] truncate">
                            {entry.userName}
                          </div>
                          {entry.userEmail && (
                            <div className="text-sm text-[var(--color-text-secondary)] truncate">
                              {entry.userEmail}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Recurso y Fecha */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 pl-12">
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)] mb-1">
                            Recurso
                          </div>
                          <div className="text-sm font-medium text-[var(--color-text-primary)]">
                            {entry.resourceName}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)] mb-1">
                            Fecha Deseada
                          </div>
                          <div className="text-sm font-medium text-[var(--color-text-primary)]">
                            {new Date(entry.desiredDate).toLocaleDateString(
                              "es-ES",
                              { day: "2-digit", month: "short", year: "numeric" },
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)] mb-1">
                            Horario
                          </div>
                          <div className="text-sm font-medium text-[var(--color-text-primary)]">
                            {entry.startTime} - {entry.endTime}
                          </div>
                        </div>
                      </div>

                      {/* Razón */}
                      {entry.reason && (
                        <div className="mt-3 ml-12 px-3 py-2 bg-[var(--color-bg-muted)] rounded-md text-sm text-[var(--color-text-secondary)]">
                          {entry.reason}
                        </div>
                      )}

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mt-3 ml-12">
                        <Badge className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusCfg.className}`}>
                          {statusCfg.label}
                        </Badge>
                        <Badge className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${priorityCfg.className}`}>
                          {priorityCfg.label}
                        </Badge>
                        {entry.notificationSent && (
                          <Badge className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <Bell className="w-3 h-3 mr-1 inline" />
                            Notificado
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {entry.status === "WAITING" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            onClick={() => onNotify?.(entry.id)}
                          >
                            <Bell className="w-3.5 h-3.5" />
                            Notificar
                          </Button>
                          <Button
                            size="sm"
                            className="gap-1.5"
                            onClick={() => onAssign?.(entry.id)}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Asignar
                          </Button>
                        </>
                      )}
                      {(entry.status === "WAITING" ||
                        entry.status === "NOTIFIED") && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1.5"
                          onClick={() => onCancel?.(entry.id)}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
