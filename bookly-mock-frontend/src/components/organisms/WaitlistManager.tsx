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
import React from "react";

interface WaitlistManagerProps {
  entries: WaitlistEntry[];
  stats?: WaitlistStats;
  onNotify?: (entryId: string) => void;
  onAssign?: (entryId: string) => void;
  onCancel?: (entryId: string) => void;
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]",
  NORMAL: "bg-[var(--color-state-info-bg)] text-[var(--color-state-info-text)]",
  HIGH: "bg-[var(--color-state-warning-bg)] text-[var(--color-state-warning-text)]",
  URGENT:
    "bg-[var(--color-state-error-bg)] text-[var(--color-state-error-text)]",
};

const STATUS_COLORS: Record<string, string> = {
  WAITING:
    "bg-[var(--color-state-warning-bg)] text-[var(--color-state-warning-text)]",
  NOTIFIED:
    "bg-[var(--color-state-info-bg)] text-[var(--color-state-info-text)]",
  ASSIGNED:
    "bg-[var(--color-state-success-bg)] text-[var(--color-state-success-text)]",
  EXPIRED: "bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]",
  CANCELLED:
    "bg-[var(--color-state-error-bg)] text-[var(--color-state-error-text)]",
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-brand-primary-500/5 to-brand-primary-600/5 border-brand-primary-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-primary-600/80 mb-1">
                    En Espera
                  </p>
                  <h3 className="text-3xl font-black text-brand-primary-800 dark:text-brand-primary-200 leading-none">
                    {stats.totalWaiting}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-state-success-500/5 to-state-success-700/5 border-state-success-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-state-success-700/80 dark:text-state-success-200/80 mb-1">
                    Asignados
                  </p>
                  <h3 className="text-3xl font-black text-state-success-900 dark:text-state-success-200 leading-none">
                    {stats.totalAssigned}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-state-warning-500/5 to-state-warning-700/5 border-state-warning-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-state-warning-700/80 dark:text-state-warning-200/80 mb-1">
                    Notificados
                  </p>
                  <h3 className="text-3xl font-black text-state-warning-900 dark:text-state-warning-200 leading-none">
                    {stats.totalNotified}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-all duration-200 bg-gradient-to-br from-state-error-500/5 to-state-error-700/5 border-state-error-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-state-error-700/80 dark:text-state-error-200/80 mb-1">
                    Expirados
                  </p>
                  <h3 className="text-3xl font-black text-state-error-900 dark:text-state-error-200 leading-none">
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
          filteredEntries.map((entry) => (
            <Card
              key={entry.id}
              className="hover:border-[var(--color-action-primary)] transition-colors"
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Posición y Usuario */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-state-info-bg)] text-[var(--color-state-info-text)] font-bold">
                        #{entry.position}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {entry.userName}
                        </div>
                        <div className="text-sm text-[var(--color-text-tertiary)]">
                          {entry.userEmail}
                        </div>
                      </div>
                    </div>

                    {/* Recurso y Fecha */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                      <div>
                        <div className="text-xs text-[var(--color-text-tertiary)]">
                          Recurso
                        </div>
                        <div className="text-sm text-foreground">
                          {entry.resourceName}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--color-text-tertiary)]">
                          Fecha Deseada
                        </div>
                        <div className="text-sm text-foreground">
                          {new Date(entry.desiredDate).toLocaleDateString(
                            "es-ES",
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-[var(--color-text-tertiary)]">
                          Horario
                        </div>
                        <div className="text-sm text-foreground">
                          {entry.startTime} - {entry.endTime}
                        </div>
                      </div>
                    </div>

                    {/* Razón */}
                    {entry.reason && (
                      <div className="mt-3 p-2 bg-muted rounded text-sm text-foreground">
                        {entry.reason}
                      </div>
                    )}

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge className={STATUS_COLORS[entry.status]}>
                        {entry.status}
                      </Badge>
                      <Badge className={PRIORITY_COLORS[entry.priority]}>
                        {entry.priority}
                      </Badge>
                      {entry.notificationSent && (
                        <Badge className="bg-[var(--color-state-info-bg)] text-[var(--color-state-info-text)]">
                          Notificado
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col gap-2 ml-4">
                    {entry.status === "WAITING" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onNotify?.(entry.id)}
                        >
                          🔔 Notificar
                        </Button>
                        <Button size="sm" onClick={() => onAssign?.(entry.id)}>
                          ✅ Asignar
                        </Button>
                      </>
                    )}
                    {(entry.status === "WAITING" ||
                      entry.status === "NOTIFIED") && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onCancel?.(entry.id)}
                      >
                        ❌ Cancelar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
