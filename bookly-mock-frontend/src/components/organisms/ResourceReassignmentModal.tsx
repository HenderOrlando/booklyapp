/**
 * ResourceReassignmentModal - Modal para reasignar recurso de una reserva
 *
 * Permite:
 * - Seleccionar nuevo recurso
 * - Ver sugerencias de recursos similares
 * - Especificar razón de reasignación
 * - Cambiar horario si es necesario
 * - Preview de cambios
 */

"use client";

import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { Input } from "@/components/atoms/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import { ButtonWithLoading } from "@/components/molecules/ButtonWithLoading";
import type {
  ReassignmentReason,
  ReassignmentSuggestion,
  RequestReassignmentDto,
} from "@/types/entities/reassignment";
import type { Reservation } from "@/types/entities/reservation";
import React from "react";

interface ResourceReassignmentModalProps {
  reservation: Reservation;
  suggestions: ReassignmentSuggestion[];
  onSubmit: (data: RequestReassignmentDto) => void;
  onClose: () => void;
  loading?: boolean;
}

const REASSIGNMENT_REASONS: Array<{
  value: ReassignmentReason;
  label: string;
}> = [
  { value: "CONFLICT", label: "Conflicto de horario" },
  { value: "MAINTENANCE", label: "Mantenimiento programado" },
  { value: "UPGRADE", label: "Actualización de recurso" },
  { value: "USER_REQUEST", label: "Solicitud del usuario" },
  { value: "ADMINISTRATIVE", label: "Razón administrativa" },
  { value: "EMERGENCY", label: "Emergencia" },
];

export function ResourceReassignmentModal({
  reservation,
  suggestions,
  onSubmit,
  onClose,
  loading = false,
}: ResourceReassignmentModalProps) {
  const [selectedResourceId, setSelectedResourceId] =
    React.useState<string>("");
  const [reason, setReason] =
    React.useState<ReassignmentReason>("ADMINISTRATIVE");
  const [reasonDetails, setReasonDetails] = React.useState("");
  const [changeTime, setChangeTime] = React.useState(false);

  // Extraer time de startDate/endDate (formato: "2024-01-15T14:00:00")
  const currentStartTime =
    reservation.startDate.split("T")[1]?.substring(0, 5) || "09:00";
  const currentEndTime =
    reservation.endDate.split("T")[1]?.substring(0, 5) || "10:00";

  const [newStartTime, setNewStartTime] = React.useState(currentStartTime);
  const [newEndTime, setNewEndTime] = React.useState(currentEndTime);
  const [notifyUser, setNotifyUser] = React.useState(true);

  const selectedResource = suggestions.find(
    (s) => s.resourceId === selectedResourceId,
  );
  const sortedSuggestions = [...suggestions].sort(
    (a, b) => b.matchScore - a.matchScore,
  );

  const handleSubmit = () => {
    if (!selectedResourceId) return;

    const data: RequestReassignmentDto = {
      reservationId: reservation.id,
      newResourceId: selectedResourceId,
      reason,
      reasonDetails,
      notifyUser,
    };

    if (changeTime) {
      data.newStartTime = newStartTime;
      data.newEndTime = newEndTime;
    }

    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[var(--color-bg-inverse)] rounded-lg">
        <div className="sticky top-0 bg-[var(--color-bg-inverse)] border-b border-[var(--color-border-strong)] p-6">
          <h2 className="text-2xl font-bold text-foreground">
            Reasignar Recurso
          </h2>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
            Cambiar el recurso asignado a esta reserva
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Recurso actual */}
          <Card>
            <CardHeader>
              <CardTitle>Recurso Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">
                    {reservation.resourceName}
                  </div>
                  <div className="text-sm text-[var(--color-text-tertiary)] mt-1">
                    {new Date(reservation.startDate).toLocaleDateString(
                      "es-ES",
                    )}{" "}
                    • {currentStartTime} - {currentEndTime}
                  </div>
                </div>
                <div className="px-3 py-1 bg-[var(--color-state-error-bg)] text-[var(--color-state-error-text)] rounded-full text-sm">
                  A reasignar
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Razón */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Razón de reasignación{" "}
              <span className="text-[var(--color-state-error-text)]">*</span>
            </label>
            <Select
              value={reason}
              onValueChange={(v) => setReason(v as ReassignmentReason)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REASSIGNMENT_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Detalles adicionales
            </label>
            <textarea
              value={reasonDetails}
              onChange={(e) => setReasonDetails(e.target.value)}
              placeholder="Explica el motivo de la reasignación..."
              className="w-full px-3 py-2 bg-[var(--color-bg-inverse)] text-foreground rounded-lg resize-none"
              rows={3}
            />
          </div>

          {/* Sugerencias de recursos */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Seleccionar nuevo recurso{" "}
              <span className="text-[var(--color-state-error-text)]">*</span>
            </label>
            <div className="space-y-2">
              {sortedSuggestions.map((suggestion) => (
                <button
                  key={suggestion.resourceId}
                  type="button"
                  onClick={() => setSelectedResourceId(suggestion.resourceId)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedResourceId === suggestion.resourceId
                      ? "border-[var(--color-action-primary)] bg-[var(--color-state-info-bg)]"
                      : "border-[var(--color-border-strong)] bg-[var(--color-bg-inverse)] hover:border-[var(--color-border-strong)]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-foreground">
                          {suggestion.resourceName}
                        </span>
                        <span className="px-2 py-1 bg-[var(--color-bg-elevated)] text-xs rounded">
                          {suggestion.resourceType}
                        </span>
                        {!suggestion.available && (
                          <span className="px-2 py-1 bg-[var(--color-state-error-bg)] text-[var(--color-state-error-text)] text-xs rounded">
                            No disponible
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-[var(--color-text-tertiary)] mt-1">
                        {suggestion.location} • Capacidad: {suggestion.capacity}
                      </div>
                      {/* Match score */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[var(--color-state-success-border)] to-[var(--color-action-primary)]"
                            style={{ width: `${suggestion.matchScore}%` }}
                          />
                        </div>
                        <span className="text-xs text-[var(--color-text-tertiary)]">
                          {suggestion.matchScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Cambiar horario */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={changeTime}
                onChange={(e) => setChangeTime(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-foreground">
                También cambiar horario
              </span>
            </label>

            {changeTime && (
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-sm text-[var(--color-text-tertiary)] mb-1">
                    Hora inicio
                  </label>
                  <Input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--color-text-tertiary)] mb-1">
                    Hora fin
                  </label>
                  <Input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notificar usuario */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={notifyUser}
                onChange={(e) => setNotifyUser(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-foreground">
                Notificar al usuario sobre el cambio
              </span>
            </label>
          </div>

          {/* Preview */}
          {selectedResource && (
            <Card className="border-[var(--color-action-primary)]">
              <CardHeader>
                <CardTitle>Vista Previa de Cambios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-tertiary)]">
                      Recurso:
                    </span>
                    <span className="text-foreground">
                      {reservation.resourceName} →{" "}
                      <strong>{selectedResource.resourceName}</strong>
                    </span>
                  </div>
                  {changeTime && (
                    <div className="flex justify-between">
                      <span className="text-[var(--color-text-tertiary)]">
                        Horario:
                      </span>
                      <span className="text-foreground">
                        {currentStartTime}-{currentEndTime} →{" "}
                        <strong>
                          {newStartTime}-{newEndTime}
                        </strong>
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[var(--color-text-tertiary)]">
                      Notificación:
                    </span>
                    <span className="text-foreground">
                      {notifyUser ? "Sí" : "No"}
                    </span>
                  </div>
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
            onClick={handleSubmit}
            disabled={!selectedResourceId}
            isLoading={loading}
            loadingText="Solicitando..."
          >
            Solicitar Reasignación
          </ButtonWithLoading>
        </div>
      </div>
    </div>
  );
}
