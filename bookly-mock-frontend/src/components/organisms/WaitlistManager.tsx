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
  LOW: "bg-gray-600",
  NORMAL: "bg-blue-600",
  HIGH: "bg-orange-600",
  URGENT: "bg-red-600",
};

const STATUS_COLORS: Record<string, string> = {
  WAITING: "bg-yellow-600",
  NOTIFIED: "bg-blue-600",
  ASSIGNED: "bg-green-600",
  EXPIRED: "bg-gray-600",
  CANCELLED: "bg-red-600",
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-white">
                {stats.totalWaiting}
              </div>
              <div className="text-sm text-gray-400">En Espera</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-white">
                {stats.totalNotified}
              </div>
              <div className="text-sm text-gray-400">Notificados</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-white">
                {stats.totalAssigned}
              </div>
              <div className="text-sm text-gray-400">Asignados</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-white">
                {stats.averageWaitTime.toFixed(1)}d
              </div>
              <div className="text-sm text-gray-400">Tiempo Promedio</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Estado
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-gray-700 text-white rounded-lg"
              >
                <option value="all">Todos</option>
                <option value="WAITING">En Espera</option>
                <option value="NOTIFIED">Notificados</option>
                <option value="ASSIGNED">Asignados</option>
                <option value="EXPIRED">Expirados</option>
                <option value="CANCELLED">Cancelados</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Prioridad
              </label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 bg-gray-700 text-white rounded-lg"
              >
                <option value="all">Todas</option>
                <option value="LOW">Baja</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Entradas */}
      <div className="space-y-3">
        {filteredEntries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-gray-400">
                No hay entradas en lista de espera
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => (
            <Card
              key={entry.id}
              className="hover:border-blue-600 transition-colors"
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Posición y Usuario */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-900 text-blue-200 font-bold">
                        #{entry.position}
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {entry.userName}
                        </div>
                        <div className="text-sm text-gray-400">
                          {entry.userEmail}
                        </div>
                      </div>
                    </div>

                    {/* Recurso y Fecha */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                      <div>
                        <div className="text-xs text-gray-400">Recurso</div>
                        <div className="text-sm text-white">
                          {entry.resourceName}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">
                          Fecha Deseada
                        </div>
                        <div className="text-sm text-white">
                          {new Date(entry.desiredDate).toLocaleDateString(
                            "es-ES"
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Horario</div>
                        <div className="text-sm text-white">
                          {entry.startTime} - {entry.endTime}
                        </div>
                      </div>
                    </div>

                    {/* Razón */}
                    {entry.reason && (
                      <div className="mt-3 p-2 bg-gray-800 rounded text-sm text-gray-300">
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
                        <Badge className="bg-purple-600">Notificado</Badge>
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
