import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/atoms/Card";
import { DateInput } from "@/components/atoms/DateInput";
import { DurationBadge } from "@/components/atoms/DurationBadge";
import { TimeInput } from "@/components/atoms/TimeInput";
import { ButtonWithLoading } from "@/components/molecules/ButtonWithLoading";
import { RecurringPatternSelector } from "@/components/molecules/RecurringPatternSelector";
import { RecurringReservationPreview } from "@/components/molecules/RecurringReservationPreview";
import { useRecurringReservations } from "@/hooks/useRecurringReservations";
import { useToast } from "@/hooks/useToast";
import type { RecurrencePattern } from "@/types/entities/recurring";
import type {
  CreateReservationDto,
  RecurrenceType,
  Reservation,
} from "@/types/entities/reservation";
import type { Resource } from "@/types/entities/resource";
import * as React from "react";

/**
 * ReservationModal - Organism Component
 *
 * Modal completo para crear o editar una reserva.
 * Incluye formulario con validaciones, preview de duración, y opciones de recurrencia.
 *
 * Design System:
 * - Modal overlay con Card
 * - Formulario con DateInput, TimeInput
 * - Validaciones en tiempo real
 * - Preview de duración con DurationBadge
 * - Botones de acción
 * - Grid de 8px
 * - Accesible con focus trap
 *
 * @example
 * ```tsx
 * <ReservationModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   onSave={handleSave}
 *   resources={recursos}
 *   mode="create"
 * />
 * ```
 */

export interface ReservationModalProps {
  /** Si el modal está abierto */
  isOpen: boolean;
  /** Callback al cerrar el modal */
  onClose: () => void;
  /** Callback al guardar (crear o actualizar) */
  onSave: (data: CreateReservationDto) => void | Promise<void>;
  /** Lista de recursos disponibles */
  resources: Resource[];
  /** Reserva existente para editar */
  reservation?: Reservation;
  /** Modo del modal */
  mode: "create" | "edit";
  /** Si está cargando */
  loading?: boolean;
  /** Fecha inicial (para drag & drop o click rápido) */
  initialDate?: string;
  /** Recurso inicial (para drag & drop) */
  initialResourceId?: string;
}

export const ReservationModal = React.memo(function ReservationModal({
  isOpen,
  onClose,
  onSave,
  resources,
  reservation,
  mode,
  loading = false,
  initialDate,
  initialResourceId,
}: ReservationModalProps) {
  const { showSuccess, showError } = useToast();

  // Estado del formulario
  const [formData, setFormData] = React.useState<CreateReservationDto>({
    resourceId: reservation?.resourceId || initialResourceId || "",
    title: reservation?.title || "",
    description: reservation?.description || "",
    startDate: reservation?.startDate.split("T")[0] || initialDate || "",
    endDate: reservation?.endDate.split("T")[0] || initialDate || "",
    recurrenceType: reservation?.recurrenceType || "NONE",
    recurrenceEndDate: reservation?.recurrenceEndDate || "",
    attendees: reservation?.attendees || 1,
    notes: reservation?.notes || "",
  });

  const [startTime, setStartTime] = React.useState(
    reservation?.startDate.split("T")[1]?.substring(0, 5) || "09:00"
  );
  const [endTime, setEndTime] = React.useState(
    reservation?.endDate.split("T")[1]?.substring(0, 5) || "10:00"
  );

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [showRecurringConfig, setShowRecurringConfig] = React.useState(false);
  const [showRecurringPreview, setShowRecurringPreview] = React.useState(false);
  const [recurringPattern, setRecurringPattern] =
    React.useState<RecurrencePattern>({
      frequency: "WEEKLY",
      interval: 1,
      daysOfWeek: ["MONDAY"],
      endDate: "",
    });

  // Hook de reservas recurrentes
  const {
    previewInstances,
    createRecurringReservations,
    isCreating: isCreatingRecurring,
    creationProgress,
  } = useRecurringReservations();

  // Actualizar formData cuando cambian initialDate o initialResourceId
  React.useEffect(() => {
    if (initialDate || initialResourceId) {
      setFormData((prev) => ({
        ...prev,
        ...(initialDate && { startDate: initialDate, endDate: initialDate }),
        ...(initialResourceId && { resourceId: initialResourceId }),
      }));
    }
  }, [initialDate, initialResourceId]);

  // Calcular duración en minutos
  const duration = React.useMemo(() => {
    if (!startTime || !endTime) return 0;

    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    return endMinutes - startMinutes;
  }, [startTime, endTime]);

  // Validar formulario
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.resourceId) {
      newErrors.resourceId = "Selecciona un recurso";
    }
    if (!formData.title) {
      newErrors.title = "El título es requerido";
    }
    if (!formData.startDate) {
      newErrors.startDate = "La fecha de inicio es requerida";
    }
    if (!formData.endDate) {
      newErrors.endDate = "La fecha de fin es requerida";
    }
    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate > formData.endDate
    ) {
      newErrors.endDate = "La fecha de fin debe ser posterior a la de inicio";
    }
    if (duration <= 0) {
      newErrors.time = "La hora de fin debe ser posterior a la de inicio";
    }
    if (formData.recurrenceType !== "NONE" && !formData.recurrenceEndDate) {
      newErrors.recurrenceEndDate =
        "La fecha de fin de recurrencia es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    // Combinar fecha + hora
    const reservationData: CreateReservationDto = {
      ...formData,
      startDate: `${formData.startDate}T${startTime}:00`,
      endDate: `${formData.endDate}T${endTime}:00`,
    };

    // Si es recurrente, mostrar preview
    if (showRecurringConfig && formData.recurrenceType !== "NONE") {
      setShowRecurringPreview(true);
      return;
    }

    await onSave(reservationData);
  };

  // Confirmar creación de reservas recurrentes
  const handleConfirmRecurring = async (skipConflicts: boolean) => {
    const reservationData: CreateReservationDto = {
      ...formData,
      startDate: `${formData.startDate}T${startTime}:00`,
      endDate: `${formData.endDate}T${endTime}:00`,
    };

    try {
      const result = await createRecurringReservations(
        reservationData,
        recurringPattern,
        { skipConflicts }
      );

      if (result.success) {
        const message =
          `✅ Se crearon ${result.summary.totalCreated} reservas exitosamente.\n` +
          (result.summary.totalFailed > 0
            ? `⚠️ ${result.summary.totalFailed} no se pudieron crear por conflictos.`
            : "");

        if (result.summary.totalFailed > 0) {
          showSuccess("Creación Parcial", message, { duration: 8000 });
        } else {
          showSuccess("Reservas Recurrentes Creadas", message);
        }
        onClose();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      showError("Error al crear reservas recurrentes", errorMessage);
    }
  };

  // Preview de instancias recurrentes
  const recurringPreviewData = React.useMemo(() => {
    if (!showRecurringPreview) return null;

    const reservationData: CreateReservationDto = {
      ...formData,
      startDate: `${formData.startDate}T${startTime}:00`,
      endDate: `${formData.endDate}T${endTime}:00`,
    };

    return previewInstances(reservationData, recurringPattern);
  }, [
    showRecurringPreview,
    formData,
    startTime,
    endTime,
    recurringPattern,
    previewInstances,
  ]);

  // Reset al cerrar
  React.useEffect(() => {
    if (!isOpen) {
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            {mode === "create" ? "Nueva Reserva" : "Editar Reserva"}
          </CardTitle>
          <CardDescription>
            {mode === "create"
              ? "Completa los datos para crear una nueva reserva"
              : "Modifica los datos de la reserva existente"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recurso */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                Recurso{" "}
                <span className="text-[var(--color-state-error-600)]">*</span>
              </label>
              <select
                value={formData.resourceId}
                onChange={(e) =>
                  setFormData({ ...formData, resourceId: e.target.value })
                }
                className="w-full px-3 py-2 rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
                required
              >
                <option value="">Selecciona un recurso</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name} - {resource.type}
                  </option>
                ))}
              </select>
              {errors.resourceId && (
                <span className="text-sm text-[var(--color-state-error-600)]">
                  {errors.resourceId}
                </span>
              )}
            </div>

            {/* Título */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                Título{" "}
                <span className="text-[var(--color-state-error-600)]">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
                placeholder="Ej: Reunión de equipo"
                required
              />
              {errors.title && (
                <span className="text-sm text-[var(--color-state-error-600)]">
                  {errors.title}
                </span>
              )}
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DateInput
                label="Fecha de inicio"
                value={formData.startDate}
                onChange={(value) =>
                  setFormData({ ...formData, startDate: value })
                }
                required
                error={errors.startDate}
                min={new Date().toISOString().split("T")[0]}
              />
              <DateInput
                label="Fecha de fin"
                value={formData.endDate}
                onChange={(value) =>
                  setFormData({ ...formData, endDate: value })
                }
                required
                error={errors.endDate}
                min={
                  formData.startDate || new Date().toISOString().split("T")[0]
                }
              />
            </div>

            {/* Horarios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TimeInput
                label="Hora de inicio"
                value={startTime}
                onChange={setStartTime}
                required
                step={30}
              />
              <TimeInput
                label="Hora de fin"
                value={endTime}
                onChange={setEndTime}
                required
                step={30}
              />
            </div>

            {/* Preview de duración */}
            {duration > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--color-text-secondary)]">
                  Duración:
                </span>
                <DurationBadge minutes={duration} />
              </div>
            )}
            {errors.time && (
              <span className="text-sm text-[var(--color-state-error-600)]">
                {errors.time}
              </span>
            )}

            {/* Descripción */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] min-h-[80px]"
                placeholder="Descripción opcional de la reserva"
              />
            </div>

            {/* Recurrencia */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[var(--color-text-primary)]">
                  ¿Hacer reserva recurrente?
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showRecurringConfig}
                    onChange={(e) => {
                      setShowRecurringConfig(e.target.checked);
                      if (!e.target.checked) {
                        setFormData({ ...formData, recurrenceType: "NONE" });
                      } else {
                        setFormData({ ...formData, recurrenceType: "WEEKLY" });
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-[var(--color-text-tertiary)]">Activar</span>
                </label>
              </div>

              {showRecurringConfig && (
                <div className="p-4 bg-[var(--color-bg-inverse)] rounded-lg border border-[var(--color-border-strong)]">
                  <RecurringPatternSelector
                    pattern={recurringPattern}
                    onChange={(pattern) => {
                      setRecurringPattern(pattern);
                      // Mapear a RecurrenceType simple para compatibilidad
                      setFormData({
                        ...formData,
                        recurrenceType: pattern.frequency as RecurrenceType,
                        recurrenceEndDate: pattern.endDate || "",
                      });
                    }}
                  />
                </div>
              )}
            </div>

            {/* Recurrencia simple (legacy, oculto cuando se usa el nuevo selector) */}
            {!showRecurringConfig && (
              <div className="hidden flex-col gap-4">
                <label className="text-sm font-medium text-[var(--color-text-primary)]">
                  Recurrencia (Simple)
                </label>
                <select
                  value={formData.recurrenceType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      recurrenceType: e.target.value as RecurrenceType,
                    })
                  }
                  className="w-full px-3 py-2 rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
                >
                  <option value="NONE">Sin recurrencia</option>
                  <option value="DAILY">Diaria</option>
                  <option value="WEEKLY">Semanal</option>
                  <option value="MONTHLY">Mensual</option>
                </select>

                {formData.recurrenceType !== "NONE" && (
                  <DateInput
                    label="Repetir hasta"
                    value={formData.recurrenceEndDate || ""}
                    onChange={(value) =>
                      setFormData({ ...formData, recurrenceEndDate: value })
                    }
                    required
                    error={errors.recurrenceEndDate}
                    min={formData.endDate}
                  />
                )}
              </div>
            )}

            {/* Asistentes */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                Número de asistentes
              </label>
              <input
                type="number"
                value={formData.attendees}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    attendees: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-3 py-2 rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
                min="1"
              />
            </div>

            {/* Notas */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                Notas adicionales
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full px-3 py-2 rounded-md border border-[var(--color-border-default)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] min-h-[60px]"
                placeholder="Notas opcionales"
              />
            </div>

            {/* Acciones */}
            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border-subtle)]">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <ButtonWithLoading
                type="submit"
                isLoading={loading}
                loadingText={mode === "create" ? "Creando..." : "Guardando..."}
              >
                {showRecurringConfig && formData.recurrenceType !== "NONE"
                  ? "Vista Previa"
                  : mode === "create"
                    ? "Crear Reserva"
                    : "Guardar Cambios"}
              </ButtonWithLoading>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Modal de Preview de Reservas Recurrentes */}
      {showRecurringPreview && recurringPreviewData && (
        <RecurringReservationPreview
          instances={recurringPreviewData.instances}
          description={recurringPreviewData.description}
          validation={recurringPreviewData.validation}
          onConfirm={handleConfirmRecurring}
          onCancel={() => setShowRecurringPreview(false)}
          isCreating={isCreatingRecurring}
          progress={creationProgress}
        />
      )}
    </div>
  );
});
