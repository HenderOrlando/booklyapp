"use client";

import { Button } from "@/components/atoms/Button";
import { RescheduleConfirmModal } from "@/components/molecules/RescheduleConfirmModal";
import { CalendarView } from "@/components/organisms/CalendarView";
import { ReservationModal } from "@/components/organisms/ReservationModal";
import { ResourceFilterPanel } from "@/components/organisms/ResourceFilterPanel";
import { MainLayout } from "@/components/templates/MainLayout";
import { useCreateReservation, useUpdateReservation } from "@/hooks/mutations";
import { useReservations } from "@/hooks/useReservations";
import { useResources } from "@/hooks/useResources";
import { useRouter } from "@/i18n/navigation";
import type { CalendarEvent } from "@/types/calendar";
import type {
  CreateReservationDto,
  Reservation,
} from "@/types/entities/reservation";
import { Resource } from "@/types/entities/resource";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Página de Calendario - Bookly
 *
 * Vista principal de calendario con:
 * - 3 vistas (Mes/Semana/Día)
 * - Visualización de reservas
 * - Filtros por recurso, usuario, estado
 * - Botón rápido para crear reserva
 */

export default function CalendarioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("calendar");
  const tReservations = useTranslations("reservations");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [initialResourceId, setInitialResourceId] = useState<
    string | undefined
  >();
  const [selectedResourceIds, setSelectedResourceIds] = useState<string[]>([]);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [draggedResource, setDraggedResource] = useState<Resource | null>(null);

  // Estado para reasignación de eventos
  const [eventToReschedule, setEventToReschedule] = useState<{
    event: CalendarEvent;
    newDate: Date;
  } | null>(null);
  const [rescheduleConflicts, setRescheduleConflicts] = useState<Reservation[]>(
    [],
  );

  // Leer query params y abrir modal si vienen date y resourceId
  useEffect(() => {
    const date = searchParams.get("date");
    const resourceId = searchParams.get("resourceId");

    if (date || resourceId) {
      if (date) setSelectedDate(date);
      if (resourceId) setInitialResourceId(resourceId);
      setIsModalOpen(true);

      // Limpiar query params
      router.replace("/calendario", { scroll: false });
    }
  }, [searchParams, router]);

  const createReservation = useCreateReservation();
  const updateReservation = useUpdateReservation();
  const { data: resourcesData } = useResources();
  const { data: reservationsData } = useReservations();
  const allResources = resourcesData?.items || [];

  // Handlers del modal
  const handleOpenModal = (date?: Date) => {
    if (date) {
      setSelectedDate(date.toISOString().split("T")[0]);
    } else {
      setSelectedDate(undefined);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(undefined);
    setInitialResourceId(undefined);
  };

  const handleSaveReservation = async (data: CreateReservationDto) => {
    createReservation.mutate(data, {
      onSuccess: () => {
        handleCloseModal();
      },
      onError: (error) => {
        console.error("Error al crear reserva:", error);
      },
    });
  };

  // Handlers del panel de recursos
  const handleResourceToggle = (resourceId: string) => {
    setSelectedResourceIds((prev) =>
      prev.includes(resourceId)
        ? prev.filter((id) => id !== resourceId)
        : [...prev, resourceId],
    );
  };

  const handleClearAll = () => {
    setSelectedResourceIds([]);
  };

  const handleSelectAll = () => {
    setSelectedResourceIds(allResources.map((r: any) => r.id));
  };

  // Handlers para Drag & Drop de recursos
  const handleResourceDragStart = (resource: Resource) => {
    setDraggedResource(resource);
  };

  const handleResourceDragEnd = () => {
    setDraggedResource(null);
  };

  const handleDayDrop = (date: Date) => {
    if (draggedResource) {
      setSelectedDate(date.toISOString().split("T")[0]);
      setInitialResourceId(draggedResource.id);
      setIsModalOpen(true);
      setDraggedResource(null);
    }
  };

  // Handler para drag & drop de eventos (reasignación)
  const handleEventDrop = async (event: CalendarEvent, newDate: Date) => {
    const newStart = new Date(newDate);
    newStart.setHours(event.start.getHours(), event.start.getMinutes(), 0, 0);

    const duration = event.end.getTime() - event.start.getTime();
    const newEnd = new Date(newStart.getTime() + duration);

    // Validar conflictos
    const conflicts = checkConflicts(
      event.resourceId,
      newStart.toISOString(),
      newEnd.toISOString(),
      event.id,
    );

    if (conflicts.length > 0) {
      setEventToReschedule({ event, newDate });
      setRescheduleConflicts(conflicts);
      return;
    }

    await performReschedule(event.id, newStart, newEnd);
  };

  const checkConflicts = (
    resourceId: string,
    startDate: string,
    endDate: string,
    excludeId: string,
  ): Reservation[] => {
    if (!reservationsData?.items) return [];

    const start = new Date(startDate);
    const end = new Date(endDate);

    return reservationsData.items.filter((r) => {
      if (r.id === excludeId || r.resourceId !== resourceId) return false;
      if (
        r.status === "CANCELLED" ||
        r.status === "REJECTED" ||
        r.status === "COMPLETED"
      )
        return false;

      const resStart = new Date(r.startDate);
      const resEnd = new Date(r.endDate);

      return (
        (start >= resStart && start < resEnd) ||
        (end > resStart && end <= resEnd) ||
        (start <= resStart && end >= resEnd)
      );
    });
  };

  const performReschedule = async (
    eventId: string,
    newStart: Date,
    newEnd: Date,
  ) => {
    try {
      await updateReservation.mutateAsync({
        id: eventId,
        data: {
          startDate: newStart.toISOString(),
          endDate: newEnd.toISOString(),
        },
      });
    } catch (error) {
      console.error("Error al reasignar evento:", error);
      alert(t("reschedule_error"));
    }
  };

  const handleConfirmReschedule = async (force: boolean) => {
    if (!eventToReschedule) return;

    const { event, newDate } = eventToReschedule;
    const newStart = new Date(newDate);
    newStart.setHours(event.start.getHours(), event.start.getMinutes(), 0, 0);

    const duration = event.end.getTime() - event.start.getTime();
    const newEnd = new Date(newStart.getTime() + duration);

    if (force) {
      await performReschedule(event.id, newStart, newEnd);
    }

    setEventToReschedule(null);
  };

  const handleCancelReschedule = () => {
    setEventToReschedule(null);
    setRescheduleConflicts([]);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
              {t("title")}
            </h1>
            <p className="text-[var(--color-text-secondary)] mt-1">
              {t("description")}
            </p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            {t("create_reservation")}
          </Button>
        </div>

        <div className="bg-brand-primary-900/20 border border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-brand-primary-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-semibold text-brand-primary-300 mb-1">
                {t("view_title")}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {t("view_desc")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-6 relative">
          <div
            className={`transition-all duration-300 \${
              isPanelOpen ? "w-80" : "w-0"
            } overflow-hidden flex-shrink-0`}
          >
            {isPanelOpen && (
              <ResourceFilterPanel
                selectedResourceIds={selectedResourceIds}
                onResourceToggle={handleResourceToggle}
                onClearAll={handleClearAll}
                onSelectAll={handleSelectAll}
                onDragStart={handleResourceDragStart}
                onDragEnd={handleResourceDragEnd}
                className="sticky top-4"
              />
            )}
          </div>

          <button
            onClick={() => setIsPanelOpen(!isPanelOpen)}
            className="absolute left-0 top-4 z-10 bg-[var(--color-bg-primary)] hover:bg-[var(--color-bg-tertiary)] text-foreground p-2 rounded-r-lg border-l-0 border border-[var(--color-border-strong)] transition-all shadow-lg"
            style={{ left: isPanelOpen ? "320px" : "0px" }}
            title={isPanelOpen ? t("panel.hide") : t("panel.show")}
          >
            {isPanelOpen ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <CalendarView
              onEventClick={(reservation) =>
                router.push(\`/reservas/\${reservation.id}\`)
              }
              onDateClick={handleOpenModal}
              onDayDrop={handleDayDrop}
              onEventDrop={handleEventDrop}
              draggedResource={draggedResource}
              resourceId={
                selectedResourceIds.length === 1
                  ? selectedResourceIds[0]
                  : undefined
              }
            />
          </div>
        </div>

        <ReservationModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveReservation}
          resources={allResources as any}
          mode="create"
          loading={createReservation.isPending}
          initialDate={selectedDate}
          initialResourceId={initialResourceId}
        />

        <RescheduleConfirmModal
          isOpen={eventToReschedule !== null}
          event={eventToReschedule?.event || null}
          newDate={eventToReschedule?.newDate || null}
          conflicts={rescheduleConflicts}
          onConfirm={handleConfirmReschedule}
          onCancel={handleCancelReschedule}
        />

        <div className="bg-[var(--color-bg-primary)] rounded-lg p-4">
          <h3 className="font-semibold text-foreground mb-3">{t("legend")}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-state-warning-500"></div>
              <span className="text-sm text-[var(--color-text-secondary)]">
                {tReservations("statuses.PENDING")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-brand-primary-500"></div>
              <span className="text-sm text-[var(--color-text-secondary)]">
                {tReservations("statuses.CONFIRMED")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-state-success-500"></div>
              <span className="text-sm text-[var(--color-text-secondary)]">
                {tReservations("statuses.IN_PROGRESS")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[var(--color-bg-secondary)]"></div>
              <span className="text-sm text-[var(--color-text-secondary)]">
                {tReservations("statuses.COMPLETED")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-state-error-500"></div>
              <span className="text-sm text-[var(--color-text-secondary)]">
                {tReservations("statuses.CANCELLED")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-state-error-700"></div>
              <span className="text-sm text-[var(--color-text-secondary)]">
                {tReservations("statuses.REJECTED")}
              </span>
            </div>
          </div>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-3">
            {t("tip")}
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
