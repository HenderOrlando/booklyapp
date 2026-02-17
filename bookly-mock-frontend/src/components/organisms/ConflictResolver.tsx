/**
 * ConflictResolver - Resolución de conflictos de disponibilidad
 *
 * Muestra conflictos detectados y permite resolverlos:
 * - Ver detalles del conflicto
 * - Sugerencias de resolución
 * - Recursos alternativos
 * - Horarios alternativos
 * - Acciones de resolución
 */

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
import { ButtonWithLoading } from "@/components/molecules/ButtonWithLoading";
import type {
  AvailabilityConflict,
  ConflictResolution,
  ResolveConflictDto,
} from "@/types/entities/conflict";
import React from "react";

interface ConflictResolverProps {
  conflict: AvailabilityConflict;
  onResolve: (data: ResolveConflictDto) => void;
  onClose: () => void;
  loading?: boolean;
}

const CONFLICT_TYPE_LABELS: Record<string, string> = {
  TIME_OVERLAP: "Superposición de horarios",
  RESOURCE_UNAVAILABLE: "Recurso no disponible",
  MAINTENANCE_SCHEDULED: "Mantenimiento programado",
  CAPACITY_EXCEEDED: "Capacidad excedida",
  PERMISSION_DENIED: "Permiso denegado",
  OUTSIDE_AVAILABILITY: "Fuera de horario disponible",
};

const SEVERITY_COLORS: Record<string, string> = {
  LOW: "bg-yellow-600",
  MEDIUM: "bg-orange-600",
  HIGH: "bg-red-600",
  CRITICAL: "bg-purple-600",
};

export function ConflictResolver({
  conflict,
  onResolve,
  onClose,
  loading = false,
}: ConflictResolverProps) {
  const [resolution, setResolution] =
    React.useState<ConflictResolution>("MANUAL");
  const [selectedResourceId, setSelectedResourceId] =
    React.useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = React.useState<{
    startTime: string;
    endTime: string;
  } | null>(null);
  const [notes, setNotes] = React.useState("");

  const handleResolve = () => {
    const data: ResolveConflictDto = {
      conflictId: conflict.id,
      resolution,
      notes,
    };

    if (resolution === "AUTO_REASSIGN" && selectedResourceId) {
      data.newResourceId = selectedResourceId;
    }

    if (selectedTimeSlot) {
      data.newStartTime = selectedTimeSlot.startTime;
      data.newEndTime = selectedTimeSlot.endTime;
    }

    onResolve(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[var(--color-bg-inverse)] rounded-lg">
        <div className="sticky top-0 bg-[var(--color-bg-inverse)] border-b border-[var(--color-border-strong)] p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Resolver Conflicto
              </h2>
              <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
                {CONFLICT_TYPE_LABELS[conflict.type]}
              </p>
            </div>
            <Badge className={SEVERITY_COLORS[conflict.severity]}>
              {conflict.severity}
            </Badge>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Detalles del conflicto */}
          <Card className="border-red-600">
            <CardHeader>
              <CardTitle>Detalles del Conflicto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-[var(--color-text-tertiary)]">Descripción</div>
                  <div className="text-white mt-1">{conflict.description}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-[var(--color-text-tertiary)]">Recurso</div>
                    <div className="text-white mt-1">
                      {conflict.resourceName}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-[var(--color-text-tertiary)]">Fecha</div>
                    <div className="text-white mt-1">
                      {new Date(conflict.date).toLocaleDateString("es-ES")}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-[var(--color-text-tertiary)]">Horario</div>
                    <div className="text-white mt-1">
                      {conflict.startTime} - {conflict.endTime}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tipo de resolución */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Seleccionar tipo de resolución
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["MANUAL", "AUTO_REASSIGN", "WAITLIST", "CANCEL"].map((res) => (
                <button
                  key={res}
                  type="button"
                  onClick={() => setResolution(res as ConflictResolution)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    resolution === res
                      ? "border-blue-600 bg-blue-900/20"
                      : "border-[var(--color-border-strong)] bg-[var(--color-bg-inverse)] hover:border-[var(--color-border-strong)]"
                  }`}
                >
                  <div className="text-sm font-medium text-white">
                    {res === "MANUAL" && "Manual"}
                    {res === "AUTO_REASSIGN" && "Reasignar"}
                    {res === "WAITLIST" && "Lista Espera"}
                    {res === "CANCEL" && "Cancelar"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Recursos alternativos */}
          {resolution === "AUTO_REASSIGN" && conflict.alternativeResources && (
            <Card>
              <CardHeader>
                <CardTitle>Recursos Alternativos</CardTitle>
                <CardDescription>
                  Selecciona un recurso alternativo para reasignar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {conflict.alternativeResources.map((alt) => (
                    <button
                      key={alt.resourceId}
                      type="button"
                      onClick={() => setSelectedResourceId(alt.resourceId)}
                      disabled={!alt.available}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedResourceId === alt.resourceId
                          ? "border-blue-600 bg-blue-900/20"
                          : alt.available
                            ? "border-[var(--color-border-strong)] bg-[var(--color-bg-inverse)] hover:border-[var(--color-border-strong)]"
                            : "border-[var(--color-border-strong)] bg-[var(--color-bg-inverse)] opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-white">
                          {alt.resourceName}
                        </span>
                        {alt.available ? (
                          <span className="px-2 py-1 bg-green-900 text-green-200 text-xs rounded">
                            Disponible
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-900 text-red-200 text-xs rounded">
                            No disponible
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Horarios alternativos */}
          {conflict.alternativeTimeSlots &&
            conflict.alternativeTimeSlots.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Horarios Alternativos</CardTitle>
                  <CardDescription>
                    Horarios disponibles para el mismo recurso y fecha
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {conflict.alternativeTimeSlots.map((slot, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedTimeSlot(slot)}
                        disabled={!slot.available}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedTimeSlot?.startTime === slot.startTime
                            ? "border-blue-600 bg-blue-900/20"
                            : slot.available
                              ? "border-[var(--color-border-strong)] bg-[var(--color-bg-inverse)] hover:border-[var(--color-border-strong)]"
                              : "border-[var(--color-border-strong)] bg-[var(--color-bg-inverse)] opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <div className="text-sm font-medium text-white text-center">
                          {slot.startTime} - {slot.endTime}
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Notas de resolución
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Agrega notas sobre cómo se resolvió el conflicto..."
              className="w-full px-3 py-2 bg-[var(--color-bg-inverse)] text-white rounded-lg resize-none"
              rows={3}
            />
          </div>

          {/* Resumen */}
          {(selectedResourceId || selectedTimeSlot) && (
            <Card className="border-blue-600">
              <CardHeader>
                <CardTitle>Resumen de Resolución</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-tertiary)]">Tipo:</span>
                    <span className="text-white font-medium">{resolution}</span>
                  </div>
                  {selectedResourceId && (
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-tertiary)]">Nuevo recurso:</span>
                      <span className="text-white">
                        {
                          conflict.alternativeResources?.find(
                            (a) => a.resourceId === selectedResourceId
                          )?.resourceName
                        }
                      </span>
                    </div>
                  )}
                  {selectedTimeSlot && (
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-tertiary)]">Nuevo horario:</span>
                      <span className="text-white">
                        {selectedTimeSlot.startTime} -{" "}
                        {selectedTimeSlot.endTime}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Botones */}
        <div className="sticky bottom-0 bg-[var(--color-bg-inverse)] border-t border-[var(--color-border-strong)] p-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <ButtonWithLoading
            onClick={handleResolve}
            isLoading={loading}
            loadingText="Resolviendo..."
          >
            Resolver Conflicto
          </ButtonWithLoading>
        </div>
      </div>
    </div>
  );
}
