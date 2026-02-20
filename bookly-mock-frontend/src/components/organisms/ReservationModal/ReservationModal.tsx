import { Button } from "@/components/atoms/Button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/atoms/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/atoms/Dialog";
import { DateInput } from "@/components/atoms/DateInput";
import { DurationBadge } from "@/components/atoms/DurationBadge";
import { TimeInput } from "@/components/atoms/TimeInput";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { ButtonWithLoading } from "@/components/molecules/ButtonWithLoading";
import { RecurringPatternSelector } from "@/components/molecules/RecurringPatternSelector";
import { RecurringReservationPreview } from "@/components/molecules/RecurringReservationPreview";
import { useRecurringReservations } from "@/hooks/useRecurringReservations";
import { useToast } from "@/hooks/useToast";
import { useTranslations } from "next-intl";
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
  const { showError } = useToast();
  const t = useTranslations("reservations.modal");

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
      newErrors.resourceId = t("errors.resource_required");
    }
    if (!formData.title) {
      newErrors.title = t("errors.title_required");
    }
    if (!formData.startDate) {
      newErrors.startDate = t("errors.start_date_required");
    }
    if (!formData.endDate) {
      newErrors.endDate = t("errors.end_date_required");
    }
    if (
      formData.startDate &&
      formData.endDate &&
      formData.startDate > formData.endDate
    ) {
      newErrors.endDate = t("errors.end_date_after_start");
    }
    if (duration <= 0) {
      newErrors.time = t("errors.end_time_after_start");
    }
    if (formData.recurrenceType !== "NONE" && !formData.recurrenceEndDate) {
      newErrors.recurrenceEndDate = t("errors.recurrence_end_required");
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
        const message = t("recurring_preview.success_message", {
          total: result.summary.totalCreated,
        });
        showSuccess(t("recurring_preview.success_title"), message);
        onClose();
      }
    } catch (error) {
      showError(
        t("errors.recurring_creation_failed"),
        error instanceof Error ? error.message : t("errors.unknown_error")
      );
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0 border-none bg-transparent shadow-none">
        <Card className="w-full h-full border-none shadow-none">
          <CardHeader>
            <DialogTitle className="text-2xl">
              {mode === "create" ? t("title_create") : t("title_edit")}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? t("description_create")
                : t("description_edit")}
            </DialogDescription>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Sección: Información Principal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <Label required htmlFor="resource">
                    {t("resource_label")}
                  </Label>
                  <Select
                    value={formData.resourceId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, resourceId: value })
                    }
                  >
                    <SelectTrigger
                      id="resource"
                      error={errors.resourceId}
                      aria-label={t("resource_placeholder")}
                    >
                      <SelectValue placeholder={t("resource_placeholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {resources.map((resource) => (
                        <SelectItem key={resource.id} value={resource.id}>
                          {resource.name} - {resource.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.resourceId && (
                    <span className="text-xs text-[var(--color-state-error-text)]">
                      {errors.resourceId}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label required htmlFor="title">
                    {t("title_label")}
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder={t("title_placeholder")}
                    error={errors.title}
                    required
                  />
                </div>
              </div>

              {/* Sección: Fechas y Horarios */}
              <div className="bg-[var(--color-bg-primary)]/30 p-4 rounded-lg border border-[var(--color-border-subtle)] space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DateInput
                    label={t("start_date_label")}
                    value={formData.startDate}
                    onChange={(value) =>
                      setFormData({ ...formData, startDate: value })
                    }
                    required
                    error={errors.startDate}
                    min={new Date().toISOString().split("T")[0]}
                  />
                  <DateInput
                    label={t("end_date_label")}
                    value={formData.endDate}
                    onChange={(value) =>
                      setFormData({ ...formData, endDate: value })
                    }
                    required
                    error={errors.endDate}
                    min={
                      formData.startDate ||
                      new Date().toISOString().split("T")[0]
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TimeInput
                    label={t("start_time_label")}
                    value={startTime}
                    onChange={setStartTime}
                    required
                    step={30}
                  />
                  <TimeInput
                    label={t("end_time_label")}
                    value={endTime}
                    onChange={setEndTime}
                    required
                    step={30}
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border-subtle)]/50">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                      {t("total_time_label")}
                    </span>
                    {duration > 0 ? (
                      <DurationBadge minutes={duration} />
                    ) : (
                      <span className="text-sm text-[var(--color-state-error-text)]">
                        {t("invalid_time")}
                      </span>
                    )}
                  </div>
                  {errors.time && (
                    <span className="text-sm text-[var(--color-state-error-text)] font-medium">
                      {errors.time}
                    </span>
                  )}
                </div>
              </div>

              {/* Sección: Detalles */}
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="description">{t("description_label")}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder={t("description_placeholder")}
                    className="min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="attendees">{t("attendees_label")}</Label>
                    <Input
                      id="attendees"
                      type="number"
                      value={formData.attendees}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          attendees: parseInt(e.target.value) || 1,
                        })
                      }
                      min="1"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="notes">{t("notes_label")}</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      placeholder={t("notes_placeholder")}
                      className="min-h-[40px]"
                    />
                  </div>
                </div>
              </div>

              {/* Sección: Recurrencia */}
              <div className="rounded-xl border border-[var(--color-border-subtle)] overflow-hidden">
                <div
                  className={cn(
                    "flex items-center justify-between p-4 transition-colors",
                    showRecurringConfig
                      ? "bg-brand-primary-500/5 border-b border-[var(--color-border-subtle)]"
                      : "bg-[var(--color-bg-surface)]"
                  )}
                >
                  <div className="flex flex-col">
                    <Label
                      htmlFor="recurring-toggle"
                      className="text-base font-semibold cursor-pointer"
                    >
                      {t("recurring_section_title")}
                    </Label>
                    <span className="text-xs text-[var(--color-text-tertiary)]">
                      {t("recurring_section_desc")}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="recurring-toggle"
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
                      className="sr-only peer"
                      aria-label={t("recurring_toggle_aria")}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {showRecurringConfig && (
                  <div className="p-6 bg-brand-primary-500/[0.02] animate-in fade-in slide-in-from-top-2 duration-300">
                    <RecurringPatternSelector
                      pattern={recurringPattern}
                      onChange={(pattern) => {
                        setRecurringPattern(pattern);
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

              {/* Acciones */}
              <div className="flex justify-end gap-4 pt-6 border-t border-[var(--color-border-subtle)]">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={loading}
                  className="px-8"
                >
                  {t("cancel_btn")}
                </Button>
                <ButtonWithLoading
                  type="submit"
                  isLoading={loading}
                  loadingText={mode === "create" ? t("processing") : t("saving")}
                  className="px-8 min-w-[160px]"
                >
                  {showRecurringConfig && formData.recurrenceType !== "NONE"
                    ? t("recurring_summary_btn")
                    : mode === "create"
                    ? t("confirm_create_btn")
                    : t("confirm_edit_btn")}
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
      </DialogContent>
    </Dialog>
  );
});
